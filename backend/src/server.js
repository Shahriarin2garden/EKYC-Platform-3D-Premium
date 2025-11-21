const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const logger = require('./config/logger');
const connectDB = require('./config/database');
const pdfWorker = require('./services/pdfWorker');

// Load environment variables
dotenv.config();

// Global error handlers
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', { error: err.name, message: err.message, stack: err.stack });
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥', { error: err.name, message: err.message, stack: err.stack });
  // Don't exit immediately - let the app handle it
});

// Connect to MongoDB (async but non-blocking)
// eslint-disable-next-line unicorn/prefer-top-level-await
void (async () => {
  try {
    await connectDB();
  } catch (err) {
    logger.error('Failed to connect to MongoDB', { error: err.message });
  }
})();

// Start PDF Worker (RabbitMQ consumer)
// This will connect to RabbitMQ and start listening for PDF generation requests
// eslint-disable-next-line unicorn/prefer-top-level-await
void (async () => {
  try {
    await pdfWorker.startPdfWorker();
  } catch (err) {
    logger.error('Failed to start PDF Worker', { error: err.message });
    logger.warn('PDF generation will not be available. Make sure RabbitMQ is running.');
  }
})();

const app = express();

// Import routes
const kycRoutes = require('./routes/kycRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Middleware
// Configure CORS to allow requests from frontend
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/api/health', (req, res) => {
  logger.info('Health check requested');
  res.status(200).json({ 
    status: 'success', 
    message: 'EKYC API Server is running',
    timestamp: new Date().toISOString(),
    port: process.env.PORT,
    database: 'Connected'
  });
});

// Root health check for Railway
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    service: 'EKYC Backend API',
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/kyc', kycRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Internal server error', { error: err.message, stack: err.stack, path: req.path });
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
const PORT = Number.parseInt(process.env.PORT, 10) || 5000;
const HOST = '0.0.0.0';

logger.info(`Starting server with PORT=${PORT}, HOST=${HOST}`);
logger.info(`Environment variables: PORT=${process.env.PORT}, NODE_ENV=${process.env.NODE_ENV}`);

// Add error handling for server startup
const server = app.listen(PORT, HOST, () => {
  logger.info(`✅ EKYC API Server successfully started`);
  logger.info(`🌐 Listening on ${HOST}:${PORT}`);
  logger.info(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`📄 PDF Worker: ${process.env.RABBITMQ_URL ? 'Enabled' : 'Disabled (RabbitMQ URL not configured)'}`);
}).on('error', (err) => {
  logger.error('❌ Server failed to start', { error: err.message, port: PORT, code: err.code });
  if (err.code === 'EADDRINUSE') {
    logger.error(`Port ${PORT} is already in use`);
  }
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server and PDF Worker');
  server.close(() => {
    logger.info('HTTP server closed');
    pdfWorker.stopPdfWorker().then(() => {
      logger.info('PDF Worker stopped');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server and PDF Worker');
  server.close(() => {
    logger.info('HTTP server closed');
    pdfWorker.stopPdfWorker().then(() => {
      logger.info('PDF Worker stopped');
      process.exit(0);
    });
  });
});

module.exports = app;
