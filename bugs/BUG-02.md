# BUG-02 — GET /items/:id returns 200 with empty body for unknown IDs

**Severity:** P2
**Status:** test-written
**Assigned to:** (unassigned)

## Reproduction Steps

1. Start the sample-app server (`npm start`).
2. Request an item ID that does not exist:
   ```bash
   curl http://localhost:3000/items/99999
   ```
3. Observe the response.

## Observed Behaviour

HTTP 200 OK with an empty response body (or `null`).

## Expected Behaviour

HTTP 404 Not Found with a JSON error body:
```json
{ "error": "Item not found" }
```

## Scope

- `sample-app/src/routes/items.js:39` — `res.json(item)` called without an existence guard; this is the only line that needs to change

## Environment

- Node 20.x
- Express 4.x
- macOS / Linux

## Root Cause Hypothesis

The `GET /items/:id` route handler at `sample-app/src/routes/items.js:39` calls `res.json(item)` without first checking whether `item` is `undefined`. When `store.getItemById()` finds no record matching the requested id it returns `undefined` (standard `Array.prototype.find` behaviour), and `res.json(undefined)` causes Express to serialise an empty body and respond with HTTP 200. The store itself is correct; the entire defect is the missing guard in the route handler. A single conditional — `if (!item) return res.status(404).json({ error: 'Item not found' });` — inserted before `res.json(item)` is the complete fix.

> Full triage captured in-chat 2026-09-26. reports/BUG-02/TRIAGE.md will be written in a docs-only follow-up.

## Test

`sample-app/test/repro/BUG-02.test.js`

```
npx jest test/repro/BUG-02.test.js --runInBand --forceExit
```

STATUS: RED

## Failing Test Output

```
FAIL test/repro/BUG-02.test.js
  BUG-02 — GET /items/:id with unknown id
    × returns 404 with { error: "Item not found" } for a non-existent id (19 ms)

  ● returns 404 with { error: "Item not found" } for a non-existent id

    expect(received).toBe(expected) // Object.is equality

    Expected: 404
    Received: 200

    > 14 |     expect(res.status).toBe(404);
         |                        ^
    15 |     expect(res.body).toEqual({ error: 'Item not found' });

Tests: 1 failed, 1 total
Time:  0.728 s
```

## Fix Summary

(to be filled after fix is merged)
