const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ekyc_db';
    
    logger.database('Connecting to MongoDB...');
    logger.database(`URI: ${mongoURI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')}`);
    
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });

    logger.database(`MongoDB Connected: ${conn.connection.host}`);
    logger.database(`Database: ${conn.connection.name}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error', { error: err.message });
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.database('MongoDB reconnected');
    });

    return conn;
  } catch (error) {
    logger.error('Error connecting to MongoDB', { error: error.message });
    logger.error('MongoDB Connection Solutions:');
    logger.error('  1. Install MongoDB locally: https://www.mongodb.com/try/download/community');
    logger.error('  2. Use MongoDB Atlas (Free Cloud): https://www.mongodb.com/cloud/atlas/register');
    logger.error('  3. Update MONGODB_URI in .env file with your connection string');
    process.exit(1);
  }
};

module.exports = connectDB;
