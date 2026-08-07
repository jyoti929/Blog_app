/**
 * ==========================================================================
 * DATABASE CONFIGURATION (config/db.js)
 * MongoDB Connection Handler using Mongoose & process.env.MONGO_URI
 * Database Name: blogify_db
 * ==========================================================================
 */

const mongoose = require('mongoose');

/**
 * Asynchronously connects to MongoDB database before starting Express HTTP server
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/blogify_db');
    console.log('MongoDB Connected Successfully');
    console.log(`[Database] Connected to Host: ${conn.connection.host} | DB Name: ${conn.connection.name}`);
  } catch (error) {
    console.error(`[Database Connection Error]: ${error.message}`);
    console.error('Failed to establish connection to MongoDB. Please ensure process.env.MONGO_URI is set correctly and MongoDB is running.');
    process.exit(1);
  }
};

module.exports = connectDB;
