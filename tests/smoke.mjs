import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import net from 'node:net';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { test } from 'node:test';

// Exercise the published application, including its real routing and static assets.
// A deliberately unreachable database proves the website can start independently.
test('published website stays usable while the database is unavailable', { timeout: 45000 }, async (t) => {
  const listener = net.createServer();
  listener.listen(0, '127.0.0.1');
  await once(listener, 'listening');
  const port = listener.address().port;
  await new Promise((resolve) => listener.close(resolve));
  const publishDir = path.resolve(process.argv[2] ?? 'publish');
  const app = spawn('dotnet', [path.join(publishDir, 'Supermarket.Api.dll')], {
    cwd: publishDir,
    env: {
      ...process.env,
      ASPNETCORE_ENVIRONMENT: 'Production',
      DOTNET_ENVIRONMENT: 'Production',
      ASPNETCORE_URLS: `http://127.0.0.1:${port}`,
      ConnectionStrings__DefaultConnection: 'Server=127.0.0.1,1;Database=SmokeTest;User Id=smoke;Password=local-test-only;Connect Timeout=1;Encrypt=False',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let logs = '';
  app.stdout.on('data', (chunk) => { logs += chunk; });
  app.stderr.on('data', (chunk) => { logs += chunk; });
  t.after(async () => {
    if (app.exitCode === null && app.signalCode === null) {
      const exited = once(app, 'exit');
      app.kill();
      await exited;
    }
  });
  const base = `http://127.0.0.1:${port}`;
  let homepage;
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      homepage = await fetch(`${base}/`, { signal: AbortSignal.timeout(1000) });
      break;
    } catch {
      if (app.exitCode !== null) break;
      await delay(200);
    }
  }
  assert.ok(homepage, `Application did not start with an unavailable database. Output: ${logs}`);
  assert.equal(homepage.status, 200);
  const html = await homepage.text();
  assert.match(html, /<div id="root"><\/div>/);
  const login = await fetch(`${base}/login`);
  assert.equal(login.status, 200);
  assert.equal(await login.text(), html);
  const script = html.match(/src="([^"]+\.js)"/);
  assert.ok(script, 'Homepage must load a built JavaScript asset');
  const javascript = await fetch(new URL(script[1], base));
  assert.equal(javascript.status, 200);
  assert.match(javascript.headers.get('content-type'), /javascript/);
  assert.doesNotMatch(await javascript.text(), /localhost:5252/);
  assert.equal((await fetch(`${base}/assets/missing.js`)).status, 404);
  assert.equal((await fetch(`${base}/health/live`)).status, 200);
  assert.equal((await fetch(`${base}/health/ready`)).status, 503);
  assert.equal((await fetch(`${base}/health/unknown`)).status, 404);
  const api = await fetch(`${base}/api/auth/me`);
  assert.equal(api.status, 503);
  assert.match(api.headers.get('content-type'), /application\/problem\+json/);
  assert.equal((await api.json()).title, 'Database unavailable');
  const unknownApi = await fetch(`${base}/api/unknown`);
  assert.notEqual(unknownApi.status, 200);
  assert.doesNotMatch(await unknownApi.text(), /<div id="root">/);
});
