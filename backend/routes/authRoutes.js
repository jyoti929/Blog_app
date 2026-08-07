/**
 * ==========================================================================
 * AUTHENTICATION ROUTES (routes/authRoutes.js)
 * Router definition for Authentication API Endpoints
 * ==========================================================================
 */

const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { getUserProfile, updateUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user account
 * @access  Public
 */
router.post('/register', registerUser);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get JWT token
 * @access  Public
 */
router.post('/login', loginUser);

/**
 * @route   GET /api/auth/me
 * @desc    Get logged-in user profile details
 * @access  Private (Protected by JWT)
 */
router.get('/me', protect, getUserProfile);

/**
 * @route   GET /api/auth/profile
 * @desc    Get logged-in user profile details alias
 * @access  Private (Protected by JWT)
 */
router.get('/profile', protect, getUserProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update logged-in user profile details
 * @access  Private (Protected by JWT)
 */
router.put('/profile', protect, updateUserProfile);

/**
 * @route   PUT /api/auth/me
 * @desc    Update logged-in user profile details alias
 * @access  Private (Protected by JWT)
 */
router.put('/me', protect, updateUserProfile);

module.exports = router;
