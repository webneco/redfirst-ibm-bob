'use strict';

const express = require('express');
const itemsRouter = require('./routes/items');
const healthRouter = require('./routes/health');

const app = express();

app.use(express.json());

// BUG-01: validateContentType middleware is NOT wired.
// Without it, POST /items with a missing or non-JSON Content-Type header
// silently creates a corrupt item (fields are undefined) instead of
// returning 400 { "error": "Content-Type must be application/json" }.
//
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
