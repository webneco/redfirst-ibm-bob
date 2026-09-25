# BUG-04 — Repro Report

## STATUS: RED

The repro test fails on `main` with the bug intact.  
Do **not** apply the fix until this report is on record.

---

## Test file

`sample-app/test/repro/BUG-04.test.js`

## Command

```
cd sample-app
npx jest test/repro/BUG-04.test.js --runInBand --forceExit
```

## Jest output

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
      32 | });
      33 |

      at Object.toBe (test/repro/BUG-04.test.js:30:33)

Test Suites: 1 failed, 1 total
Tests:       1 failed, 1 total
Snapshots:   0 total
Time:        0.919 s
Ran all test suites matching /test\repro\BUG-04.test.js/i.
Force exiting Jest: Have you considered using `--detectOpenHandles` to detect async operations that kept running after all tests finished?
```

## What the failure proves

After `POST /items { "name": "widget", "price": 9.99 }` and  
`PATCH /items/:id { "name": "gadget" }`, the PATCH response body has  
`price: undefined` instead of `9.99`.

Root cause confirmed: [`store/items.js`](../../sample-app/src/store/items.js)  
assembles the updated record as `{ id, ...patch }`, discarding every stored  
field that is absent from the patch body.

## Next step

Fix `const updated = { id, ...patch }` → `const updated = { ...items[index], ...patch }`  
then confirm this test goes **green** and the full suite passes.
