const { validationResult } = require('express-validator');

// Runs after express-validator's `body`/`query` checks and short-circuits
// the request with a 400 if any validation rule failed.
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => e.msg),
    });
  }
  next();
};

module.exports = validate;
