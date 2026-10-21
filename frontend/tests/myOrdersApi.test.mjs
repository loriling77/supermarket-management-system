import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getMySuccessfulOrders } from '../src/api/checkOutApi.ts';

test('loads the current customer orders using the session cookie and no user ID', async t => {
  const orders = [{id:42, createdAt:'2026-10-21T12:00:00Z', status:'Paid', totalAmount:5, items:[]}];
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(new URL(url).pathname, '/api/order/mine');
    assert.equal(new URL(url).search, '');
    assert.equal(options.credentials, 'include');
    assert.equal(options.method, 'GET');
    return Response.json(orders);
  });
  assert.deepEqual(await getMySuccessfulOrders(), orders);
});

test('reports an expired session instead of treating it as an empty history', async t => {
  t.mock.method(globalThis, 'fetch', async () => new Response('', {status:401}));
  await assert.rejects(getMySuccessfulOrders(), /session has expired/i);
});

test('surfaces a server failure so the page can offer retry', async t => {
  t.mock.method(globalThis, 'fetch', async () => new Response('', {status:503}));
  await assert.rejects(getMySuccessfulOrders(), /Unable to load your orders/i);
});
