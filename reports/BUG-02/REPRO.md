# BUG-02 — Reproduction Report

## Status: RED ✗

## Repro Test

**File:** `sample-app/test/repro/BUG-02.test.js`

```
npx jest test/repro/BUG-02.test.js --runInBand --forceExit
```

## Failing Assertion

```
● BUG-02 — GET /items/:id with unknown id
  › returns 404 with { error: "Item not found" } for a non-existent id

  expect(received).toBe(expected) // Object.is equality

  Expected: 404
  Received: 200

  > 14 |     expect(res.status).toBe(404);
       |                        ^
    15 |     expect(res.body).toEqual({ error: 'Item not found' });
```

## What the test does

- Issues `GET /items/99999` (an id that will never exist in the store).
- Asserts `res.status === 404`.
- Asserts `res.body` deep-equals `{ error: "Item not found" }`.

## Why it fails on current code

`sample-app/src/routes/items.js` line 39:

```js
router.get('/:id', (req, res) => {
  const item = store.getItemById(req.params.id);
  // BUG-02: no existence guard — calls res.json(undefined)
  res.json(item);           // ← Express sends HTTP 200, empty body
});
```

`store.getItemById()` returns `undefined` for an unknown id (standard
`Array.prototype.find` behaviour). `res.json(undefined)` causes Express to
respond with `HTTP 200` and an empty body instead of `404`.

## Fix (not applied here)

Insert a guard before `res.json(item)`:

```js
if (!item) return res.status(404).json({ error: 'Item not found' });
```

## Test run output

```
FAIL test/repro/BUG-02.test.js
  BUG-02 — GET /items/:id with unknown id
    × returns 404 with { error: "Item not found" } for a non-existent id (19 ms)

Tests: 1 failed, 1 total
Time:  0.728 s
```
