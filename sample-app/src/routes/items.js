'use strict';

const { Router } = require('express');
const store = require('../store/items');

const router = Router();

// POST /items
// BUG-01: No Content-Type guard. When the header is absent or is not
// application/json, express.json() does not parse the body. The handler
// reads req.body.name without checking Content-Type first, which throws:
//   TypeError: Cannot read properties of undefined (reading 'name')
// because body-parser leaves req.body undefined for unrecognised types.
// The fix is to wire validateContentType before this router.
router.post('/', (req, res, next) => {
  try {
    // BUG-01: accessing req.body.name without a Content-Type guard.
    // When Content-Type is not application/json, req.body is undefined
    // and this line throws, propagating as HTTP 500.
    const { name } = req.body;
    const item = store.createItem({ name, ...req.body });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

// GET /items
router.get('/', (req, res) => {
  res.json(store.getAllItems());
});

// GET /items/:id
// BUG-02: Does not check whether item is undefined before calling res.json().
// When id is unknown, item is undefined and Express sends 200 with no body.
router.get('/:id', (req, res) => {
  const item = store.getItemById(req.params.id);
  // BUG-02: should be: if (!item) return res.status(404).json({ error: 'Item not found' });
  res.json(item);
});

// PATCH /items/:id
// BUG-04 surfaces here: updateItem replaces the stored object with { id, ...patch },
// so fields omitted from req.body are lost.
router.patch('/:id', (req, res, next) => {
  try {
    const updated = store.updateItem(req.params.id, req.body);
    if (updated === null) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /items/:id
// BUG-03 surfaces here: in-memory removal only; no disk persistence.
router.delete('/:id', (req, res) => {
  store.deleteItem(req.params.id);
  res.json({ deleted: true });
});

module.exports = router;
