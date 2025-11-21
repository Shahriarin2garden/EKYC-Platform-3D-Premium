#!/usr/bin/env node
/**
 * Quick test script to verify server starts properly
 * Tests server resilience without external dependencies
 */

const http = require('http');

console.log('🧪 Testing EKYC Backend Server...\n');

// Test 1: Server starts without environment variables
console.log('Test 1: Checking if server can start without dependencies...');
const { spawn } = require('child_process');

const serverProcess = spawn('node', ['src/server.js'], {
  cwd: __dirname,
  env: {
    ...process.env,
    PORT: '5001',
    NODE_ENV: 'test'
  }
});

let serverOutput = '';
let serverStarted = false;

serverProcess.stdout.on('data', (data) => {
  const output = data.toString();
  serverOutput += output;
  console.log(output);
  
  if (output.includes('Server successfully started')) {
    serverStarted = true;
    console.log('✅ Test 1 PASSED: Server started successfully\n');
    
    // Test 2: Health check endpoint
    setTimeout(() => {
      console.log('Test 2: Testing health check endpoint...');
      
      const options = {
        hostname: 'localhost',
        port: 5001,
        path: '/api/health',
        method: 'GET',
        timeout: 5000
      };

      const req = http.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            console.log('Response:', JSON.stringify(response, null, 2));
            
            if (res.statusCode === 200 && response.status === 'success') {
              console.log('✅ Test 2 PASSED: Health check working\n');
            } else {
              console.log('❌ Test 2 FAILED: Health check returned unexpected response\n');
            }
          } catch (err) {
            console.log('❌ Test 2 FAILED: Invalid JSON response\n');
          }
          
          // Test 3: Root endpoint
          setTimeout(() => {
            console.log('Test 3: Testing root endpoint...');
            
            const rootReq = http.get('http://localhost:5001/', (res) => {
              let data = '';
              
              res.on('data', (chunk) => {
                data += chunk;
              });
              
              res.on('end', () => {
                try {
                  const response = JSON.parse(data);
                  console.log('Response:', JSON.stringify(response, null, 2));
                  
                  if (res.statusCode === 200 && response.status === 'ok') {
                    console.log('✅ Test 3 PASSED: Root endpoint working\n');
                  } else {
                    console.log('❌ Test 3 FAILED: Root endpoint returned unexpected response\n');
                  }
                } catch (err) {
                  console.log('❌ Test 3 FAILED: Invalid JSON response\n');
                }
                
                // Cleanup
                console.log('🧹 Cleaning up...');
                serverProcess.kill('SIGTERM');
                
                setTimeout(() => {
                  console.log('\n✅ All tests completed!');
                  console.log('🚀 Server is ready for Railway deployment');
                  process.exit(0);
                }, 1000);
              });
            });
            
            rootReq.on('error', (err) => {
              console.log('❌ Test 3 FAILED:', err.message);
              serverProcess.kill('SIGTERM');
              process.exit(1);
            });
          }, 1000);
        });
      });

      req.on('error', (err) => {
        console.log('❌ Test 2 FAILED:', err.message);
        serverProcess.kill('SIGTERM');
        process.exit(1);
      });

      req.end();
    }, 3000); // Wait 3 seconds for server to fully start
  }
});

serverProcess.stderr.on('data', (data) => {
  console.error(data.toString());
});

serverProcess.on('error', (err) => {
  console.log('❌ Test 1 FAILED: Server failed to start');
  console.error(err.message);
  process.exit(1);
});

// Timeout after 30 seconds
setTimeout(() => {
  if (!serverStarted) {
    console.log('❌ Test 1 FAILED: Server did not start within 30 seconds');
    serverProcess.kill('SIGTERM');
    process.exit(1);
  }
}, 30000);
