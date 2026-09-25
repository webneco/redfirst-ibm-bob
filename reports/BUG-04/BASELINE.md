# BUG-04 Baseline Report

## Files Changed

- `sample-app/src/store/items.js` — one-line fix in `updateItem`

## Change

**Before:**
```js
const updated = { id, ...patch };
```

**After:**
```js
const updated = { ...items[index], ...patch };
```

The original code constructed the replacement object from only `id` and the incoming patch fields, discarding all other stored fields. Spreading the existing item first ensures omitted fields are preserved; the patch fields then overwrite only what was explicitly provided.

## Test Written

No new test was written.
