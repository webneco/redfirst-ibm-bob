# Pull Request — BUG-04

## Title

fix(BUG-04): preserve unpatched fields in PATCH /items/:id

## Branch

`fix/BUG-04` → `main`

## Summary

`PATCH /items/:id` was silently discarding every stored field that was absent
from the request body.  A POST to create `{ name, price }` followed by a PATCH
of only `name` would return a record where `price` was `undefined`.

## Root Cause

[`store/items.js → updateItem`](../sample-app/src/store/items.js) built the
replacement object as `{ id, ...patch }`, creating a brand-new object with
only the id and the incoming patch keys.

## Fix

One line in `sample-app/src/store/items.js`:

```diff
- const updated = { id, ...patch };
+ const updated = { ...items[index], ...patch };
```

No other production code was changed.

## Tests

- **New:** `sample-app/test/repro/BUG-04.test.js`
  - Was confirmed **red** on `main` before the fix (see `reports/BUG-04/REPRO.md`).
  - Is now **green** after the fix.
- **Full suite:** 10/10 tests pass across all 3 test suites.

## Files Changed

| File | Change |
|---|---|
| `sample-app/src/store/items.js` | One-line fix in `updateItem` |
| `sample-app/test/repro/BUG-04.test.js` | New repro test (written before fix) |
| `bugs/BUG-04.md` | Status → `fixed` |
| `reports/BUG-04/REPRO.md` | Red run on record |
| `reports/BUG-04/PROOF.md` | Green run + contrast vs baseline |
| `reports/BUG-04/PR.md` | This file |

## Checklist

- [x] Failing test written and confirmed red before fix applied
- [x] Fix addresses root cause, not symptom
- [x] No other production endpoints (GET, POST, DELETE) modified
- [x] Full test suite passes (10/10)
- [x] `bugs/BUG-04.md` status updated to `fixed`
- [x] One bug per PR — no unrelated changes bundled
