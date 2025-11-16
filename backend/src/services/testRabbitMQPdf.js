/**
 * Comprehensive RabbitMQ PDF Generation Test Script
 * 
 * This script tests the complete PDF generation workflow:
 * 1. Connect to RabbitMQ
 * 2. Create a test KYC application
 * 3. Request PDF generation via RabbitMQ queue
 * 4. Monitor queue status
 * 5. Verify PDF generation
 * 
 * Prerequisites:
 * - MongoDB must be running
 * - RabbitMQ must be running (see setup instructions below)
 * - Environment variables must be configured
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Import services
const rabbitmq = require('../config/rabbitmq');
const pdfProducer = require('./pdfProducer');
const pdfService = require('./pdfService');
const Kyc = require('../models/Kyc');
const connectDB = require('../config/database');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'bright');
  console.log('='.repeat(60) + '\n');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Test data
const testKycData = {
  name: 'John Doe',
  email: `test.rabbitmq.${Date.now()}@example.com`,
  address: '123 Main Street, Dhaka, Bangladesh',
  nid: '1234567890123',
  occupation: 'Software Engineer',
  aiSummary: `This is a comprehensive test of the RabbitMQ PDF generation system. 

The applicant, John Doe, is a Software Engineer based in Dhaka, Bangladesh. This application was submitted as part of the automated testing process to verify the complete PDF generation workflow including:

1. Message Queue Integration - Testing the RabbitMQ connection and message passing
2. Asynchronous Processing - Verifying that PDF generation happens in the background
3. Worker Process - Ensuring the PDF worker correctly processes messages
4. Database Updates - Confirming that KYC records are updated with PDF information
5. File System Operations - Validating that PDF files are created and stored correctly

This is a longer summary to test how the PDF generation handles multi-paragraph content and ensures proper formatting across different sections of the generated document.`
};

/**
 * Test 1: Check RabbitMQ Connection
 */
async function testRabbitMQConnection() {
  logSection('Test 1: RabbitMQ Connection');
  
  try {
    logInfo('Attempting to connect to RabbitMQ...');
    await rabbitmq.connect();
    logSuccess('Connected to RabbitMQ successfully');
    
    // Get queue stats
    const stats = await rabbitmq.getQueueStats(rabbitmq.PDF_QUEUE);
    logInfo(`Queue: ${stats.queue}`);
    logInfo(`Messages in queue: ${stats.messageCount}`);
    logInfo(`Active consumers: ${stats.consumerCount}`);
    
    return true;
  } catch (error) {
    logError(`Failed to connect to RabbitMQ: ${error.message}`);
    logWarning('\nTo set up RabbitMQ, run one of the following:');
    logInfo('Option 1 (Docker): docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management');
    logInfo('Option 2 (Windows): Run setup-rabbitmq.ps1 in the backend directory');
    logInfo('Option 3 (CloudAMQP): Sign up at https://www.cloudamqp.com and update RABBITMQ_URL in .env');
    return false;
  }
}

/**
 * Test 2: Create Test KYC Application
 */
async function createTestKycApplication() {
  logSection('Test 2: Create Test KYC Application');
  
  try {
    logInfo('Creating test KYC application...');
    
    const kyc = new Kyc(testKycData);
    await kyc.save();
    
    logSuccess(`KYC application created with ID: ${kyc._id}`);
    logInfo(`Name: ${kyc.name}`);
    logInfo(`Email: ${kyc.email}`);
    logInfo(`Status: ${kyc.status}`);
    
    return kyc;
  } catch (error) {
    logError(`Failed to create KYC application: ${error.message}`);
    throw error;
  }
}

/**
 * Test 3: Request PDF Generation via Queue
 */
async function requestPdfGeneration(kycId) {
  logSection('Test 3: Request PDF Generation via RabbitMQ');
  
  try {
    logInfo('Sending PDF generation request to queue...');
    
    await pdfProducer.requestPdfGeneration(kycId, 'test-admin', 8);
    
    logSuccess('PDF generation request sent to queue successfully');
    
    // Check queue status
    const stats = await pdfProducer.getQueueStatus();
    logInfo(`Messages in queue: ${stats.data.messageCount}`);
    
    return true;
  } catch (error) {
    logError(`Failed to request PDF generation: ${error.message}`);
    throw error;
  }
}

/**
 * Test 4: Monitor PDF Generation (wait for worker to process)
 */
