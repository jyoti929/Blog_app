/**
 * ==========================================================================
 * JWT UTILITY (utils/generateToken.js)
 * Generates signed JSON Web Tokens for authenticated users
 * ==========================================================================
 */

const jwt = require('jsonwebtoken');

/**
 * Generates a signed JWT token containing user ID
 * @param {String} userId - User Mongoose ObjectID
 * @returns {String} Signed JWT Token
 */
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '30d'
    }
  );
};

module.exports = generateToken;
