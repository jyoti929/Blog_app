/**
 * ==========================================================================
 * DASHBOARD CONTROLLER (controllers/dashboardController.js)
 * Calculates & Returns Real-Time Analytics from MongoDB Collections
 * ==========================================================================
 */

const Blog = require('../models/Blog');

/**
 * @desc    Get Real-Time Analytics and Statistics from Database
 * @route   GET /api/dashboard/analytics
 * @access  Public / Private
 */
const getDashboardAnalytics = async (req, res, next) => {
  try {
    const now = new Date();

    // Start of current month date calculation
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // 7 days ago date calculation (Current Week Activity)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Run MongoDB queries concurrently using Promise.all for maximum performance
    const [
      totalBlogs,
      publishedBlogs,
      draftBlogs,
      viewsAggregate,
      categoriesDistinct,
      tagsDistinct,
      blogsThisMonth,
      blogsThisWeek,
      latestBlog,
      mostViewedBlog,
      categoryDistribution,
      topViewedBlogs,
      monthlyAggregation,
      weeklyActivityAggregation,
      recentBlogsList
    ] = await Promise.all([
      // 1. Total Blogs Count
      Blog.countDocuments(),

      // 2. Published Blogs Count
      Blog.countDocuments({ status: 'published' }),

      // 3. Draft Blogs Count
      Blog.countDocuments({ status: 'draft' }),

      // 4. Total Views Aggregate Sum
      Blog.aggregate([
        { $group: { _id: null, totalViews: { $sum: '$views' } } }
      ]),

      // 5. Unique Categories List
      Blog.distinct('category'),

      // 6. Unique Tags List
      Blog.distinct('tags'),

      // 7. Blogs Created This Month Count
      Blog.countDocuments({ createdAt: { $gte: startOfMonth } }),

      // 8. Blogs Created This Week Count (Last 7 Days)
      Blog.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),

      // 9. Latest Created Blog
      Blog.findOne().sort({ createdAt: -1 }).select('title category status views createdAt imageUrl author').populate('author', 'name'),

      // 10. Most Viewed Blog
      Blog.findOne().sort({ views: -1 }).select('title category status views createdAt imageUrl author').populate('author', 'name'),

      // 11. Categories Distribution (Count per Category)
      Blog.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),

      // 12. Top 5 Most Viewed Blogs for Charts
      Blog.find().sort({ views: -1 }).limit(5).select('title views category'),

      // 13. Monthly Published Blogs Aggregation (Last 6 Months)
      Blog.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),

      // 14. Weekly Activity Aggregation (Last 7 Days by Day)
      Blog.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: { $dayOfWeek: '$createdAt' }, // 1 = Sun, 2 = Mon, ... 7 = Sat
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id': 1 } }
      ]),

      // 15. Recent 5 Blogs List for Activity Log
      Blog.find().sort({ createdAt: -1 }).limit(5).select('title status category createdAt views')
    ]);

    // Extract Total Views Sum (default to 0 if empty collection)
    const totalViews = viewsAggregate.length > 0 ? viewsAggregate[0].totalViews : 0;

    // Process Categories Distribution Array
    const categoryData = categoryDistribution.map(item => ({
      category: item._id || 'Uncategorized',
      count: item.count
    }));

    // Process Top Viewed Blogs Array
    const topViewed = topViewedBlogs.map(b => ({
      title: b.title.length > 25 ? b.title.substring(0, 25) + '...' : b.title,
      views: b.views || 0,
      category: b.category
    }));

    // Process Recent Activity Feed from Database
    const recentActivity = recentBlogsList.map(blog => {
      const action = blog.status === 'published' ? 'Published' : 'Saved Draft';
      const dateFormatted = new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return {
        id: blog._id,
        action: `${action} "${blog.title.length > 30 ? blog.title.substring(0, 30) + '...' : blog.title}"`,
        category: blog.category,
        date: dateFormatted,
        timestamp: blog.createdAt
      };
    });

    // Build Comprehensive Response Object
    const responsePayload = {
      success: true,
      totalBlogs,
      publishedBlogs,
      draftBlogs,
      totalViews,
      totalCategories: categoriesDistinct.length,
      totalTags: tagsDistinct.length,
      blogsThisMonth,
      blogsThisWeek,
      latestBlog: latestBlog || null,
      mostViewedBlog: mostViewedBlog || null,
      charts: {
        categoryDistribution: categoryData,
        mostViewed: topViewed,
        statusDistribution: {
          published: publishedBlogs,
          draft: draftBlogs
        },
        monthlyPublished: monthlyAggregation,
        weeklyActivity: weeklyActivityAggregation
      },
      recentActivity
    };

    console.log('[Dashboard Analytics API] Calculated MongoDB Stats:', {
      totalBlogs,
      publishedBlogs,
      draftBlogs,
      totalViews,
      totalCategories: categoriesDistinct.length
    });

    res.status(200).json(responsePayload);

  } catch (error) {
    console.error('[Dashboard Analytics Error]:', error.message);
    next(error);
  }
};

module.exports = {
  getDashboardAnalytics
};
