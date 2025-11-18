# EKYC Platform - Logging System Documentation

## Overview

The EKYC Platform uses **Winston**, a powerful and flexible logging library for Node.js, to provide comprehensive logging capabilities across the entire application.

## Features

✅ **Multi-level logging**: error, warn, info, http, debug  
✅ **Daily log rotation**: Automatic file rotation by date  
✅ **Colored console output**: Easy-to-read console logs in development  
✅ **JSON structured logs**: Machine-readable log files  
✅ **Component-specific logging**: Dedicated loggers for database, RabbitMQ, PDF, AI, etc.  
✅ **Automatic cleanup**: Old logs are automatically deleted based on retention policy  
✅ **Production-ready**: Configured for both development and production environments

## Installation

The required packages are already installed:

```bash
npm install winston winston-daily-rotate-file
```

## Log Levels

| Level   | Priority | Use Case |
|---------|----------|----------|
| `error` | 0        | Error messages, exceptions, failures |
| `warn`  | 1        | Warning messages, deprecations, fallbacks |
| `info`  | 2        | General information, startup messages |
| `http`  | 3        | HTTP requests/responses |
| `debug` | 4        | Detailed debugging (development only) |

## Log Files

Logs are stored in the `backend/logs/` directory:

### Error Logs
- **File**: `error-YYYY-MM-DD.log`
- **Retention**: 30 days
- **Max Size**: 20MB per file
- **Content**: Only error-level messages

### Combined Logs
- **File**: `combined-YYYY-MM-DD.log`
- **Retention**: 30 days
- **Max Size**: 20MB per file
- **Content**: All log levels

### HTTP Logs
- **File**: `http-YYYY-MM-DD.log`
- **Retention**: 14 days
- **Max Size**: 20MB per file
- **Content**: HTTP request/response logs

## Usage Examples

### Basic Logging

```javascript
const logger = require('./config/logger');

// Info level
logger.info('Server started successfully');

// Warning level
logger.warn('API rate limit approaching');

// Error level
logger.error('Database connection failed', { error: err.message });

// Debug level (development only)
logger.debug('Request payload', { data: req.body });
```

### Component-Specific Logging

```javascript
const logger = require('./config/logger');

// Database operations
logger.database('MongoDB connected', { host: 'localhost', port: 27017 });

// RabbitMQ operations
logger.rabbitmq('Message sent to queue', { queue: 'pdf_generation_queue' });

// Authentication
logger.auth('User logged in', { email: 'user@example.com' });

// KYC operations
logger.kyc('KYC application submitted', { id: '12345', email: 'user@example.com' });

// PDF generation
logger.pdf('PDF generated successfully', { filename: 'kyc_12345.pdf' });

// AI service
logger.ai('AI summary generated', { model: 'llama-3.1-8b', tokens: 250 });

// API requests
logger.api('GET /api/kyc/12345', { status: 200, duration: '120ms' });
```

### Logging with Metadata

```javascript
// Include additional context
logger.info('User action performed', {
  userId: req.user.id,
  action: 'download_pdf',
  timestamp: new Date(),
  ipAddress: req.ip
});

// Error with stack trace
try {
  // Some operation
} catch (error) {
  logger.error('Operation failed', {
    error: error.message,
    stack: error.stack,
    userId: req.user.id
  });
}
```

## Environment-Based Configuration

### Development Mode
- **Log Level**: `debug` (all messages)
- **Console Output**: Colored, human-readable format
- **File Output**: JSON format

### Production Mode
- **Log Level**: `info` (info and above)
- **Console Output**: Structured JSON format
- **File Output**: JSON format
- **Recommendation**: Use external log aggregation service

## Viewing Logs

### View Today's Combined Logs
```bash
cat logs/combined-$(date +%Y-%m-%d).log
```

### View Today's Errors
```bash
cat logs/error-$(date +%Y-%m-%d).log
```

### Follow Logs in Real-Time
```bash
# Windows PowerShell
Get-Content logs/combined-*.log -Wait -Tail 50

# Linux/Mac
tail -f logs/combined-*.log
```

