/**
 * ==========================================================================
 * DASHBOARD ROUTES (routes/dashboardRoutes.js)
 * API Router for Dashboard Analytics & Database Statistics
 * ==========================================================================
 */

const express = require('express');
const router = express.Router();
const { getDashboardAnalytics } = require('../controllers/dashboardController');

/**
 * @route   GET /api/dashboard/analytics
 * @desc    Get real-time analytics calculations from MongoDB
 * @access  Public / Private
 */
router.get('/analytics', getDashboardAnalytics);

module.exports = router;