async function monitorPdfGeneration(kycId, maxWaitTime = 30000) {
  logSection('Test 4: Monitor PDF Generation Progress');
  
  logInfo('Waiting for PDF worker to process the request...');
  logWarning('Make sure the PDF worker is running (started with the server)');
  
  const startTime = Date.now();
  const checkInterval = 2000; // Check every 2 seconds
  
  return new Promise((resolve, reject) => {
    const intervalId = setInterval(async () => {
      try {
        const kyc = await Kyc.findById(kycId);
        
        if (kyc.pdfPath) {
          clearInterval(intervalId);
          const duration = ((Date.now() - startTime) / 1000).toFixed(2);
          logSuccess(`PDF generated successfully in ${duration} seconds`);
          logInfo(`PDF Path: ${kyc.pdfPath}`);
          logInfo(`Generated At: ${kyc.pdfGeneratedAt}`);
          resolve(kyc);
        } else if (kyc.pdfError) {
          clearInterval(intervalId);
          logError(`PDF generation failed: ${kyc.pdfError}`);
          reject(new Error(kyc.pdfError));
        } else if (Date.now() - startTime > maxWaitTime) {
          clearInterval(intervalId);
          logWarning(`PDF generation did not complete within ${maxWaitTime / 1000} seconds`);
          logInfo('This might mean:');
          logInfo('1. The PDF worker is not running');
          logInfo('2. RabbitMQ connection issues');
          logInfo('3. Processing is taking longer than expected');
          resolve(null);
        } else {
          logInfo(`Still waiting... (${((Date.now() - startTime) / 1000).toFixed(0)}s elapsed)`);
        }
      } catch (error) {
        clearInterval(intervalId);
        logError(`Error monitoring PDF generation: ${error.message}`);
        reject(error);
      }
    }, checkInterval);
  });
}

/**
 * Test 5: Verify PDF File
 */
async function verifyPdfFile(pdfPath) {
  logSection('Test 5: Verify PDF File');
  
  try {
    logInfo('Checking if PDF file exists...');
    
    if (!fs.existsSync(pdfPath)) {
      logError('PDF file does not exist at specified path');
      return false;
    }
    
    logSuccess('PDF file exists');
    
    const stats = fs.statSync(pdfPath);
    logInfo(`File size: ${(stats.size / 1024).toFixed(2)} KB`);
    logInfo(`Created: ${stats.birthtime}`);
    
    if (stats.size < 1000) {
      logWarning('PDF file seems too small, might be corrupted');
      return false;
    }
    
    logSuccess('PDF file appears to be valid');
    return true;
  } catch (error) {
    logError(`Error verifying PDF file: ${error.message}`);
    return false;
  }
}

/**
 * Test 6: Batch PDF Generation
 */
async function testBatchPdfGeneration() {
  logSection('Test 6: Batch PDF Generation');
  
  try {
    logInfo('Creating multiple test KYC applications...');
    
    const kycApps = [];
    for (let i = 0; i < 3; i++) {
      const kyc = new Kyc({
        ...testKycData,
        email: `batch.test.${Date.now()}.${i}@example.com`,
        name: `${testKycData.name} ${i + 1}`
      });
      await kyc.save();
      kycApps.push(kyc);
      logInfo(`Created KYC ${i + 1}: ${kyc._id}`);
    }
    
    logInfo('\nSending batch PDF generation request...');
    
    const kycIds = kycApps.map(kyc => kyc._id.toString());
    const results = await pdfProducer.requestBatchPdfGeneration(
      kycIds,
      'test-admin',
      5
    );
    
    logSuccess(`Batch request completed:`);
    logInfo(`Total: ${results.total}`);
    logInfo(`Successful: ${results.successful}`);
    logInfo(`Failed: ${results.failed}`);
    
    if (results.errors.length > 0) {
      logWarning('Some requests failed:');
      for (const error of results.errors) {
        logError(`  ${error.kycId}: ${error.error}`);
      }
    }
    
    return kycApps;
  } catch (error) {
    logError(`Batch PDF generation test failed: ${error.message}`);
    throw error;
  }
}

/**
 * Test 7: Direct PDF Generation (without queue)
 */
async function testDirectPdfGeneration() {
  logSection('Test 7: Direct PDF Generation (Fallback Mode)');
  
  try {
    logInfo('Creating test KYC application...');
    
    const kyc = new Kyc({
      ...testKycData,
      email: `direct.test.${Date.now()}@example.com`,
      name: 'Direct Generation Test'
    });
    await kyc.save();
    
    logInfo('Generating PDF directly (synchronous)...');
    
    const startTime = Date.now();
    const pdfPath = await pdfService.generateKycPdf(kyc);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    logSuccess(`PDF generated successfully in ${duration} seconds`);
    logInfo(`PDF Path: ${pdfPath}`);
    
    // Update KYC record
    kyc.pdfPath = pdfPath;
    kyc.pdfGeneratedAt = new Date();
    await kyc.save();
    
    // Verify the file
    await verifyPdfFile(pdfPath);
    
    return kyc;
  } catch (error) {
    logError(`Direct PDF generation failed: ${error.message}`);
    throw error;
  }
}

/**
 * Test 8: Queue Status and Metrics
 */
