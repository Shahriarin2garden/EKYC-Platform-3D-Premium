#!/usr/bin/env node

/**
 * OpenRouter Setup Helper
 * This script helps you configure the AI service for KYC summaries
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║     🤖 OpenRouter AI Service Setup                         ║
║     Configure AI-powered KYC summaries                     ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝

This setup will help you configure the AI service for generating
intelligent KYC application summaries.

`);

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setup() {
  try {
    console.log('📝 Step 1: Get your OpenRouter API Key\n');
    console.log('   1. Visit: https://openrouter.ai/keys');
    console.log('   2. Sign up for a FREE account (no credit card needed)');
    console.log('   3. Create an API key');
    console.log('   4. Copy the API key\n');

    const hasKey = await question('Do you have your API key ready? (yes/no): ');

    if (hasKey.toLowerCase() !== 'yes' && hasKey.toLowerCase() !== 'y') {
      console.log('\n✋ No problem! Come back and run this script when you have your key.');
      console.log('   Run: node backend/src/services/setupAI.js\n');
      rl.close();
      return;
    }

    const apiKey = await question('\n🔑 Paste your OpenRouter API key: ');

    if (!apiKey || apiKey.trim().length < 10) {
      console.log('\n❌ Invalid API key. Please try again with a valid key.');
      rl.close();
      return;
    }

    console.log('\n\n🤖 Step 2: Choose an AI Model\n');
    console.log('Available FREE models:');
    console.log('   1. Llama 3.1 8B (Recommended - Best balance)');
    console.log('   2. Mistral 7B (Fast and efficient)');
    console.log('   3. Gemma 2 9B (Google\'s model)');
    console.log('   4. Llama 3.2 3B (Fastest, lighter)\n');

    const modelChoice = await question('Select model (1-4, default: 1): ') || '1';

    const models = {
      '1': 'meta-llama/llama-3.1-8b-instruct:free',
      '2': 'mistralai/mistral-7b-instruct:free',
      '3': 'google/gemma-2-9b-it:free',
      '4': 'meta-llama/llama-3.2-3b-instruct:free'
    };

    const selectedModel = models[modelChoice] || models['1'];

    // Update .env file
    const envPath = path.join(__dirname, '../../.env');
    let envContent = '';

    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    // Update or add OPENROUTER_API_KEY
    if (envContent.includes('OPENROUTER_API_KEY=')) {
      envContent = envContent.replace(
        /OPENROUTER_API_KEY=.*/,
        `OPENROUTER_API_KEY=${apiKey.trim()}`
      );
    } else {
      envContent += `\n\n# OpenRouter AI Configuration\nOPENROUTER_API_KEY=${apiKey.trim()}\n`;
    }

    // Update or add OPENROUTER_MODEL
    if (envContent.includes('OPENROUTER_MODEL=')) {
      envContent = envContent.replace(
        /OPENROUTER_MODEL=.*/,
        `OPENROUTER_MODEL=${selectedModel}`
      );
    } else {
      envContent += `OPENROUTER_MODEL=${selectedModel}\n`;
    }

    // Update or add APP_URL
    if (!envContent.includes('APP_URL=')) {
      envContent += `APP_URL=http://localhost:3000\n`;
    }

    fs.writeFileSync(envPath, envContent);

    console.log('\n\n✅ Configuration saved successfully!\n');
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('📋 Your Configuration:');
    console.log(`   API Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 10)}`);
    console.log(`   Model: ${selectedModel}`);
    console.log(`   Config File: ${envPath}\n`);
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('🚀 Next Steps:\n');
    console.log('   1. Restart your backend server:');
    console.log('      cd backend && npm start\n');
    console.log('   2. Submit a KYC application - AI summary will be generated automatically!\n');
    console.log('   3. View summaries in the Admin Dashboard\n');
    console.log('📚 For more information, see: backend/AI_SERVICE_SETUP.md\n');

  } catch (error) {
    console.error('\n❌ Error during setup:', error.message);
  } finally {
    rl.close();
  }
}

setup();
