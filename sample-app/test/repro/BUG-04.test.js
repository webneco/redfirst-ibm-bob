'use strict';
// BUG-04 — PATCH /items/:id silently discards fields not in the request body
// Repro test: must FAIL on current code.
// Expected: price is preserved (9.99) after patching only name
// Observed: price is undefined/missing because store assembles { id, ...patch }

const request = require('supertest');
const app = require('../../src/app');

describe('BUG-04 — PATCH /items/:id preserves unpatched fields', () => {
  test('price remains 9.99 after patching only the name field', async () => {
    // 1. Create item with two fields
    const createRes = await request(app)
      .post('/items')
      .send({ name: 'widget', price: 9.99 })
      .set('Content-Type', 'application/json');

    expect(createRes.status).toBe(201);
    const id = createRes.body.id;

    // 2. Patch only the name
    const patchRes = await request(app)
      .patch(`/items/${id}`)
      .send({ name: 'gadget' })
      .set('Content-Type', 'application/json');

    expect(patchRes.status).toBe(200);

    // 3. price must still be 9.99 — this is the assertion that exposes BUG-04
    expect(patchRes.body.price).toBe(9.99);
  });
});
