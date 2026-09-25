# BUG-01 — POST /items returns 500 when request body is missing Content-Type header

**Severity:** P2
**Status:** open
**Assigned to:** (unassigned)

## Reproduction Steps

1. Start the sample-app server (`npm start`).
2. Send a POST request to `/items` with a JSON body but **without** a `Content-Type: application/json` header:
   ```bash
   curl -X POST http://localhost:3000/items -d '{"name":"widget"}'
   ```
3. Observe the response.

## Observed Behaviour

HTTP 500 Internal Server Error. Server log shows:
```
TypeError: Cannot read properties of undefined (reading 'name')
    at POST /items handler
```

## Expected Behaviour

HTTP 400 Bad Request with a JSON error body:
```json
{ "error": "Content-Type must be application/json" }
```

## Scope

- `sample-app/src/routes/items.js` — POST handler
- `sample-app/src/middleware/validateContentType.js` (does not exist yet)

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
