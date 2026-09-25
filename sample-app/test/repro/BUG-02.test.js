'use strict';
// BUG-02 — GET /items/:id returns 200 with empty body for unknown IDs
// Repro test: must FAIL on current code.
// Expected: 404 + { error: "Item not found" }
// Observed: 200 with empty body (res.json(undefined) in items.js:39)

const request = require('supertest');
const app = require('../../src/app');

describe('BUG-02 — GET /items/:id with unknown id', () => {
  test('returns 404 with { error: "Item not found" } for a non-existent id', async () => {
    const res = await request(app).get('/items/99999');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Item not found' });
  });
});
