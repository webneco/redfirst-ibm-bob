'use strict';

const express = require('express');
const itemsRouter = require('./routes/items');
const healthRouter = require('./routes/health');

const app = express();

// Parse JSON bodies ONLY when Content-Type is exactly application/json.
// When the header is absent or wrong, body-parser skips the request and
// req.body remains undefined — which causes the POST /items handler to
// throw (BUG-01).
app.use((req, res, next) => {
  const ct = req.headers['content-type'] || '';
  if (ct.includes('application/json')) {
    express.json()(req, res, next);
  } else {
    // BUG-01: leave req.body undefined for non-JSON requests.
    // The fix is to wire validateContentType before itemsRouter so these
    // requests are rejected with 400 before they reach the route handler.
    next();
  }
});

// BUG-01: validateContentType middleware is NOT wired.
// To fix BUG-01, uncomment the two lines below:
// const validateContentType = require('./middleware/validateContentType');
// app.use('/items', validateContentType);

app.use('/items', itemsRouter);
app.use('/health', healthRouter);

// Generic error handler — converts unhandled errors to 500
app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

module.exports = app;
