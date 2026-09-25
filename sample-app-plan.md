# Plan: sample-app Implementation (Buggy Benchmark Target)

## Overview

Implement a minimal Node.js 20 + Express 4 items REST API under `sample-app/`.
The app ships **with four intentional defects** that match the open bug tickets
(BUG-01 through BUG-04). The visible test suite (`npm test`) must be green and
must not assert the buggy cases. Hidden tests live in `sample-app/test/hidden/`
and are left empty for now.

Items are persisted to `sample-app/data/items.json` so that restart behaviour
(BUG-03) is testable without any in-memory state assumptions.

---

## File Tree

```
sample-app/
  package.json
  .gitignore              (node_modules, data/items.json)
  README.md               (update existing placeholder)
  src/
    app.js                (creates Express app, wires middleware + routes, exports app — no listen)
    server.js             (calls app.listen — entry point for npm start)
    routes/
      items.js            (all five item endpoints; bugs embedded here)
      health.js           (GET /health -> 200 { "status": "ok" })
    store/
      items.js            (in-memory array + read/write to data/items.json; bugs embedded here)
    middleware/
      validateContentType.js  (stub file — intentionally NOT wired, enabling BUG-01)
  data/
    .gitkeep              (keeps directory in git; actual items.json excluded)
  test/
    app.test.js           (visible tests — green, no buggy cases)
    hidden/
      .gitkeep            (placeholder; hidden tests written later)
```

---

## Sub-Tasks

---

### Sub-Task 1 — package.json and project config

**Intent:** Bootstrap the Node project so `npm install`, `npm start`, and
`npm test` all work.

**Expected Outcomes:**
- `npm install` resolves with express, jest, supertest, uuid.
- `npm start` starts the server on port 3000.
- `npm test` runs jest and exits 0 (even before tests exist).

**Todo List:**
1. Write `sample-app/package.json` with scripts: `start`, `test`.
   - `start`: `node src/server.js`
   - `test`: `jest --runInBand`
   - Dependencies: `express ^4`, `uuid ^9`
   - DevDependencies: `jest ^29`, `supertest ^6`
   - `jest` config block: `testEnvironment: node`, `testPathIgnorePatterns: ["test/hidden"]`
2. Write `sample-app/.gitignore` ignoring `node_modules/` and `data/items.json`.
3. Create `sample-app/data/.gitkeep` (empty file).
4. Create `sample-app/test/hidden/.gitkeep` (empty file).

**Status:** [ ] pending

---

### Sub-Task 2 — Store: items.js

**Intent:** Implement the persistence layer. The in-memory array is the source
of truth at runtime; reads and writes sync to `data/items.json`. The BUG-03
defect is introduced here: `deleteItem` removes from the in-memory array only
and does NOT write the updated array to disk.

**Expected Outcomes:**
- `loadItems()` reads `data/items.json` on startup; returns `[]` if file absent.
- `saveItems()` writes the in-memory array to `data/items.json`.
- `getAllItems()` returns the full array.
- `getItemById(id)` returns the item object or `undefined`.
- `createItem(data)` generates a uuid, pushes to the array, calls `saveItems()`,
  returns the new item.
- `updateItem(id, patch)` — **BUG-04 embedded**: replaces the item with
  `{ id, ...patch }` (drops omitted fields) instead of merging with the
  existing item. Calls `saveItems()`.
- `deleteItem(id)` — **BUG-03 embedded**: splices the item from the in-memory
  array but does NOT call `saveItems()`. Returns `true` if found, `false` if not.

**Relevant Context:**
- `bugs/BUG-03.md` scope: `sample-app/src/store/items.js`
- `bugs/BUG-04.md` scope: `sample-app/src/store/items.js` (update logic)

**Status:** [ ] pending

---

### Sub-Task 3 — Middleware stub: validateContentType.js

**Intent:** Create the middleware file referenced in BUG-01's scope but do NOT
wire it into the app. Its presence makes the bug realistic (the fix is obvious
— just wire it).

**Expected Outcomes:**
- File exists at `sample-app/src/middleware/validateContentType.js`.
- Exports a valid Express middleware function that, when wired, would check for
  `Content-Type: application/json` and return 400 if missing.
- The middleware is not imported or used anywhere else in the app.

**Relevant Context:**
- `bugs/BUG-01.md` scope lists this file explicitly.

**Status:** [ ] pending

---

