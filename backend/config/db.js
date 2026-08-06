/**
 * ==========================================================================
 * DATABASE CONFIGURATION (config/db.js)
 * MongoDB Connection Handler using Mongoose
 * ==========================================================================
 */

const mongoose = require('mongoose');

/**
 * Connects to MongoDB database asynchronously using process.env.MONGO_URI
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`[Database] MongoDB Connected Successfully: ${conn.connection.host}/${conn.connection.name}`);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error(`[Database Error] Failed to connect to MongoDB: ${error.message}`);
    console.error('Ensure MongoDB service (mongod) is running locally on mongodb://127.0.0.1:27017 or update MONGO_URI in .env');
    // Exit process with failure code
    process.exit(1);
  }
};

module.exports = connectDB;
