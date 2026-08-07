/**
 * ==========================================================================
 * AUTHENTICATION CONTROLLER (controllers/authController.js)
 * User Registration, Login & Profile Retrieval Controller Logic
 * ==========================================================================
 */

const User = require('../models/User');
const generateToken = require('../utils/generateToken');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res, next) => {
  try {
    console.log('[Registration Request] Received body:', req.body);
    const { name, email, password, profileImage } = req.body;

    // 1. Validation: Ensure all required fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All required fields (name, email, password) must be provided'
      });
    }

    // 2. Server-side Password Policy Validation
    const { validatePassword } = require('../utils/passwordValidator');
    const pwdValidation = validatePassword(password);
    if (!pwdValidation.valid) {
      return res.status(400).json({
        success: false,
        message: pwdValidation.message
      });
    }

    // 3. Validation: Check if email already exists in database
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists'
      });
    }

    // 4. Create new user record (Password is automatically hashed by bcrypt in pre-save hook)
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      profileImage: profileImage ? profileImage.trim() : ''
    });

    console.log('[MongoDB Save] User document saved successfully:', { id: user._id, email: user.email });

    // 5. Generate JWT token
    const token = generateToken(user._id);

    // 6. Return success response (201 Created)
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists'
      });
    }
    next(error);
  }
};

/**
 * @desc    Authenticate user & get JWT token (Login)
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res, next) => {
  try {
    console.log('[Login Request] Received credentials for email:', req.body ? req.body.email : null);
    const { email, password } = req.body;

    // 1. Validation: Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password'
      });
    }

    // 2. Check if user exists in database (explicitly include password field using .select('+password'))
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // 3. Compare entered plain-text password with hashed password in database
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // 4. Generate JWT Token
    const token = generateToken(user._id);

    // 5. Return success response with token and user info
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current authenticated user profile
 * @route   GET /api/auth/me
 * @access  Private (Protected by JWT)
 */
const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe
};
