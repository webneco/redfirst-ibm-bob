# PR: fix(BUG-02): return 404 for unknown item id in GET /items/:id

## Summary

`GET /items/:id` silently returned HTTP 200 with an empty body when the
requested id did not exist. This adds the missing existence guard so the
route returns `404 { error: "Item not found" }` instead.

## Change

**File:** `sample-app/src/routes/items.js`

```diff
 router.get('/:id', (req, res) => {
   const item = store.getItemById(req.params.id);
+  if (!item) return res.status(404).json({ error: 'Item not found' });
   res.json(item);
 });
```

One line added. No other handlers, store methods, or files were changed.

## Tests

- `test/repro/BUG-02.test.js` — was **red**, now **green**.
- Full suite (`npx jest --runInBand --forceExit`) — **9 passed, 0 failed**.

## Checklist

- [x] Failing test exists and referenced BUG-02 before fix
- [x] Root cause fixed (not just symptom suppressed)
- [x] Full test suite passes
- [x] No unrelated changes
- [x] `bugs/BUG-02.md` status updated to `fixed`
