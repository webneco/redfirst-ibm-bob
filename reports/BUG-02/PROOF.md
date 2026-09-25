# BUG-02 — Proof of Fix

## Root Cause

`sample-app/src/routes/items.js` — the `GET /items/:id` handler called
`res.json(item)` without first checking whether `item` was `undefined`.
`store.getItemById()` uses `Array.prototype.find`, which returns `undefined`
when no record matches the requested id. `res.json(undefined)` causes Express
to respond with HTTP 200 and an empty body instead of a 404 error.

## One-Line Fix

```diff
-  // BUG-02: should be: if (!item) return res.status(404).json({ error: 'Item not found' });
+  if (!item) return res.status(404).json({ error: 'Item not found' });
```

**File:** `sample-app/src/routes/items.js`, inside `router.get('/:id', ...)`.

## Red-to-Green Commands

```bash
# Confirm red (before fix)
cd sample-app
npx jest test/repro/BUG-02.test.js --runInBand --forceExit
# → 1 failed

# Apply fix (the guard inserted above)

# Confirm green (after fix)
npx jest test/repro/BUG-02.test.js --runInBand --forceExit
# → 1 passed

# Full suite — no regressions
npx jest --runInBand --forceExit
# → 9 passed, 0 failed
```

## Full Suite Output (post-fix)

```
PASS test/app.test.js
PASS test/repro/BUG-02.test.js

Test Suites: 2 passed, 2 total
Tests:       9 passed, 9 total
Time:        1.428 s
```

## Other Bugs Not Modified

- **BUG-01** — `sample-app/src/routes/items.js` `POST /` handler: **not touched**.
- **BUG-03** — `sample-app/src/routes/items.js` `DELETE /items/:id` handler and
  store persistence: **not touched**.
- **BUG-04** — `sample-app/src/routes/items.js` `PATCH /items/:id` handler and
  `store.updateItem`: **not touched**.

Only the three lines inside `router.get('/:id', ...)` were changed (the
stale comment was removed and the guard was inserted). No other handler,
store method, or file was modified.
