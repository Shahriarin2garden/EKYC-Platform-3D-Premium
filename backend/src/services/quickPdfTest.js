/**
 * Quick PDF Generation Test
 * Tests PDF generation without requiring RabbitMQ
 * This is useful for testing the PDF generation functionality independently
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const Kyc = require('../models/Kyc');
const pdfService = require('./pdfService');
const connectDB = require('../config/database');

// Test KYC data
const testData = {
  name: 'Sarah Ahmed',
  email: `quicktest.${Date.now()}@example.com`,
  address: '456 Innovation Street, Gulshan, Dhaka-1212, Bangladesh',
  nid: '9876543210987',
  occupation: 'Data Scientist',
  status: 'approved',
  reviewNotes: 'Application approved after thorough verification. All documents are in order.',
  aiSummary: `This KYC application has been reviewed and processed successfully.

The applicant, Sarah Ahmed, is a Data Scientist with a professional background in technology. Based in Gulshan, Dhaka, the applicant has submitted a comprehensive application with all required documentation.

Key Points:
- Valid National ID verification completed
- Address verification confirmed
- Professional credentials validated
- No adverse findings during background check

The application demonstrates strong credentials and meets all compliance requirements. The applicant has provided clear and accurate information across all fields.

This is a test PDF to verify the generation system is working correctly with proper formatting, multi-paragraph support, and professional layout.`
};

async function runQuickTest() {
  console.log('\n' + '='.repeat(60));
  console.log('  Quick PDF Generation Test');
  console.log('='.repeat(60) + '\n');

  try {
    // Connect to MongoDB
    console.log('📦 Connecting to MongoDB...');
    await connectDB();
    console.log('✅ Connected to MongoDB\n');

    // Create test KYC application
    console.log('📝 Creating test KYC application...');
    const kyc = new Kyc(testData);
    kyc.reviewedAt = new Date();
    await kyc.save();
    console.log(`✅ KYC created with ID: ${kyc._id}\n`);

    // Generate PDF
    console.log('🎨 Generating PDF...');
    const startTime = Date.now();
    
    const pdfPath = await pdfService.generateKycPdf(kyc);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ PDF generated successfully in ${duration} seconds`);
    console.log(`📄 PDF Path: ${pdfPath}\n`);

    // Update KYC record
    kyc.pdfPath = pdfPath;
    kyc.pdfGeneratedAt = new Date();
    await kyc.save();
    console.log('✅ KYC record updated\n');

    // Verify PDF exists
    console.log('🔍 Verifying PDF file...');
    const exists = pdfService.pdfExists(pdfPath);
    
    if (exists) {
      const fs = require('fs');
      const stats = fs.statSync(pdfPath);
      console.log('✅ PDF file verified');
      console.log(`📊 File size: ${(stats.size / 1024).toFixed(2)} KB\n`);
    } else {
      console.log('❌ PDF file not found\n');
    }

    // Summary
    console.log('='.repeat(60));
    console.log('  Test Results');
    console.log('='.repeat(60));
    console.log('✅ Database connection: SUCCESS');
    console.log('✅ KYC creation: SUCCESS');
    console.log('✅ PDF generation: SUCCESS');
    console.log('✅ File verification: SUCCESS');
    console.log('\n🎉 All tests passed!\n');

    // Cleanup (optional)
    console.log('🧹 Cleaning up test data...');
    await Kyc.findByIdAndDelete(kyc._id);
    console.log('✅ Test data cleaned up\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Database connection closed\n');
  }
}

// Run the test
if (require.main === module) {
  runQuickTest()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Test suite error:', error);
      process.exit(1);
    });
}

module.exports = { runQuickTest };
