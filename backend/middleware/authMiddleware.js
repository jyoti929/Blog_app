/**
 * ==========================================================================
 * AUTHENTICATION MIDDLEWARE (middleware/authMiddleware.js)
 * Line-by-Line Commented JWT Authorization Guard
 * ==========================================================================
 */

// Import jsonwebtoken library to verify digital signatures of JWT tokens
const jwt = require('jsonwebtoken');

// Import User Mongoose model to look up authenticated user details in MongoDB
const User = require('../models/User');

/**
 * Protect Middleware: Restricts access to private routes by validating JWT Bearer Tokens
 * @param {Object} req - Express Request Object
 * @param {Object} res - Express Response Object
 * @param {Function} next - Express Next Middleware Callback Function
 */
const protect = async (req, res, next) => {
  // Declare a variable to store the extracted token string
  let token;

  // Check if the HTTP request contains an 'Authorization' header AND it begins with 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Split the 'Authorization' header string ('Bearer <token>') by space and extract the token string
      token = req.headers.authorization.split(' ')[1];

      // Verify the JWT token using the secret key stored in environment variables (process.env.JWT_SECRET)
      // Throws an error if the token is invalid, tampered with, or expired
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Query the database to find the user matching the decoded payload ID, excluding the password field
      req.user = await User.findById(decoded.id).select('-password');

      // If no user exists with the decoded ID (e.g. user was deleted), reject authorization
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User account no longer exists. Authorization denied.'
        });
      }

      // Token is valid and user is found; call next() to pass control to the next route handler
      return next();

    } catch (error) {
      // Log the authorization failure error message to the console for debugging
      console.error(`[Auth Middleware Verification Failed]: ${error.message}`);

      // Check specifically if the JWT token has expired
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Session token has expired. Please log in again.'
        });
      }

      // Check specifically if the JWT token signature is invalid or corrupted
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid session token signature. Authorization denied.'
        });
      }

      // Catch-all for any other token verification failure
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token validation failed.'
      });
    }
  }

  // If no token was found in the Authorization header, return 401 Unauthorized
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authorization bearer token provided in request header.'
    });
  }
};

// Export the protect middleware function so it can be imported into private route definitions
module.exports = { protect };
