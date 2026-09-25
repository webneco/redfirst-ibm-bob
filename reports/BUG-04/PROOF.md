# BUG-04 — Proof of Fix

## Root Cause

`store/items.js → updateItem` assembled the replacement record as
`{ id, ...patch }`.  
This creates a brand-new object containing only the item's `id` plus whatever
fields arrived in the PATCH body.  Every stored field that was **absent** from
`patch` (e.g. `price` when the caller only sent `name`) was silently dropped,
corrupting the item on every successful PATCH.

## One-Line Fix

```diff
- const updated = { id, ...patch };
+ const updated = { ...items[index], ...patch };
```

Spreading the existing item first preserves all stored fields; the incoming
patch keys then overwrite only what was explicitly provided.

---

## Red-to-Green Test Output

### BEFORE fix — STATUS: RED (from `reports/BUG-04/REPRO.md`)

```
FAIL test/repro/BUG-04.test.js
  BUG-04 — PATCH /items/:id preserves unpatched fields
    × price remains 9.99 after patching only the name field (155 ms)

  ● BUG-04 — PATCH /items/:id preserves unpatched fields › price remains 9.99 after patching only the name field

    expect(received).toBe(expected) // Object.is equality

    Expected: 9.99
    Received: undefined

      28 |
      29 |     // 3. price must still be 9.99 — this is the assertion that exposes BUG-04
    > 30 |     expect(patchRes.body.price).toBe(9.99);
         |                                 ^
      31 |   });

Test Suites: 1 failed, 1 total
Tests:       1 failed, 1 total
```

### AFTER fix — STATUS: GREEN

```
PASS test/repro/BUG-04.test.js
  BUG-04 — PATCH /items/:id preserves unpatched fields
    √ price remains 9.99 after patching only the name field (123 ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Time:        0.863 s
```

### Full suite — all green

```
PASS test/app.test.js
PASS test/repro/BUG-04.test.js
PASS test/repro/BUG-02.test.js

Test Suites: 3 passed, 3 total
Tests:       10 passed, 10 total
Time:        1.39 s
```

---

## Contrast: `baseline-bug04` vs. this fix

Branch `baseline-bug04` applied the **identical one-line change** to
`store/items.js` — and nothing else.  It shipped with **zero tests**.

That means:

| | `baseline-bug04` | This fix (RedFirst) |
|---|---|---|
| Code change | ✅ correct | ✅ correct |
| Failing repro test written first | ❌ none | ✅ `test/repro/BUG-04.test.js` confirmed red |
| Test proves the bug existed | ❌ | ✅ REPRO.md on record |
| Regression protection going forward | ❌ | ✅ test stays in suite |
| Full suite passes | unknown | ✅ 10/10 |

Without the RedFirst gate, the same one-line fix could be silently reverted in
a future refactor and no CI check would catch it.  The test is the permanent
safety net.
