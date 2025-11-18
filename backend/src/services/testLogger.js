/**
 * Quick test to verify Winston logging is working correctly
 * Run: node src/services/testLogger.js
 */

const logger = require('../config/logger');

console.log('\n=== Testing Winston Logger ===\n');

// Test basic logging levels
logger.info('✅ Info level logging works');
logger.warn('⚠️  Warning level logging works');
logger.error('❌ Error level logging works', { 
  error: 'This is a test error',
  stack: 'Test stack trace'
});
logger.debug('🐛 Debug level logging works (only in development)');

// Test component-specific loggers
console.log('\n=== Testing Component-Specific Loggers ===\n');

logger.database('Database logger works', { 
  operation: 'connect',
  host: 'localhost'
});

logger.rabbitmq('RabbitMQ logger works', { 
  queue: 'test_queue',
  messageCount: 5
});

logger.auth('Auth logger works', { 
  action: 'login',
  email: 'test@example.com'
});

logger.kyc('KYC logger works', { 
  action: 'submit',
  id: 'TEST123'
});

logger.pdf('PDF logger works', { 
  action: 'generate',
  filename: 'test.pdf'
});

logger.ai('AI logger works', { 
  model: 'llama-3.1',
  tokens: 250
});

logger.api('API logger works', { 
  method: 'GET',
  path: '/api/test',
  status: 200
});

console.log('\n=== Test Complete ===');
console.log('\nCheck the following locations:');
console.log('1. Console output above (should be colored)');
console.log('2. backend/logs/combined-*.log (all logs)');
console.log('3. backend/logs/error-*.log (error logs only)');
console.log('\nIf you see colored output above and log files are created,');
console.log('the logging system is working correctly! ✅\n');
