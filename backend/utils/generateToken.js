const jwt = require('jsonwebtoken');

// Generates a signed JWT containing the user's id, used for authenticating
// subsequent requests via the Authorization: Bearer header.
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

module.exports = generateToken;
