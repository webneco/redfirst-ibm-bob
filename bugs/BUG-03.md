# BUG-03 — DELETE /items/:id does not persist; item reappears after server restart

**Severity:** P3
**Status:** open
**Assigned to:** (unassigned)

## Reproduction Steps

1. Start the sample-app server (`npm start`).
2. Create an item:
   ```bash
   curl -X POST http://localhost:3000/items \
     -H "Content-Type: application/json" \
     -d '{"name":"to-delete"}'
   # note the returned id
   ```
3. Delete the item:
   ```bash
   curl -X DELETE http://localhost:3000/items/<id>
   ```
4. Confirm the DELETE returns 200.
5. Restart the server (`Ctrl-C`, `npm start`).
6. Request the deleted item:
   ```bash
   curl http://localhost:3000/items/<id>
   ```

## Observed Behaviour

HTTP 200 with the item data — the item reappears after restart.

## Expected Behaviour

HTTP 404 — the item should remain deleted across restarts.

## Scope

- `sample-app/src/store/items.js` — persistence layer
- `sample-app/data/` — JSON data directory (may not exist)

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
