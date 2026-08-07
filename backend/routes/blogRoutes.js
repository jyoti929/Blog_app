/**
 * ==========================================================================
 * BLOG ROUTES (routes/blogRoutes.js)
 * Router definition for Blog REST API Endpoints
 * ==========================================================================
 */

const express = require('express');
const router = express.Router();
const {
  createBlog,
  getAllBlogs,
  getMyBlogs,
  getBlogById,
  updateBlog,
  deleteBlog
} = require('../controllers/blogController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/blogs
 * @desc    Get all blog posts (Newest first, populated author name)
 * @access  Public
 */
router.get('/', getAllBlogs);

/**
 * @route   GET /api/blogs/myblogs
 * @desc    Get logged-in user's blog posts only
 * @access  Private (Protected by JWT)
 */
router.get('/myblogs', protect, getMyBlogs);

/**
 * @route   GET /api/blogs/:id
 * @desc    Get a single blog post by ID
 * @access  Public
 */
router.get('/:id', getBlogById);

/**
 * @route   POST /api/blogs
 * @desc    Create a new blog post
 * @access  Private (Protected by JWT)
 */
router.post('/', protect, createBlog);

/**
 * @route   PUT /api/blogs/:id
 * @desc    Update a blog post by ID (Owner only)
 * @access  Private (Protected by JWT)
 */
router.put('/:id', protect, updateBlog);

/**
 * @route   DELETE /api/blogs/:id
 * @desc    Delete a blog post by ID (Owner only)
 * @access  Private (Protected by JWT)
 */
router.delete('/:id', protect, deleteBlog);

module.exports = router;
