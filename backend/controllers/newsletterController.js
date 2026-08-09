/**
 * ==========================================================================
 * NEWSLETTER CONTROLLER (controllers/newsletterController.js)
 * Manages newsletter subscription requests and MongoDB Subscriber collection
 * ==========================================================================
 */

const Subscriber = require('../models/Subscriber');
const sendNewsletterEmail = require('../utils/sendNewsletterEmail');

/**
 * @desc    Subscribe a new email to the newsletter
 * @route   POST /api/newsletter/subscribe
 * @access  Public
 */
const subscribeNewsletter = async (req, res, next) => {
  try {
    const { email } = req.body;

    console.log('[Newsletter] Received subscription request for email:', email ? email.trim() : 'empty');

    // 1. Email validation
    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.'
      });
    }

    // 2. Prevent duplicate subscriptions
    const existingSubscriber = await Subscriber.findOne({ email: cleanEmail });

    if (existingSubscriber) {
      console.log('[Newsletter] Duplicate email attempt:', cleanEmail);
      return res.status(409).json({
        success: false,
        message: 'This email is already subscribed.'
      });
    }

    // 3. Save new subscriber to MongoDB
    const subscriber = await Subscriber.create({
      email: cleanEmail
    });

    console.log('[Newsletter] Successfully saved subscriber to MongoDB:', subscriber._id, cleanEmail);

    // 4. Dispatch Confirmation Email via Nodemailer App Password / SMTP
    sendNewsletterEmail({ email: cleanEmail }).catch(emailErr => {
      console.error('[NEWSLETTER EMAIL ERROR] Failed to send email to', cleanEmail, emailErr.message);
    });

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to our newsletter!'
    });

  } catch (error) {
    if (error.code === 11000) {
      console.log('[Newsletter] Duplicate Key Error for email');
      return res.status(409).json({
        success: false,
        message: 'This email is already subscribed.'
      });
    }
    next(error);
  }
};

module.exports = {
  subscribeNewsletter
};
