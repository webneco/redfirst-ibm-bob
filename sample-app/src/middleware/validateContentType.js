'use strict';

/**
 * validateContentType middleware
 *
 * Checks that incoming requests carry Content-Type: application/json.
 * Returns 400 with { "error": "Content-Type must be application/json" }
 * when the header is absent or set to a non-JSON media type.
 *
 * NOTE (BUG-01): This middleware exists but is NOT wired into the app.
 * Wire it in app.js (before the items router) to fix BUG-01.
 */
function validateContentType(req, res, next) {
  const ct = req.headers['content-type'] || '';
  if (!ct.includes('application/json')) {
    return res.status(400).json({ error: 'Content-Type must be application/json' });
  }
  next();
}

module.exports = validateContentType;
