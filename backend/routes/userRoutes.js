/**
 * ==========================================================================
 * USER ROUTES (routes/userRoutes.js)
 * Router for User Profile, Password, Preferences & Account Deletion
 * ==========================================================================
 */

const express = require('express');
const router = express.Router();
const { 
  getUserProfile, 
  updateUserProfile, 
  changePassword, 
  updatePreferences, 
  deleteAccount 
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/users/profile
 * @desc    Get current user profile & real MongoDB statistics
 * @access  Private
 */
router.get('/profile', protect, getUserProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update current user profile information
 * @access  Private
 */
router.put('/profile', protect, updateUserProfile);

/**
 * @route   PUT /api/users/change-password
 * @desc    Update user password
 * @access  Private
 */
router.put('/change-password', protect, changePassword);

/**
 * @route   PUT /api/users/preferences
 * @desc    Update user preferences & appearance mode
 * @access  Private
 */
router.put('/preferences', protect, updatePreferences);

/**
 * @route   DELETE /api/users/account
 * @desc    Delete user account permanently
 * @access  Private
 */
router.delete('/account', protect, deleteAccount);

module.exports = router;
