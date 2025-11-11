const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Global error handlers
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  console.error(err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  console.error(err.stack);
  process.exit(1);
});

const app = express();

// Middleware
// Configure CORS to allow requests from frontend
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'success', 
    message: 'EKYC API Server is running',
    timestamp: new Date().toISOString()
  });
});

// KYC Routes (placeholder)
app.post('/api/kyc/submit', async (req, res) => {
  try {
    const { name, email, address, nid, occupation } = req.body;
    
    // Basic validation
    if (!name || name.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Name must be at least 2 characters'
      });
    }
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Valid email address is required'
      });
    }
    
    // Note: Database integration pending - currently using mock data
    // Note: AI summary generation pending - currently using template
    
    const mockSummary = `KYC application received for ${name} (${email}). National ID: ${nid || 'N/A'}. Occupation: ${occupation || 'N/A'}. Address: ${address || 'N/A'}. Application is pending review.`;
    
    res.json({
      success: true,
      message: 'KYC submitted successfully',
      summary: mockSummary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to submit KYC',
      error: error.message
    });
  }
});

// Admin Routes (placeholder)
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }
    
    // Note: Database authentication pending - currently using mock credentials
    // Note: JWT token generation pending - currently using mock token
    
    // Mock response
    if (email === 'admin@example.com' && password === 'admin123') {
      res.json({
        success: true,
        message: 'Login successful',
        data: {
          token: 'mock_jwt_token_here',
          user: { email, name: 'Admin User' }
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

app.post('/api/admin/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Basic validation
    if (!name || name.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Name must be at least 2 characters'
      });
    }
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Valid email address is required'
      });
    }
    
    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters'
      });
    }
    
    // Note: Password hashing pending - currently not hashing passwords
    // Note: Database integration pending - currently using mock storage
    
    console.log(`Registration attempt: ${name} (${email}), password length: ${password.length}`);
    
    res.json({
      success: true,
      message: 'Registration successful',
      data: {
        name,
        email
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`EKYC API Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
