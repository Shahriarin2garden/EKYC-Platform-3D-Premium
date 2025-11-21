const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      logger.warn('⚠️  MONGODB_URI not configured in environment variables');
      logger.warn('Database Solutions:');
      logger.warn('  1. Set MONGODB_URI in Railway environment variables');
      logger.warn('  2. Use MongoDB Atlas: https://www.mongodb.com/cloud/atlas/register');
      return null;
    }
    
    logger.database('Connecting to MongoDB...');
    logger.database(`URI: ${mongoURI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')}`);
    
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 8000, // Timeout after 8s
      socketTimeoutMS: 45000,
    });

    logger.database(`✅ MongoDB Connected: ${conn.connection.host}`);
    logger.database(`Database: ${conn.connection.name}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error', { error: err.message });
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected - attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      logger.database('✅ MongoDB reconnected');
    });

    return conn;
  } catch (error) {
    logger.error('❌ Error connecting to MongoDB', { error: error.message, stack: error.stack });
    logger.error('MongoDB Connection Solutions:');
    logger.error('  1. Verify MONGODB_URI is correct in Railway environment variables');
    logger.error('  2. Check if MongoDB Atlas IP whitelist includes 0.0.0.0/0');
    logger.error('  3. Verify MongoDB cluster is running and accessible');
    logger.warn('⚠️  Server will continue without database connection');
    // Don't throw - let server run without DB
    return null;
  }
};

module.exports = connectDB;
