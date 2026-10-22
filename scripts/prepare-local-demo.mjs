import { randomBytes } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Deliberately local-only: this helper never creates accounts on the public site.
const base = new URL(process.env.DEMO_API_URL || 'http://localhost:5252');
if (!['localhost', '127.0.0.1', '[::1]'].includes(base.hostname) || !['http:', 'https:'].includes(base.protocol)) {
    throw new Error('DEMO_API_URL must point to a local development API.');
}
const credentialPath = fileURLToPath(new URL('../.demo-credentials.local.json', import.meta.url));

async function request(route, body) {
    const response = await fetch(new URL(route, base), {
        method: body ? 'POST' : 'GET',
        headers: body ? { 'Content-Type': 'application/json' } : {},
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error(`${route} returned HTTP ${response.status}. Check the local API and database.`);
    return response;
}

await request('/health/ready');
let credentials;
try {
    credentials = JSON.parse(await readFile(credentialPath, 'utf8'));
    if (credentials.apiUrl !== base.origin) throw new Error('Saved demo credentials belong to another local API.');
} catch (error) {
    if (error.code !== 'ENOENT') throw error;
    const suffix = randomBytes(4).toString('hex');
    credentials = {
        apiUrl: base.origin,
        userName: `demo_shopper_${suffix}`,
        email: `demo.shopper.${suffix}@example.test`,
        password: `Demo!7${randomBytes(18).toString('base64url')}`,
        role: 'User',
    };
    await request('/api/auth/register', credentials);
    await writeFile(credentialPath, JSON.stringify(credentials, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
}
const response = await request('/api/auth/login', { email: credentials.email, password: credentials.password });
const user = await response.json();
if (!user.roles?.includes('User') || user.roles.includes('Admin')) {
    throw new Error('The local demo account must have the customer role only.');
}
console.log(`Local customer demo account verified: ${credentials.userName}`);
console.log(`Credentials saved privately in ${path.basename(credentialPath)} (ignored by Git).`);
console.log('Use the email and password from that file on http://localhost:5173/login.');
