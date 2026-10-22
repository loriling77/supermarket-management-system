import assert from 'node:assert/strict';
import { test } from 'node:test';
import { addProductToCart } from '../src/utils/cart.ts';

const product = { id: 1, productName: 'Apples', price: 2.5, count: 5 };

test('adds the chosen quantity without mutating the original cart', () => {
  const original = [];
  const result = addProductToCart(original, product, 2);
  assert.deepEqual(result, [{productId:1, productName:'Apples', unitPrice:2.5, quantity:2}]);
  assert.deepEqual(original, []);
});

test('adding the same product again accumulates the quantity in one row', () => {
  const original = [{productId:1, productName:'Apples', unitPrice:2.5, quantity:2}];
  const result = addProductToCart(original, product, 3);
  assert.equal(result.length, 1);
  assert.equal(result[0].quantity, 5);
  assert.equal(original[0].quantity, 2);
});

test('rejects additions exceeding stock, including sequential additions', () => {
  const original = [{productId:1, productName:'Apples', unitPrice:2.5, quantity:4}];
  assert.strictEqual(addProductToCart(original, product, 2), original);
  const full = addProductToCart(original, product, 1);
  assert.strictEqual(addProductToCart(full, product, 1), full);
});

test('rejects zero, negative, fractional, non-finite, and unsafe quantities', () => {
  for (const quantity of [0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    const original = [];
    assert.strictEqual(addProductToCart(original, product, quantity), original);
  }
});

test('out-of-stock products cannot be added', () => {
  const original = [];
  assert.strictEqual(addProductToCart(original, {...product, count:0}, 1), original);
});

test('preserves unrelated cart items', () => {
  const original = [{productId:2, productName:'Milk', unitPrice:1.2, quantity:1}];
  const result = addProductToCart(original, product, 2);
  assert.deepEqual(result[0], original[0]);
  assert.equal(result[1].quantity, 2);
});
