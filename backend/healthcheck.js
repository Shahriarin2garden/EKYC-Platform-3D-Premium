#!/usr/bin/env node
/**
 * Simple health check script for Railway
 * This script can be used as a health check probe
 */

const http = require('http');

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

const options = {
  host: HOST,
  port: PORT,
  path: '/api/health',
  timeout: 5000,
  method: 'GET'
};

const request = http.request(options, (res) => {
  console.log(`Health check status: ${res.statusCode}`);
  
  if (res.statusCode === 200) {
    process.exit(0); // Success
  } else {
    process.exit(1); // Failure
  }
});

request.on('error', (err) => {
  console.error(`Health check failed: ${err.message}`);
  process.exit(1);
});

request.on('timeout', () => {
  console.error('Health check timeout');
  request.destroy();
  process.exit(1);
});

request.end();
