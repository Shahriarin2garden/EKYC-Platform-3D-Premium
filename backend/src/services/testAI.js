/**
 * Test AI Service
 * Run this to test if the AI service is working correctly
 */

require('dotenv').config();
const aiService = require('./aiService');

console.log('🧪 Testing AI Service...\n');

// Test data
const testKycData = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  nid: '1234567890',
  occupation: 'Software Engineer',
  address: '123 Main Street, New York, NY 10001',
  submittedAt: new Date()
};

async function testAIService() {
  try {
    console.log('📊 Test KYC Data:');
    console.log(JSON.stringify(testKycData, null, 2));
    console.log('\n' + '═'.repeat(60) + '\n');

    // Check if AI is enabled
    console.log('🔍 Checking configuration...');
    console.log(`   API Key configured: ${aiService.isEnabled() ? '✅ Yes' : '❌ No'}`);
    console.log(`   Model: ${process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct:free'}`);
    console.log('\n' + '═'.repeat(60) + '\n');

    // Generate summary
    console.log('🤖 Generating AI summary...\n');
    const startTime = Date.now();
    
    const summary = await aiService.generateKycSummary(testKycData);
    
    const duration = Date.now() - startTime;
    
    console.log('✅ Summary generated successfully!\n');
    console.log('═'.repeat(60));
    console.log('📋 GENERATED SUMMARY:');
    console.log('═'.repeat(60));
    console.log(summary);
    console.log('═'.repeat(60));
    console.log(`\n⏱️  Generation time: ${duration}ms`);
    console.log(`📏 Summary length: ${summary.length} characters`);
    
    // Determine if AI was used
    const usedAI = aiService.isEnabled() && !summary.includes('📋 KYC Application Summary\n\n👤');
    console.log(`🎯 AI Model used: ${usedAI ? '✅ Yes' : '❌ No (fallback mode)'}`);
    
    console.log('\n✅ Test completed successfully!\n');

    if (!aiService.isEnabled()) {
      console.log('💡 TIP: To use AI-generated summaries:');
      console.log('   1. Get a free API key from https://openrouter.ai/keys');
      console.log('   2. Add to backend/.env: OPENROUTER_API_KEY=your_key_here');
      console.log('   3. Run: node backend/src/services/setupAI.js\n');
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  }
}

// Run test
testAIService();
