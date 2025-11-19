#!/usr/bin/env node

/**
 * Test Runner for EKYC Platform
 * Runs tests individually to verify each test suite
 */

const { execSync } = require('child_process');
const path = require('path');

const testSuites = {
  backend: [
    'models/Admin.test.js',
    'models/Kyc.test.js',
    'middleware/auth.test.js',
    'services/aiService.test.js',
    'services/pdfService.test.js',
    'controllers/adminController.test.js',
    'controllers/kycController.test.js'
  ],
  frontend: [
    'components/common/FormStatus.test.tsx',
    'components/form/InputField.test.tsx',
    'services/api.test.ts',
    'pages/KycForm.test.tsx',
    'pages/AdminLogin.test.tsx',
    'pages/AdminDashboard.test.tsx'
  ]
};

function runTest(testPath, type) {
  const cwd = type === 'backend' ? path.join(__dirname, 'backend') : path.join(__dirname, 'frontend');
  const testFile = type === 'backend' 
    ? path.join('__tests__', testPath)
    : path.join('src/__tests__', testPath);
  
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Running ${type} test: ${testPath}`);
  console.log('='.repeat(80));
  
  try {
    execSync(`npm test -- ${testFile} --verbose`, {
      cwd,
      stdio: 'inherit',
      encoding: 'utf8'
    });
    console.log(`✅ PASSED: ${testPath}`);
    return true;
  } catch (error) {
    console.error(`❌ FAILED: ${testPath}`);
    return false;
  }
}

function main() {
  console.log('EKYC Platform Test Runner');
  console.log('Running tests individually...\n');
  
  const results = {
    backend: { passed: 0, failed: 0 },
    frontend: { passed: 0, failed: 0 }
  };
  
  // Run backend tests
  console.log('\n' + '='.repeat(80));
  console.log('BACKEND TESTS');
  console.log('='.repeat(80));
  
  for (const test of testSuites.backend) {
    const passed = runTest(test, 'backend');
    if (passed) {
      results.backend.passed++;
    } else {
      results.backend.failed++;
    }
  }
  
  // Run frontend tests
  console.log('\n' + '='.repeat(80));
  console.log('FRONTEND TESTS');
  console.log('='.repeat(80));
  
  for (const test of testSuites.frontend) {
    const passed = runTest(test, 'frontend');
    if (passed) {
      results.frontend.passed++;
    } else {
      results.frontend.failed++;
    }
  }
  
  // Print summary
  console.log('\n' + '='.repeat(80));
  console.log('TEST SUMMARY');
  console.log('='.repeat(80));
  console.log(`Backend:  ${results.backend.passed} passed, ${results.backend.failed} failed`);
  console.log(`Frontend: ${results.frontend.passed} passed, ${results.frontend.failed} failed`);
  console.log(`Total:    ${results.backend.passed + results.frontend.passed} passed, ${results.backend.failed + results.frontend.failed} failed`);
  console.log('='.repeat(80));
  
  const allPassed = results.backend.failed === 0 && results.frontend.failed === 0;
  process.exit(allPassed ? 0 : 1);
}

main();