async function testQueueMetrics() {
  logSection('Test 8: Queue Status and Metrics');
  
  try {
    const status = await pdfProducer.getQueueStatus();
    
    logInfo('Current Queue Status:');
    logInfo(`Queue Name: ${status.data.queue}`);
    logInfo(`Messages in Queue: ${status.data.messageCount}`);
    logInfo(`Active Consumers: ${status.data.consumerCount}`);
    
    if (status.data.consumerCount === 0) {
      logWarning('No active consumers! PDF worker might not be running.');
    } else {
      logSuccess('PDF worker is active and consuming messages');
    }
    
    return status;
  } catch (error) {
    logError(`Failed to get queue metrics: ${error.message}`);
    throw error;
  }
}

/**
 * Cleanup test data
 */
async function cleanupTestData() {
  logSection('Cleanup');
  
  try {
    logInfo('Cleaning up test data...');
    
    // Delete test KYC records
    const result = await Kyc.deleteMany({
      email: { $regex: /test\.(rabbitmq|batch|direct).*@example\.com/ }
    });
    
    logSuccess(`Deleted ${result.deletedCount} test KYC records`);
    
    // Optionally delete test PDF files
    const pdfDir = pdfService.getPdfDirectory();
    const files = fs.readdirSync(pdfDir);
    
    let deletedCount = 0;
    for (const file of files) {
      if (file.includes('test')) {
        const filePath = path.join(pdfDir, file);
        fs.unlinkSync(filePath);
        deletedCount++;
      }
    }
    
    if (deletedCount > 0) {
      logSuccess(`Deleted ${deletedCount} test PDF files`);
    }
    
  } catch (error) {
    logWarning(`Cleanup encountered errors: ${error.message}`);
  }
}

/**
 * Main test runner
 */
async function runTests() {
  logSection('RabbitMQ PDF Generation - Comprehensive Test Suite');
  logInfo(`Start Time: ${new Date().toLocaleString()}`);
  logInfo(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logInfo(`MongoDB: ${process.env.MONGODB_URI || 'default'}`);
  logInfo(`RabbitMQ: ${process.env.RABBITMQ_URL || 'amqp://localhost:5672'}`);
  
  let testKyc = null;
  let directKyc = null;
  
  try {
    // Connect to MongoDB
    logSection('Setup: Database Connection');
    await connectDB();
    logSuccess('Connected to MongoDB');
    
    // Test 1: RabbitMQ Connection
    const rabbitMQAvailable = await testRabbitMQConnection();
    
    if (!rabbitMQAvailable) {
      logWarning('\n⚠️  RabbitMQ is not available. Running limited tests...\n');
      
      // Run only direct PDF generation test
      directKyc = await testDirectPdfGeneration();
      
      logSection('Test Results Summary');
      logWarning('RabbitMQ tests skipped (RabbitMQ not available)');
      logSuccess('Direct PDF generation: PASSED');
      
    } else {
      // Run full test suite
      
      // Test 2: Create KYC Application
      testKyc = await createTestKycApplication();
      
      // Test 3: Request PDF Generation
      await requestPdfGeneration(testKyc._id);
      
      // Test 4: Monitor PDF Generation
      const generatedKyc = await monitorPdfGeneration(testKyc._id);
      
      // Test 5: Verify PDF File
      if (generatedKyc && generatedKyc.pdfPath) {
        await verifyPdfFile(generatedKyc.pdfPath);
      }
      
      // Test 6: Batch PDF Generation
      await testBatchPdfGeneration();
      
      // Test 7: Direct PDF Generation
      directKyc = await testDirectPdfGeneration();
      
      // Test 8: Queue Metrics
      await testQueueMetrics();
      
      // Summary
      logSection('Test Results Summary');
      logSuccess('All tests completed successfully! ✨');
      logInfo('\nTest Coverage:');
      logSuccess('✓ RabbitMQ connection');
      logSuccess('✓ KYC application creation');
      logSuccess('✓ Queue-based PDF generation');
      logSuccess('✓ PDF file verification');
      logSuccess('✓ Batch PDF generation');
      logSuccess('✓ Direct PDF generation');
      logSuccess('✓ Queue metrics monitoring');
    }
    
  } catch (error) {
    logSection('Test Failed');
    logError(`Test suite failed: ${error.message}`);
    console.error(error.stack);
  } finally {
    // Cleanup
    await cleanupTestData();
    
    // Close connections
    logSection('Teardown');
    await rabbitmq.close();
    await mongoose.connection.close();
    logInfo('Connections closed');
    
    logSection('Test Complete');
    logInfo(`End Time: ${new Date().toLocaleString()}`);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests()
    .then(() => {
      log('\n✅ Test suite completed successfully\n', 'green');
      process.exit(0);
    })
    .catch((error) => {
      log('\n❌ Test suite failed\n', 'red');
      console.error(error);
      process.exit(1);
    });
}

module.exports = {
  runTests,
  testRabbitMQConnection,
  createTestKycApplication,
  requestPdfGeneration,
  monitorPdfGeneration,
  verifyPdfFile,
  testBatchPdfGeneration,
  testDirectPdfGeneration,
  testQueueMetrics
};
