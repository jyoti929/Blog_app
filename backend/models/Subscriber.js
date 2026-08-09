/**
 * ==========================================================================
 * SUBSCRIBER MODEL (models/Subscriber.js)
 * Mongoose Schema definition for Newsletter Subscriptions
 * ==========================================================================
 */

const mongoose = require('mongoose');

const subscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please enter a valid email address'
      ]
    },
    subscribedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Subscriber', subscriberSchema);
