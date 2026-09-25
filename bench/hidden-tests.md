# Benchmark: Hidden Tests

These test descriptions define the scoring scenarios used by hackathon judges.
**No implementation is provided here.** The actual test files live outside this
repository and are applied against the `sample-app` by the judging harness.

Each scenario maps to one of the four tracked bugs. Passing a scenario earns
the points listed. Partial credit is not awarded within a scenario.

---

## Scenario 1 — Missing Content-Type (BUG-01) — 25 pts

**What the harness tests:**
- POST to `/items` with a JSON body and no `Content-Type` header → HTTP 400
- POST to `/items` with `Content-Type: text/plain` → HTTP 400
- POST to `/items` with `Content-Type: application/json` → HTTP 201

**Pass criteria:** all three assertions must return the exact HTTP status codes
listed above, and the 400 responses must include a JSON body with an `"error"`
key.

---

## Scenario 2 — Not-Found Handling (BUG-02) — 25 pts

**What the harness tests:**
- GET `/items/nonexistent-id` → HTTP 404
- GET `/items/nonexistent-id` response body contains `{ "error": "Item not found" }`
- GET `/items/<valid-id>` after creation → HTTP 200

**Pass criteria:** status codes and error body shape must match exactly.

---

## Scenario 3 — Delete Persistence (BUG-03) — 25 pts

**What the harness tests:**
- POST an item, DELETE it, then GET it → HTTP 404 (within the same process)
- POST an item, DELETE it, simulate a process restart (reset module state),
  then GET it → HTTP 404

**Pass criteria:** the item must be absent both in-process and after a
simulated restart. The harness resets module-level state between the two
sub-checks.

---

## Scenario 4 — Partial PATCH (BUG-04) — 25 pts

**What the harness tests:**
- POST `{ "name": "widget", "price": 9.99 }`, PATCH `{ "name": "gadget" }`,
  GET → `price` must still be `9.99`
- POST `{ "name": "widget", "price": 9.99 }`, PATCH `{ "price": 14.99 }`,
  GET → `name` must still be `"widget"`

**Pass criteria:** only the patched fields change; all others are preserved.

---

## Bonus: Full RedFirst Discipline (10 pts)

The judging harness also inspects the repository for:
- All four `bugs/BUG-XX.md` files present with `**Status:** merged`
- Each bug file contains a non-empty `## Test` section
- Each bug file contains a non-empty `## Root Cause Hypothesis` section
- `bob_sessions/` contains at least one exported session showing the
  triage → test → fix sequence

**Pass criteria:** all four bullet points satisfied.
