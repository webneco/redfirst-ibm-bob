# BUG-02 — GET /items/:id returns 200 with empty body for unknown IDs

**Severity:** P2
**Status:** open
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

- `sample-app/src/routes/items.js` — GET by ID handler
- `sample-app/src/store/items.js` — in-memory store lookup

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
