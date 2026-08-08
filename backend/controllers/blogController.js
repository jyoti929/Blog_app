/**
 * ==========================================================================
 * BLOG CONTROLLER (controllers/blogController.js)
 * Create, Read, Update, and Delete (CRUD) Blog Controller Logic
 * ==========================================================================
 */

const mongoose = require('mongoose');
const Blog = require('../models/Blog');

/**
 * @desc    Create a new Blog post
 * @route   POST /api/blogs
 * @access  Private (Protected by JWT - Logged in user automatically becomes author)
 */
const createBlog = async (req, res, next) => {
  try {
    console.log('[CREATE BLOG] Request received');
    console.log('[CREATE BLOG] Authenticated user ID:', req.user ? req.user._id : 'Unauthenticated');

    const { title, content, category, imageUrl, imageData, coverImage, tags, template, theme, status } = req.body;
    console.log('[CREATE BLOG] Blog payload received:', { title, category, status });

    // 1. Validation: Ensure title and story content are provided
    if (!title || !content) {
      console.warn('[Backend Debug] Validation Failed: Missing title or content');
      return res.status(400).json({
        success: false,
        message: 'Please provide both title and story content for the blog post'
      });
    }

    console.log('[CREATE BLOG] Saving blog to MongoDB');

    // 2. Create Blog Document in MongoDB (Author ID is automatically set from authenticated req.user._id)
    const blog = await Blog.create({
      title: title.trim(),
      content,
      category: category ? category.trim() : 'General',
      imageUrl: coverImage || imageData || imageUrl || '',
      tags: Array.isArray(tags) ? tags : [],
      template: template || 'blank',
      theme: theme || 'theme-01',
      status: status === 'draft' ? 'draft' : 'published',
      author: req.user._id
    });

    console.log('[CREATE BLOG] MongoDB saved document ID:', blog._id);
    console.log('[CREATE BLOG] MongoDB saved author ID:', blog.author);

    // 3. Populate author details (name and email) for response
    await blog.populate('author', 'name email profileImage');

    // 4. Return success JSON response (HTTP 201 Created)
    res.status(201).json({
      success: true,
      message: 'Blog published successfully.',
      blog,
      data: blog
    });

  } catch (error) {
    console.error('[MongoDB Save Error]:', error.message);
    next(error);
  }
};

/**
 * @desc    Get all Blog posts (Newest first, with backend search & category filtering)
 * @route   GET /api/blogs
 * @access  Public
 */