### Sub-Task 4 — Routes: items.js

**Intent:** Implement the five item endpoints. Three bugs are embedded here
(BUG-01, BUG-02, BUG-04 surface through route behaviour).

**Expected Outcomes:**

| Route | Correct behaviour | Bug present |
|-------|-------------------|-------------|
| `POST /items` | 201 + created item | BUG-01: no Content-Type check; `req.body` is `undefined` when header is absent, causing unhandled TypeError → 500 |
| `GET /items` | 200 + array | none |
| `GET /items/:id` | 200 + item | BUG-02: returns `res.json(item)` even when `item` is `undefined` → 200 with empty/null body |
| `PATCH /items/:id` | 200 + updated item | BUG-04: surface of the store bug — the PATCH handler passes only `req.body` to `updateItem` |
| `DELETE /items/:id` | 200 `{ deleted: true }` | BUG-03: surface of the store bug |

**Implementation details:**
- `POST /items`: calls `createItem(req.body)` with no Content-Type guard.
  `req.body` is `undefined` when `express.json()` does not parse
  (no matching Content-Type), so `createItem` receives `undefined` and
  the subsequent property access throws.
- `GET /items/:id`: calls `getItemById(id)`, then `res.json(item)` regardless
  of whether `item` is defined. Does NOT return 404.
- `PATCH /items/:id`: calls `updateItem(id, req.body)` — no guard.
- `DELETE /items/:id`: calls `deleteItem(id)`, always responds 200 (does not
  handle the `false` return value for not-found).

**Relevant Context:**
- `bugs/BUG-01.md`, `bugs/BUG-02.md`, `bugs/BUG-04.md`

**Status:** [ ] pending

---

### Sub-Task 5 — Routes: health.js and app.js / server.js

**Intent:** Wire everything together into a runnable Express app.

**Expected Outcomes:**
- `src/health.js`: single route, `GET /health` → `200 { "status": "ok" }`.
- `src/app.js`: creates Express app, mounts `express.json()`, mounts
  `/items` router, mounts `/health` router, exports `app` (no `listen`).
- `src/server.js`: imports `app`, calls `app.listen(3000)`.
- `node src/server.js` starts without errors.
- `curl http://localhost:3000/health` returns 200.

**Status:** [ ] pending

---

### Sub-Task 6 — Visible test suite: test/app.test.js

**Intent:** Write green integration tests using supertest. Tests cover only
correct/happy-path behaviour — they never assert the four buggy cases.

**Expected Outcomes:**
- `npm test` exits 0.
- Tests cover:
  - `GET /health` → 200 `{ status: 'ok' }`.
  - `POST /items` with valid `Content-Type: application/json` → 201, item
    returned, has `id`.
  - `GET /items` → 200, array.
  - `GET /items/:id` for an item that **was just created** → 200.
  - `DELETE /items/:id` → 200 in-process (does not test restart).
  - `PATCH /items/:id` sending the full item body → 200 (avoids the
    omission-merge case that triggers BUG-04).
- Tests do NOT assert:
  - POST without Content-Type (BUG-01).
  - GET unknown id (BUG-02).
  - DELETE then restart then GET (BUG-03).
  - PATCH with partial body (BUG-04).
- Each test isolates store state by deleting `data/items.json` in
  `beforeEach` / `afterEach` via `fs.rmSync`.

**Status:** [ ] pending

---

### Sub-Task 7 — Update sample-app/README.md

**Intent:** Replace the placeholder README with accurate running instructions
and a note that the app intentionally contains bugs for the RedFirst benchmark.

**Expected Outcomes:**
- `npm install`, `npm start`, `npm test` commands documented.
- Endpoints table present and accurate (includes `GET /health`).
- Note that four intentional bugs are seeded; links to `../bugs/BUG-XX.md`.
- Placeholder text ("Source code has not been added yet") removed.

**Status:** [ ] pending

---

## Constraints

- No `validateContentType.js` wired into the app (BUG-01 must be live).
- `updateItem` must NOT spread the existing item (BUG-04 must be live).
- `deleteItem` must NOT call `saveItems()` (BUG-03 must be live).
- `GET /items/:id` must NOT check for undefined before responding (BUG-02 must be live).
- Visible tests must not assert any of the four buggy cases.
- No cloud, no auth, no Docker, no secrets.
- `test/hidden/` directory created but empty (hidden tests written later).
