# BUG-02 Triage — GET /items/:id returns 200 for unknown IDs

**Date:** 2026-09-26  
**Status:** triaged — no production code or tests modified  
**Source:** `bugs/BUG-02.md`

---

## 1. Handler — `GET /items/:id`

**File:** `sample-app/src/routes/items.js` line 36–39

```js
router.get('/:id', (req, res) => {
  const item = store.getItemById(req.params.id);
  // no guard — item may be undefined
  res.json(item);
});
```

`res.json(undefined)` is called unconditionally. When the id is unknown,
Express serialises an empty body and responds with HTTP 200. There is no
existence check between the store call and the response.

---

## 2. Store — `getItemById` is Correct

**File:** `sample-app/src/store/items.js` lines 30–32

```js
function getItemById(id) {
  return items.find((item) => item.id === id);
}
```

`Array.prototype.find` returning `undefined` on no-match is standard
JavaScript behaviour. The store requires no change. The defect is
entirely in the route handler.

---

## 3. Existing Tests — Coverage Gap

**File:** `sample-app/test/app.test.js` lines 75–89

```js
describe('GET /items/:id', () => {
  test('returns 200 and the correct item for a known id', …); // happy path only
  // NOTE: GET /items/:id for an unknown id is NOT tested here (BUG-02).
});
```

| Scenario | Covered? |
|---|---|
| Known id → 200 + item body | ✅ yes (line 76) |
| Unknown id → 404 + error body | ❌ **missing** (noted line 88) |

---

## 4. Current Behaviour

When `GET /items/99999` is requested and `99999` is not in the store:

1. `store.getItemById("99999")` → `undefined`
2. `res.json(undefined)` → Express writes an empty body
3. HTTP status defaults to **200 OK**

Matches the observed behaviour in `bugs/BUG-02.md`:
> HTTP 200 OK with an empty response body (or `null`).

---

## 5. Proposed Fix (NOT applied — RedFirst gate requires failing test first)

Insert a single guard in `sample-app/src/routes/items.js` at line 39,
between the store call and `res.json(item)`:

```js
if (!item) return res.status(404).json({ error: 'Item not found' });
```

No changes are required in the store or any other file.

---

## 6. Next Steps (RedFirst sequence)

1. Write a **failing test** referencing BUG-02 that asserts `status 404`
   and `body.error === 'Item not found'` for an unknown id.
2. Confirm the test is **red** (exits non-zero).
3. Record failing output in `bugs/BUG-02.md`.
4. Apply the one-line guard above.
5. Confirm suite is green; update `bugs/BUG-02.md` status to `fixed`.
