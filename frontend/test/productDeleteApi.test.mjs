import assert from 'node:assert/strict';
import { test } from 'node:test';
import { deleteProduct } from '../src/api/productApi.ts';

test('deletes the requested product with the authenticated session and accepts an empty response', async t => {
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(new URL(url, 'http://example.test').pathname, '/api/product/42');
    assert.equal(options.method, 'DELETE');
    assert.equal(options.credentials, 'include');
    return new Response(null, {status:204});
  });
  await deleteProduct(42);
});

test('shows the server deletion conflict instead of a duplicate-product error', async t => {
  t.mock.method(globalThis, 'fetch', async () => Response.json({message:'This product is used by an order.'}, {status:409}));
  await assert.rejects(deleteProduct(42), {message:'This product is used by an order.'});
});

test('reports deletion failure when the error response is not JSON', async t => {
  t.mock.method(globalThis, 'fetch', async () => new Response('Unavailable', {status:503}));
  await assert.rejects(deleteProduct(42), /Failed to delete product/);
});
