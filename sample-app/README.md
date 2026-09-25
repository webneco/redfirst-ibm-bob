# sample-app

A minimal Node.js + Express items REST API — the **buggy benchmark target** for
the RedFirst hackathon demonstration. It ships with four intentional defects
(BUG-01 through BUG-04) that must be fixed using the RedFirst gated workflow.

---

## Quick Start (PowerShell)

```powershell
cd "E:\Webneco Apps\redfirst-ibm-bob\sample-app"
npm install
npm test
npm start
```

- `npm install` — install dependencies (express, uuid, jest, supertest)
- `npm test` — run the visible test suite; all tests must be green
- `npm start` — start the server on `http://localhost:3000`

---

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check — `{ "status": "ok" }` |
| `POST` | `/items` | Create a new item |
| `GET` | `/items` | List all items |
| `GET` | `/items/:id` | Get a single item by ID |
| `PATCH` | `/items/:id` | Partially update an item |
| `DELETE` | `/items/:id` | Delete an item |

---

## Stack

- **Runtime:** Node.js 20.x
- **Framework:** Express 4.x
- **Test runner:** Jest 29 + Supertest
- **Persistence:** `data/items.json` (in-memory at runtime, written on create/update)

---

## Intentional Defects (do not fix without following RedFirst)

| Bug | Endpoint | Symptom |
|-----|----------|---------|
| [BUG-01](../bugs/BUG-01.md) | `POST /items` | Returns 500 instead of 400 when `Content-Type` header is missing |
| [BUG-02](../bugs/BUG-02.md) | `GET /items/:id` | Returns 200 with empty body instead of 404 for unknown IDs |
| [BUG-03](../bugs/BUG-03.md) | `DELETE /items/:id` | Delete is in-memory only; item reappears after restart |
| [BUG-04](../bugs/BUG-04.md) | `PATCH /items/:id` | Omitted fields are overwritten with undefined |

Each bug must be fixed using the RedFirst workflow:
**Triage (`redfirst-triage` mode) → Failing Test → Fix → Ship (`ship-proof-pr` skill)**.

---

## Project Layout

```
sample-app/
  src/
    app.js                        Express app factory (no listen)
    server.js                     Entry point — calls app.listen
    routes/
      items.js                    Item endpoints (BUG-01, BUG-02, BUG-03, BUG-04 surface here)
      health.js                   GET /health
    store/
      items.js                    In-memory store + JSON persistence (BUG-03, BUG-04 root)
    middleware/
      validateContentType.js      Fix for BUG-01 — stub only, NOT wired
  data/
    items.json                    Runtime data file (git-ignored)
  test/
    app.test.js                   Visible green tests (happy-path only)
    hidden/                       Hidden judge tests (written separately)
```
