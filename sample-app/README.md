# sample-app

A minimal Node.js + Express REST API used as the buggy target application for
the RedFirst hackathon demonstration.

> **Source code has not been added yet.** This README will be updated when the
> application is implemented.

---

## Planned Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/items` | Create a new item |
| `GET` | `/items` | List all items |
| `GET` | `/items/:id` | Get a single item by ID |
| `PATCH` | `/items/:id` | Partially update an item |
| `DELETE` | `/items/:id` | Delete an item |

## Planned Stack

- **Runtime:** Node.js 20.x
- **Framework:** Express 4.x
- **Test runner:** Jest
- **Store:** In-memory (JSON file persistence for restart behaviour)

## Running the App (once source is added)

```bash
npm install
npm start        # starts on http://localhost:3000
npm test         # run the full test suite
```

## Bug Tracking

The four bugs seeded into this app are documented in:

- [`../bugs/BUG-01.md`](../bugs/BUG-01.md)
- [`../bugs/BUG-02.md`](../bugs/BUG-02.md)
- [`../bugs/BUG-03.md`](../bugs/BUG-03.md)
- [`../bugs/BUG-04.md`](../bugs/BUG-04.md)

Each bug must be fixed using the RedFirst gated workflow:
**Triage → Failing Test → Fix → Ship**.
