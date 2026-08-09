/**
 * ==========================================================================
 * USER CONTROLLER (controllers/userController.js)
 * Manages Profile Retrieval, Updates, Password Changes, Preferences & Account Deletion
 * ==========================================================================
 */

const User = require('../models/User');
const Blog = require('../models/Blog');

/**
 * @desc    Get Logged-in User Profile & Database Statistics
 * @route   GET /api/users/profile
 * @access  Private (Protected by JWT)
 */
const getUserProfile = async (req, res, next) => {
  try {
    console.log('[PROFILE] Fetching logged-in user');
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      console.error('[PROFILE] Profile update failed: User profile not found in database');
      return res.status(404).json({
        success: false,
        message: 'User profile not found in database'
      });
    }

    console.log('[PROFILE] User profile loaded');

    // Calculate real user blog statistics directly from MongoDB
    const userId = req.user._id;
    const [totalBlogs, publishedBlogs, draftBlogs, viewsAggregation] = await Promise.all([
      Blog.countDocuments({ author: userId }),
      Blog.countDocuments({ author: userId, status: 'published' }),
      Blog.countDocuments({ author: userId, status: 'draft' }),
      Blog.aggregate([
        { $match: { author: userId } },
        { $group: { _id: null, totalViews: { $sum: '$views' } } }
      ])
    ]);

    const totalViews = viewsAggregation.length > 0 ? viewsAggregation[0].totalViews : 0;

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username || '',
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || '',
        profileImage: user.profileImage || '',
        preferences: user.preferences || {
          emailNotifications: true,
          commentNotifications: true,
          onlineStatus: true,
          autoSaveDrafts: true
        },
        appearance: user.appearance || 'light',
        createdAt: user.createdAt
      },
      stats: {
        totalBlogs,
        publishedBlogs,
        draftBlogs,
        totalViews
      }
    });

  } catch (error) {
    console.error('[PROFILE] Profile update failed:', error.message);
    next(error);
  }
};

/**
 * @desc    Update Logged-in User Profile Information
 * @route   PUT /api/users/profile
 * @access  Private (Protected by JWT)
 */
const updateUserProfile = async (req, res, next) => {
  try {
    console.log('[PROFILE] Updating profile');
    const user = await User.findById(req.user._id);

    if (!user) {
      console.error('[PROFILE] Profile update failed: User profile not found');
      return res.status(404).json({
        success: false,
        message: 'User profile not found in database'
      });
    }

    const { name, username, email, phone, location, bio, profileImage } = req.body;

    if (name) user.name = name.trim();
    if (username !== undefined) user.username = username.trim();
    if (email) user.email = email.toLowerCase().trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (location !== undefined) user.location = location.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (profileImage !== undefined) user.profileImage = profileImage.trim();

    const updatedUser = await user.save();

    console.log('[PROFILE] Profile updated successfully');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        username: updatedUser.username || '',
        phone: updatedUser.phone || '',
        location: updatedUser.location || '',
        bio: updatedUser.bio || '',
        profileImage: updatedUser.profileImage || '',
        preferences: updatedUser.preferences,
        appearance: updatedUser.appearance,
        createdAt: updatedUser.createdAt
      }
    });

  } catch (error) {
    console.error('[PROFILE] Profile update failed:', error.message);
    next(error);
  }
};

/**
 * @desc    Change User Password
 * @route   PUT /api/users/change-password
 * @access  Private (Protected by JWT)
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current password, new password, and confirm password'
      });
    }

    const { validatePassword } = require('../utils/passwordValidator');
    const pwdVal = validatePassword(newPassword);
    if (!pwdVal.valid) {
      return res.status(400).json({
        success: false,
        message: pwdVal.message
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Confirm password does not match new password'
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    console.log('[MongoDB Update] Password changed successfully for user:', user._id);

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('[User Controller Error] changePassword:', error.message);
    next(error);
  }
};

/**
 * @desc    Update User Preferences & Appearance Mode
 * @route   PUT /api/users/preferences
 * @access  Private (Protected by JWT)
 */
const updatePreferences = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found' });
    }

    const { preferences, appearance } = req.body;

    if (preferences) {
      user.preferences = {
        ...user.preferences,
        ...preferences
      };
    }

    if (appearance) {
      user.appearance = appearance;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: user.preferences,
      appearance: user.appearance
    });

  } catch (error) {
    console.error('[User Controller Error] updatePreferences:', error.message);
    next(error);
  }
};

/**
 * @desc    Delete Account Permanently
 * @route   DELETE /api/users/account
 * @access  Private (Protected by JWT)
 */
const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Delete all blogs authored by user
    await Blog.deleteMany({ author: userId });

    // Delete user document
    await User.findByIdAndDelete(userId);

    console.log('[MongoDB Delete] Account permanently deleted:', userId);

    res.status(200).json({
      success: true,
      message: 'Account permanently deleted'
    });

  } catch (error) {
    console.error('[User Controller Error] deleteAccount:', error.message);
    next(error);
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  changePassword,
  updatePreferences,
  deleteAccount
};
