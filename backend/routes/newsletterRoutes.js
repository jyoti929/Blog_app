/**
 * ==========================================================================
 * NEWSLETTER ROUTES (routes/newsletterRoutes.js)
 * Router definition for Newsletter subscription endpoints
 * ==========================================================================
 */

const express = require('express');
const router = express.Router();
const { subscribeNewsletter } = require('../controllers/newsletterController');

/**
 * @route   POST /api/newsletter/subscribe
 * @desc    Subscribe an email to the newsletter
 * @access  Public
 */
router.post('/subscribe', subscribeNewsletter);
router.post('/', subscribeNewsletter);

module.exports = router;
