/**
 * ==========================================================================
 * EXPRESS APPLICATION CONFIGURATION (app.js)
 * Configures Express App, Middleware, CORS, Routes, and Error Handling
 * ==========================================================================
 */

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const blogRoutes = require('./routes/blogRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const userRoutes = require('./routes/userRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

// Initialize Express App instance
const app = express();

// 1. Enable Cross-Origin Resource Sharing (CORS) for Frontend connection
app.use(cors({
  origin: true
}));

// 2. Body Parser Middleware to parse JSON payloads (50mb limit for base64 images)
app.use(express.json({ limit: '50mb' }));

// 3. Form Data Body Parser Middleware (50mb limit for large form payloads)
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 4. Debug Request Logging Middleware
app.use((req, res, next) => {
  console.log(`[Incoming Request] ${req.method} ${req.originalUrl}`);
  next();
});

// 5. API Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Blogify API is running'
  });
});

// 6. Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/newsletter', newsletterRoutes);

// 7. 404 Not Found Middleware Handler
app.use(notFoundHandler);

// 8. Global Centralized Error Handler
app.use(errorHandler);

module.exports = app;
