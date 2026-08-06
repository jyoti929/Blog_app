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
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

// Initialize Express App instance
const app = express();

// 1. Enable Cross-Origin Resource Sharing (CORS) for Frontend connection
app.use(cors());

// 2. Body Parser Middleware to parse JSON payloads
app.use(express.json());

// 3. Form Data Body Parser Middleware
app.use(express.urlencoded({ extended: true }));

// 4. Debug Request Logging Middleware
app.use((req, res, next) => {
  console.log(`[Incoming Request] ${req.method} ${req.originalUrl}`);
  next();
});

// 5. API Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend is running'
  });
});

// 6. Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);

// 7. 404 Not Found Middleware Handler
app.use(notFoundHandler);

// 8. Global Centralized Error Handler
app.use(errorHandler);

module.exports = app;