### Search Logs
```bash
# Windows PowerShell
Select-String "KYC" logs/combined-*.log

# Linux/Mac
grep "KYC" logs/combined-*.log
```

### Filter by Log Level
```bash
# Find all errors
grep '"level":"error"' logs/combined-*.log

# Find all warnings
grep '"level":"warn"' logs/combined-*.log
```

## Best Practices

### ✅ DO

1. **Use appropriate log levels**
   ```javascript
   logger.info('User logged in');  // ✅ Good
   logger.error('Payment failed', { error }); // ✅ Good
   ```

2. **Include context in metadata**
   ```javascript
   logger.error('Failed to process', {
     userId: user.id,
     operation: 'payment',
     error: err.message
   });
   ```

3. **Use component-specific loggers**
   ```javascript
   logger.database('Connection established');
   logger.pdf('PDF generated');
   ```

4. **Log important business events**
   ```javascript
   logger.kyc('Application submitted', { id, status });
   logger.auth('Login attempt', { email, success: true });
   ```

### ❌ DON'T

1. **Don't log sensitive data**
   ```javascript
   // ❌ Bad
   logger.info('User data', { password: user.password });
   
   // ✅ Good
   logger.info('User authenticated', { email: user.email });
   ```

2. **Don't use console.log**
   ```javascript
   // ❌ Bad
   console.log('Server started');
   
   // ✅ Good
   logger.info('Server started');
   ```

3. **Don't log in tight loops**
   ```javascript
   // ❌ Bad
   for (let i = 0; i < 10000; i++) {
     logger.debug('Processing', { i });
   }
   
   // ✅ Good
   logger.info('Processing started', { total: 10000 });
   // Process items
   logger.info('Processing completed');
   ```

## Migration from console.log

All `console.log` and `console.error` calls have been replaced with the appropriate logger methods:

| Old Code | New Code |
|----------|----------|
| `console.log('message')` | `logger.info('message')` |
| `console.error('error')` | `logger.error('error', { error })` |
| `console.log('DB connected')` | `logger.database('Connected')` |
| `console.log('PDF done')` | `logger.pdf('Generated')` |

## Monitoring & Alerting

### For Production

Consider integrating with:

1. **ELK Stack** (Elasticsearch, Logstash, Kibana)
2. **Datadog**
3. **New Relic**
4. **AWS CloudWatch**
5. **Google Cloud Logging**

### Setting Up CloudWatch (Example)

```javascript
const { WinstonCloudWatch } = require('winston-cloudwatch');

logger.add(new WinstonCloudWatch({
  logGroupName: 'ekyc-platform',
  logStreamName: 'backend-api',
  awsRegion: 'us-east-1'
}));
```

## Troubleshooting

### Logs Not Appearing

1. **Check log level**: Ensure your environment's log level includes the message level
2. **Check file permissions**: Ensure the `logs/` directory is writable
3. **Check disk space**: Log rotation requires disk space

### Logs Growing Too Large

1. **Adjust retention period** in `logger.js`:
   ```javascript
   maxFiles: '14d'  // Change to '7d' for 7 days
   ```

2. **Adjust max file size**:
   ```javascript
   maxSize: '10m'  // Change to '10m' for 10MB
   ```

### Performance Impact

- Winston is highly optimized and adds minimal overhead
- File I/O is asynchronous and non-blocking
- In high-traffic scenarios, consider using log bufferring

## Log Rotation Schedule

| Log Type | Rotation | Max Size | Retention |
|----------|----------|----------|-----------|
| Error    | Daily    | 20MB     | 30 days   |
| Combined | Daily    | 20MB     | 30 days   |
| HTTP     | Daily    | 20MB     | 14 days   |

## Summary

The EKYC Platform now has a comprehensive, production-ready logging system that:

- ✅ Replaces all console.log/console.error calls
- ✅ Provides structured, searchable logs
- ✅ Automatically rotates and cleans up log files
- ✅ Supports different log levels for different environments
- ✅ Includes component-specific logging for better organization
- ✅ Ready for integration with external monitoring services

For questions or issues, refer to the Winston documentation: https://github.com/winstonjs/winston
