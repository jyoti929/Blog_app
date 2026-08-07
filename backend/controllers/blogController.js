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
 * @access  Private (Protected by JWT - Logged in user automatically becomes author)
 */
const createBlog = async (req, res, next) => {
  try {
    console.log('[Backend Debug] Received POST /api/blogs request body:', req.body);
    console.log('[Backend Debug] Authenticated author user ID:', req.user ? req.user._id : 'Unauthenticated');

    const { title, content, category, imageUrl, imageData, coverImage, tags, template, theme, status } = req.body;

    // 1. Validation: Ensure title and story content are provided
    if (!title || !content) {
      console.warn('[Backend Debug] Validation Failed: Missing title or content');
      return res.status(400).json({
        success: false,
        message: 'Please provide both title and story content for the blog post'
      });
    }

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

    console.log('[MongoDB Save] Blog inserted successfully into database collection:', { id: blog._id, title: blog.title });

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
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    } else if (req.query.publishedOnly === 'true') {
      filter.status = 'published';
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
        const categoryMatch = regex.test(blog.category || '');
        const tagsMatch = Array.isArray(blog.tags) && blog.tags.some(t => regex.test(t));
        const authorName = blog.author ? (typeof blog.author === 'object' ? blog.author.name : blog.author) : '';
        const authorMatch = regex.test(authorName);
        return titleMatch || categoryMatch || tagsMatch || authorMatch;
      });
    }

    // Calculate live category counts directly from MongoDB
    const allPublished = await Blog.find(req.query.status ? { status: req.query.status } : {});
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
    let blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this blog post'
      });
    }

    blog = await Blog.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('author', 'name email profileImage');

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

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this blog post'
      });
    }

    await blog.deleteOne();

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

/**
 * @desc    Get blogs created by the logged-in user only
 * @route   GET /api/blogs/myblogs
 * @access  Private (Protected by JWT)
 */
const getMyBlogs = async (req, res, next) => {
  try {
    const blogs = await Blog.find({ author: req.user._id })
      .populate('author', 'name email profileImage')
      .sort({ createdAt: -1 });

    const formattedBlogs = blogs.map(blog => ({
      _id: blog._id,
      id: blog._id,
      title: blog.title,
      category: blog.category,
      imageUrl: blog.imageUrl,
      content: blog.content,
      status: blog.status || 'published',
      views: blog.views || 0,
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
