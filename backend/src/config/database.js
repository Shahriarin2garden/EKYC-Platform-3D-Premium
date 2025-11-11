const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ekyc_db';
    
    console.log('🔄 Connecting to MongoDB...');
    console.log(`📍 URI: ${mongoURI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')}`);
    
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

    return conn;
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    console.error('\n🔧 MongoDB Connection Solutions:');
    console.error('   1. Install MongoDB locally: https://www.mongodb.com/try/download/community');
    console.error('   2. Use MongoDB Atlas (Free Cloud): https://www.mongodb.com/cloud/atlas/register');
    console.error('   3. Update MONGODB_URI in .env file with your connection string\n');
    process.exit(1);
  }
};

module.exports = connectDB;
