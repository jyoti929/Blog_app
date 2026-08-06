/**
 * ==========================================================================
 * BLOG CONTROLLER (controllers/blogController.js)
 * Create, Read, Update, and Delete (CRUD) Blog Controller Logic
 * ==========================================================================
 */

const Blog = require('../models/Blog');

/**
 * @desc    Create a new Blog post
 * @route   POST /api/blogs
 * @access  Private (Protected by JWT)
 */
const createBlog = async (req, res, next) => {
  try {
    const { title, content, category, imageUrl, status } = req.body;

    // 1. Validation: Ensure title and content are provided
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both title and content for the blog post'
      });
    }

    // 2. Create Blog Document in MongoDB (req.user._id attached by protect middleware)
    const blog = await Blog.create({
      title: title.trim(),
      content,
      category: category ? category.trim() : 'General',
      imageUrl: imageUrl ? imageUrl.trim() : '',
      status: status === 'draft' ? 'draft' : 'published',
      author: req.user._id
    });

    // 3. Populate author details (name and email) for response
    await blog.populate('author', 'name email');

    // 4. Return success response (HTTP 201 Created)
    res.status(201).json({
      success: true,
      message: 'Blog post created successfully',
      data: blog
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all Blog posts (Newest first, with populated Author name)
 * @route   GET /api/blogs
 * @access  Public
 */
const getAllBlogs = async (req, res, next) => {
  try {
    const blogs = await Blog.find()
      .populate('author', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: blogs.length,
      data: blogs
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single Blog post by ID
 * @route   GET /api/blogs/:id
 * @access  Public
 */
const getBlogById = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id).populate('author', 'name email');

    // 1. Check if blog post exists
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // 2. Increment view count on each retrieval
    blog.views += 1;
    await blog.save();

    // 3. Return success response
    res.status(200).json({
      success: true,
      data: blog
    });

  } catch (error) {
    // Handle invalid Mongoose ObjectId format (CastError)
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Invalid blog post ID format'
      });
    }
    next(error);
  }
};

/**
 * @desc    Update a Blog post by ID
 * @route   PUT /api/blogs/:id
 * @access  Private (Owner Only)
 */
const updateBlog = async (req, res, next) => {
  try {
    let blog = await Blog.findById(req.params.id);

    // 1. Check if blog exists
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // 2. Ownership Verification: Ensure logged in user is the author
    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this blog post'
      });
    }

    // 3. Perform update with Mongoose validators
    blog = await Blog.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('author', 'name email');

    // 4. Return success response
    res.status(200).json({
      success: true,
      message: 'Blog post updated successfully',
      data: blog
    });

  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Invalid blog post ID format'
      });
    }
    next(error);
  }
};

/**
 * @desc    Delete a Blog post by ID
 * @route   DELETE /api/blogs/:id
 * @access  Private (Owner Only)
 */
const deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);

    // 1. Check if blog exists
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // 2. Ownership Verification: Ensure logged in user is the author
    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this blog post'
      });
    }

    // 3. Remove document from MongoDB
    await blog.deleteOne();

    // 4. Return success response
    res.status(200).json({
      success: true,
      message: 'Blog post deleted successfully'
    });

  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Invalid blog post ID format'
      });
    }
    next(error);
  }
};

module.exports = {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog
};