const getAllBlogs = async (req, res, next) => {
  try {
    const filter = { status: 'published' };
    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.category && req.query.category.trim().toLowerCase() !== 'all') {
      filter.category = { $regex: new RegExp(`^${req.query.category.trim()}$`, 'i') };
    }

    const searchQuery = (req.query.search || req.query.q || '').trim();

    let blogs = await Blog.find(filter)
      .populate('author', 'name email profileImage')
      .sort({ createdAt: -1 });

    if (searchQuery) {
      const regex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      blogs = blogs.filter(blog => {
        const titleMatch = regex.test(blog.title || '');
        const contentMatch = regex.test(blog.content || '');
        const categoryMatch = regex.test(blog.category || '');
        const tagsMatch = Array.isArray(blog.tags) && blog.tags.some(t => regex.test(t));
        const authorName = blog.author ? (typeof blog.author === 'object' ? blog.author.name : blog.author) : '';
        const authorMatch = regex.test(authorName);
        return titleMatch || contentMatch || categoryMatch || tagsMatch || authorMatch;
      });
    }

    // Calculate live category counts directly from MongoDB for published blogs
    const allPublished = await Blog.find({ status: 'published' });
    const categoryCounts = { All: allPublished.length };
    allPublished.forEach(b => {
      const cat = b.category || 'General';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    const optimizedBlogs = blogs.map(blog => {
      // Strip HTML tags to generate a clean short description excerpt
      const plainContent = (blog.content || '').replace(/<[^>]*>?/gm, '').trim();
      const shortDescription = plainContent.length > 140 
        ? plainContent.substring(0, 140) + '...' 
        : (plainContent || 'No description available.');

      return {
        _id: blog._id,
        id: blog._id,
        title: blog.title,
        category: blog.category || 'General',
        imageUrl: blog.imageUrl || '',
        coverImage: blog.imageUrl || '',
        content: blog.content || '',
        shortDescription,
        tags: blog.tags || [],
        template: blog.template || 'blank',
        theme: blog.theme || 'theme-01',
        status: blog.status || 'published',
        views: blog.views || 0,
        author: blog.author ? (typeof blog.author === 'object' ? blog.author.name : 'Anonymous') : 'Anonymous',
        authorDetails: blog.author,
        createdAt: blog.createdAt,
        updatedAt: blog.updatedAt
      };
    });

    res.status(200).json({
      success: true,
      count: optimizedBlogs.length,
      categoryCounts,
      data: optimizedBlogs
    });
  } catch (error) {
    console.error('[Blog Controller Error] getAllBlogs:', error.message);
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
    // Safety check: Delegate /my and /myblogs sub-routes to getMyBlogs
    if (req.params.id === 'my' || req.params.id === 'myblogs') {
      return getMyBlogs(req, res, next);
    }

    // Validate 24-char ObjectId format to prevent CastError
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    const blog = await Blog.findById(req.params.id).populate('author', 'name email profileImage');

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    blog.views += 1;
    await blog.save();

    res.status(200).json({
      success: true,
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
 * @desc    Update a Blog post by ID
 * @route   PUT /api/blogs/:id
 * @access  Private (Owner Only)
 */
const updateBlog = async (req, res, next) => {
  try {
    // 1. Delete any author, owner, userId, or createdAt overrides passed in request body
    delete req.body.author;
    delete req.body.userId;
    delete req.body.owner;
    delete req.body.createdAt;

    // 2. Prepare Update Payload
    const { title, content, category, imageUrl, coverImage, imageData, tags, template, theme, status } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (content !== undefined) updateData.content = content;
    if (category !== undefined) updateData.category = category.trim();
    if (coverImage || imageUrl || imageData) updateData.imageUrl = coverImage || imageData || imageUrl;
    if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags : [];
    if (template !== undefined) updateData.template = template;
    if (theme !== undefined) updateData.theme = theme;
    if (status !== undefined) updateData.status = status;

    // 3. Security Authorization Update using explicit {_id, author: req.user._id} filter
    const updatedBlog = await Blog.findOneAndUpdate(
      { _id: req.params.id, author: req.user._id },
      updateData,
      { new: true, runValidators: true }
    ).populate('author', 'name email profileImage');

    if (!updatedBlog) {
      const blogExists = await Blog.findById(req.params.id);
      if (blogExists) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to edit this blog.'
        });
      }
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    console.log('[MongoDB Update] Blog updated successfully:', updatedBlog._id);

    res.status(200).json({
      success: true,
      message: 'Blog updated successfully.',
      blog: updatedBlog,
      data: updatedBlog
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
    // Security Authorization Delete using explicit {_id, author: req.user._id} filter
    const deletedBlog = await Blog.findOneAndDelete({
      _id: req.params.id,
      author: req.user._id
    });

    if (!deletedBlog) {
      const blogExists = await Blog.findById(req.params.id);
      if (blogExists) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to delete this blog.'
        });
      }
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    console.log('[MongoDB Delete] Blog deleted successfully:', req.params.id);

    res.status(200).json({
      success: true,
      message: 'Blog deleted successfully.'
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
 * @desc    Get blogs created by the logged-in user only
 * @route   GET /api/blogs/myblogs
 * @access  Private (Protected by JWT)
 */
const getMyBlogs = async (req, res, next) => {
  try {
    console.log('[MY BLOGS] Authenticated user ID:', req.user ? req.user._id : 'Unauthenticated');
    const blogs = await Blog.find({ author: req.user._id })
      .populate('author', 'name email profileImage')
      .sort({ createdAt: -1 });

    console.log('[MY BLOGS] Blogs found:', blogs.length);

    const formattedBlogs = blogs.map(blog => ({
      _id: blog._id,
      id: blog._id,
      title: blog.title,
      category: blog.category,
      imageUrl: blog.imageUrl,
      content: blog.content,
      status: blog.status || 'published',
      views: blog.views || 0,
      author: blog.author ? (typeof blog.author === 'object' ? blog.author.name : 'Anonymous') : 'Anonymous',
      authorDetails: blog.author,
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt
    }));

    res.status(200).json({
      success: true,
      count: formattedBlogs.length,
      data: formattedBlogs
    });
  } catch (error) {
    console.error('[Blog Controller Error] getMyBlogs:', error.message);
    next(error);
  }
};

module.exports = {
  createBlog,
  getAllBlogs,
  getMyBlogs,
  getBlogById,
  updateBlog,
  deleteBlog
};
