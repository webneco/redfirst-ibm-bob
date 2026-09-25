# BUG-04 — PATCH /items/:id overwrites unspecified fields with undefined

**Severity:** P2
**Status:** fixed
**Assigned to:** (unassigned)

## Reproduction Steps

1. Start the sample-app server (`npm start`).
2. Create an item with two fields:
   ```bash
   curl -X POST http://localhost:3000/items \
     -H "Content-Type: application/json" \
     -d '{"name":"widget","price":9.99}'
   # note the returned id
   ```
3. PATCH only the `name` field:
   ```bash
   curl -X PATCH http://localhost:3000/items/<id> \
     -H "Content-Type: application/json" \
     -d '{"name":"gadget"}'
   ```
4. Fetch the item:
   ```bash
   curl http://localhost:3000/items/<id>
   ```

## Observed Behaviour

Response body:
```json
{ "id": "<id>", "name": "gadget", "price": null }
```
`price` is `null` (or `undefined`) — the unpatched field was erased.

## Expected Behaviour

```json
{ "id": "<id>", "name": "gadget", "price": 9.99 }
```
Only the fields included in the PATCH body should change.

## Scope

- `sample-app/src/routes/items.js` — PATCH handler
- `sample-app/src/store/items.js` — update logic

## Environment

- Node 20.x
- Express 4.x
- macOS / Linux

## Root Cause Hypothesis

`updateItem` in `sample-app/src/store/items.js` assembled the replacement
record as `{ id, ...patch }`.  Every stored field absent from `patch` was
silently discarded.

## Test

`sample-app/test/repro/BUG-04.test.js` — confirmed red on `main` before fix;
see `reports/BUG-04/REPRO.md`.

## Failing Test Output

```
Expected: 9.99
Received: undefined
    at Object.toBe (test/repro/BUG-04.test.js:30:33)
```

## Fix Summary

One-line change in `sample-app/src/store/items.js → updateItem`:

```diff
- const updated = { id, ...patch };
+ const updated = { ...items[index], ...patch };
```

Full suite: 10/10 tests pass.  See `reports/BUG-04/PROOF.md`.
