import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// Read-only by default. --checkout creates one simulated local order using one unit of stock.
const credentials = JSON.parse(await readFile(new URL('../.demo-credentials.local.json', import.meta.url), 'utf8'));
const base = new URL(credentials.apiUrl);
if (!['localhost', '127.0.0.1', '[::1]'].includes(base.hostname)) throw new Error('Only local demo environments are supported.');
const cookies = new Map();

async function request(route, body) {
    const response = await fetch(new URL(route, base), {
        method: body ? 'POST' : 'GET',
        headers: {
            ...(body ? { 'Content-Type': 'application/json' } : {}),
            Cookie: [...cookies].map(([name, value]) => `${name}=${value}`).join('; '),
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(15000),
    });
    for (const cookie of response.headers.getSetCookie()) {
        const [pair] = cookie.split(';');
        const equals = pair.indexOf('=');
        const name = pair.slice(0, equals);
        const value = pair.slice(equals + 1);
        if (value) cookies.set(name, value);
        else cookies.delete(name);
    }
    return response;
}

const login = await request('/api/auth/login', { email: credentials.email, password: credentials.password });
assert.equal(login.status, 200, 'Demo login must succeed.');
try {
    assert.equal((await request('/api/auth/me')).status, 200, 'The session cookie must authenticate subsequent requests.');
    const catalog = await request('/api/product');
    assert.equal(catalog.status, 200);
    const products = await catalog.json();
    assert.ok(Array.isArray(products));
    const orders = await request('/api/order/mine');
    assert.equal(orders.status, 200);
    assert.ok(Array.isArray(await orders.json()));
    console.log(`PASS: customer login, session cookie, catalog (${products.length} products), own order history.`);

    if (process.argv.includes('--checkout')) {
        const product = products.filter(p => p.count > 0).sort((a, b) => a.price - b.price)[0];
        assert.ok(product, 'Add an in-stock product in the admin UI before testing a purchase.');
        const checkout = await request('/api/order/checkout', { items: [{ productId: product.id, quantity: 1 }] });
        assert.equal(checkout.status, 200, 'Simulated checkout must succeed.');
        const result = await checkout.json();
        assert.equal(result.totalAmount, product.price, 'The database price determines the total.');
        const history = await (await request('/api/order/mine')).json();
        assert.ok(history.some(order => order.id === result.orderId && order.items.some(item => item.productId === product.id && item.quantity === 1)));
        const updated = await (await request(`/api/product/${product.id}`)).json();
        assert.equal(updated.count, product.count - 1, 'Exactly one unit of stock must be deducted.');
        console.log(`PASS: simulated order ${result.orderId}, saved history, trusted price and one-unit stock deduction.`);
    }
} finally {
    const logout = await request('/api/auth/logout', {});
    assert.equal(logout.status, 200);
    assert.equal((await request('/api/auth/me')).status, 401, 'The expired browser cookie must no longer authenticate.');
    console.log('PASS: logout clears the session cookie.');
}
