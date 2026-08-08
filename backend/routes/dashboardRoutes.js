/**
 * ==========================================================================
 * DASHBOARD ROUTES (routes/dashboardRoutes.js)
 * API Router for Dashboard Analytics & Database Statistics
 * ==========================================================================
 */

const express = require('express');
const router = express.Router();
const { getDashboardAnalytics } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/dashboard/analytics
 * @desc    Get real-time analytics calculations from MongoDB for authenticated user
 * @access  Private (Protected by JWT)
 */
router.get('/analytics', protect, getDashboardAnalytics);

module.exports = router;
