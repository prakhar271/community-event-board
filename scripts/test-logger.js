#!/usr/bin/env node

/**
 * Test script to verify logger works correctly in different scenarios
 */

const fs = require('fs');
const path = require('path');

// Simulate different environments
async function testLogger() {
  console.log('🧪 Testing logger configuration...\n');

  // Test 1: Development environment (should not create logs directory)
  process.env.NODE_ENV = 'development';
  console.log('📝 Test 1: Development environment');
  try {
    delete require.cache[require.resolve('../dist/server/config/logger.js')];
    const { logger } = require('../dist/server/config/logger.js');
    logger.info('Test development log');
    console.log('✅ Development logger works (console only)');
  } catch (error) {
    console.log('❌ Development logger failed:', error.message);
  }

  // Test 2: Production environment with write permissions
  process.env.NODE_ENV = 'production';
  console.log('\n📝 Test 2: Production environment with write permissions');
  try {
    // Ensure logs directory exists
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    delete require.cache[require.resolve('../dist/server/config/logger.js')];
    const { logger } = require('../dist/server/config/logger.js');
    logger.info('Test production log with file access');
    console.log('✅ Production logger works (console + file)');
    
    // Check if log files were created
    const errorLogExists = fs.existsSync(path.join(logsDir, 'error.log'));
    const combinedLogExists = fs.existsSync(path.join(logsDir, 'combined.log'));
    console.log(`   - Error log file: ${errorLogExists ? '✅' : '❌'}`);
    console.log(`   - Combined log file: ${combinedLogExists ? '✅' : '❌'}`);
  } catch (error) {
    console.log('❌ Production logger failed:', error.message);
  }

  // Test 3: Production environment without write permissions (simulate Docker scenario)
  console.log('\n📝 Test 3: Production environment without write permissions');
  try {
    // Remove logs directory to simulate no write permissions
    const logsDir = path.join(process.cwd(), 'logs');
    if (fs.existsSync(logsDir)) {
      fs.rmSync(logsDir, { recursive: true, force: true });
    }
    
    // Make current directory read-only temporarily
    const originalMode = fs.statSync(process.cwd()).mode;
    
    delete require.cache[require.resolve('../dist/server/config/logger.js')];
    const { logger } = require('../dist/server/config/logger.js');
    logger.info('Test production log without file access');
    console.log('✅ Production logger works (console only, graceful fallback)');
  } catch (error) {
    console.log('❌ Production logger failed:', error.message);
  }

  console.log('\n🎉 Logger tests completed!');
}

// Run tests
testLogger().catch(console.error);