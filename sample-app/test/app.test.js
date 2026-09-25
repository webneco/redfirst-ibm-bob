'use strict';

const fs = require('fs');
const path = require('path');
const request = require('supertest');
const app = require('../src/app');

const DATA_FILE = path.join(__dirname, '../data/items.json');

// Reset the store before each test by wiping the data file and
// re-initialising the in-memory array via the store's loadItems().
beforeEach(() => {
  if (fs.existsSync(DATA_FILE)) {
    fs.rmSync(DATA_FILE);
  }
  // Re-require the store so loadItems() runs fresh against the empty data dir
  jest.resetModules();
});

afterAll(() => {
  if (fs.existsSync(DATA_FILE)) {
    fs.rmSync(DATA_FILE);
  }
});

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------

describe('GET /health', () => {
  test('returns 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

// ---------------------------------------------------------------------------
// Items — happy path only (no buggy cases asserted)
// ---------------------------------------------------------------------------

describe('POST /items', () => {
  test('creates an item with Content-Type application/json and returns 201', async () => {
    const res = await request(app)
      .post('/items')
      .set('Content-Type', 'application/json')
      .send({ name: 'widget', price: 9.99 });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('widget');
    expect(res.body.price).toBe(9.99);
  });
});

describe('GET /items', () => {
  test('returns 200 with an array', async () => {
    const res = await request(app).get('/items');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('includes a previously created item', async () => {
    await request(app)
      .post('/items')
      .set('Content-Type', 'application/json')
      .send({ name: 'gadget' });

    const res = await request(app).get('/items');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });
});

describe('GET /items/:id', () => {
  test('returns 200 and the correct item for a known id', async () => {
    const created = await request(app)
      .post('/items')
      .set('Content-Type', 'application/json')
      .send({ name: 'doohickey' });

    const id = created.body.id;
    const res = await request(app).get(`/items/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(id);
    expect(res.body.name).toBe('doohickey');
  });
  // NOTE: GET /items/:id for an unknown id is NOT tested here (BUG-02).
});

describe('PATCH /items/:id', () => {
  test('returns 200 with updated item when full body is provided', async () => {
    const created = await request(app)
      .post('/items')
      .set('Content-Type', 'application/json')
      .send({ name: 'widget', price: 9.99 });

    const id = created.body.id;

    // Send full body — avoids triggering BUG-04 (omitted fields)
    const res = await request(app)
      .patch(`/items/${id}`)
      .set('Content-Type', 'application/json')
      .send({ name: 'updated-widget', price: 9.99 });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('updated-widget');
  });
  // NOTE: PATCH with a partial body (omitting fields) is NOT tested here (BUG-04).
});

describe('DELETE /items/:id', () => {
  test('returns 200 after deleting an existing item', async () => {
    const created = await request(app)
      .post('/items')
      .set('Content-Type', 'application/json')
      .send({ name: 'disposable' });

    const id = created.body.id;
    const res = await request(app).delete(`/items/${id}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ deleted: true });
  });

  test('item is gone from GET /items after delete (in-process)', async () => {
    const created = await request(app)
      .post('/items')
      .set('Content-Type', 'application/json')
      .send({ name: 'temporary' });

    const id = created.body.id;
    await request(app).delete(`/items/${id}`);

    const list = await request(app).get('/items');
    const found = list.body.find((i) => i.id === id);
    expect(found).toBeUndefined();
  });
  // NOTE: DELETE persistence across restarts is NOT tested here (BUG-03).
});
