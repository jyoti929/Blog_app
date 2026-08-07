/**
 * ==========================================================================
 * BLOG MODEL SCHEMA (models/Blog.js)
 * Defines Mongoose Schema for Blog Posts
 * ==========================================================================
 */

const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Blog title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    content: {
      type: String,
      required: [true, 'Blog content is required']
    },
    category: {
      type: String,
      required: [true, 'Blog category is required'],
      trim: true,
      default: 'General'
    },
    imageUrl: {
      type: String,
      default: '',
      trim: true
    },
    tags: {
      type: [String],
      default: []
    },
    template: {
      type: String,
      default: 'blank',
      trim: true
    },
    theme: {
      type: String,
      default: 'theme-01',
      trim: true
    },
    status: {
      type: String,
      enum: ['published', 'draft'],
      default: 'published'
    },
    views: {
      type: Number,
      default: 0
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Blog author is required']
    }
  },
  {
    timestamps: true // Automatically manages createdAt and updatedAt fields
  }
);

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;
