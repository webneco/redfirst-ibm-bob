# BUG-04 Triage

## Title
PATCH /items/:id silently discards all fields not included in the request body

## Severity
High — any PATCH request permanently overwrites stored fields with `undefined`, corrupting the item silently with a 200 OK response.

## Reproduction Steps
1. Start the sample-app server.
2. POST a new item with multiple fields, e.g. `{ "name": "widget", "price": 9.99 }`.
3. PATCH that item with a single field, e.g. `PATCH /items/:id` body `{ "price": 12.00 }`.
4. GET the item and inspect the response body.

## Observed
The returned item contains only `id` and `price`; the `name` field (and any other field not present in the patch body) is `undefined` / missing.

## Expected
Only the fields present in the patch body are updated; all other fields retain their previous values.

## Scope
**Root cause — [`store/items.js` line 46](../../sample-app/src/store/items.js:46):**

```js
// BUGGY
const updated = { id, ...patch };
```

The object is assembled from only `id` plus the incoming `patch`. Every stored field that is absent from `patch` is dropped.

**Fix identified (branch `baseline-bug04`, not on `main`):**

```js
// CORRECT
const updated = { ...items[index], ...patch };
```

Spreading the existing item first preserves all stored fields; the patch fields then overwrite only what was explicitly provided.

**`routes/items.js` PATCH handler** — reviewed and confirmed correct; it passes `req.body` straight through to `store.updateItem`, so the handler is not implicated.

## Environment
- Codebase: `sample-app/src/store/items.js`
- Branch where root cause lives: `main`
- Branch with candidate fix (no test): `baseline-bug04`

## Status
`open` — intake filed; no failing test yet.

## Next Step
Write a failing repro test (referencing BUG-04) that:
- creates an item with at least two fields,
- PATCHes only one of them,
- asserts the untouched field is still present in the response.

Do **not** apply the fix until the test is confirmed red.
