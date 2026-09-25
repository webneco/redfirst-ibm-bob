# BUG-04 — PATCH /items/:id overwrites unspecified fields with undefined

**Severity:** P2
**Status:** open
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

(to be filled after failing test is written)

## Test

(to be filled after failing test is written)

## Failing Test Output

(to be filled after failing test is written)

## Fix Summary

(to be filled after fix is merged)
