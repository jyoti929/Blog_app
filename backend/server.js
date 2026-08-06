/**
 * ==========================================================================
 * BACKEND SERVER ENTRY POINT (server.js)
 * Loads Environment Variables, Connects Database & Boots HTTP Server
 * ==========================================================================
 */

// 1. Load environment variables from .env file before using process.env
require('dotenv').config();

const connectDB = require('./config/db');
const app = require('./app');

// Port definition
const PORT = process.env.PORT || 5000;

/**
 * Bootstraps the application:
 * 1. Connects to MongoDB via Mongoose
 * 2. Starts Express HTTP Server listener
 */
const startServer = async () => {
  // Connect to MongoDB Database before listening
  await connectDB();

  // Start HTTP Server
  const server = app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`Server Started`);
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Health Check Endpoint: http://localhost:${PORT}/api/health`);
    console.log(`==================================================`);
  });

  // Handle Unhandled Promise Rejections
  process.on('unhandledRejection', (err) => {
    console.error(`[Unhandled Rejection Error]: ${err.message}`);
    server.close(() => process.exit(1));
  });
};

startServer();
