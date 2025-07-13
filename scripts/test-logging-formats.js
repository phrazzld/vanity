#!/usr/bin/env node
/**
 * Test script to validate logging formats in different environments
 *
 * This script tests:
 * 1. Development format (human-readable)
 * 2. Production format (JSON)
 * 3. All mandatory fields are present
 */

/* eslint-env node */
 
const { execSync } = require('child_process');

// Create a simple test API call to generate logs
async function testLoggingFormats() {
  console.log('🧪 Testing logging formats...\n');

  // Test development format
  console.log('1. Testing DEVELOPMENT format (human-readable)...');
  try {
    process.env.NODE_ENV = 'development';
    const devOutput = execSync(
      "node -e \"const { logger, createLogContext } = require('./src/lib/logger'); logger.info('Test development log', createLogContext('test-script', 'validateFormats', { test_data: 'dev_mode' }));\"",
      { encoding: 'utf-8', cwd: process.cwd() }
    );
    console.log('✅ Development format output:');
    console.log(devOutput);
  } catch (error) {
    console.error('❌ Development format failed:', error.message);
  }

  // Test production format
  console.log('\n2. Testing PRODUCTION format (JSON)...');
  try {
    process.env.NODE_ENV = 'production';
    const prodOutput = execSync(
      "node -e \"const { logger, createLogContext } = require('./src/lib/logger'); logger.info('Test production log', createLogContext('test-script', 'validateFormats', { test_data: 'prod_mode' }));\"",
      { encoding: 'utf-8', cwd: process.cwd() }
    );
    console.log('✅ Production format output:');
    console.log(prodOutput);

    // Try to parse as JSON to validate format
    try {
      const logLine = prodOutput.trim().split('\n')[0];
      const parsed = JSON.parse(logLine);
      console.log('✅ Successfully parsed as JSON');

      // Check mandatory fields (logger outputs flattened fields, not nested context)
      const requiredFields = ['timestamp', 'level', 'message', 'module_name', 'function_name'];
      const missingFields = requiredFields.filter(field => !(field in parsed));

      if (missingFields.length === 0) {
        console.log('✅ All mandatory fields present:', requiredFields.join(', '));
      } else {
        console.log('❌ Missing mandatory fields:', missingFields.join(', '));
      }

      // Check flattened context fields are present at root level
      if (parsed.module_name && parsed.function_name) {
        console.log('✅ Context fields valid (module_name, function_name at root level)');
      } else {
        console.log('❌ Context fields invalid - missing module_name or function_name');
      }
    } catch (parseError) {
      console.error('❌ Failed to parse production output as JSON:', parseError.message);
    }
  } catch (error) {
    console.error('❌ Production format failed:', error.message);
  }

  // Test error format with stack trace
  console.log('\n3. Testing ERROR format with stack trace...');
  try {
    process.env.NODE_ENV = 'production';
    const errorOutput = execSync(
      "node -e \"const { logger, createLogContext } = require('./src/lib/logger'); logger.error('Test error log', createLogContext('test-script', 'validateFormats', { test_error: true }), new Error('Test error message'));\"",
      { encoding: 'utf-8', cwd: process.cwd() }
    );
    console.log('✅ Error format output:');
    console.log(errorOutput);

    // Check for stack trace in error logs
    if (errorOutput.includes('stack')) {
      console.log('✅ Stack trace present in error logs');
    } else {
      console.log('❌ Stack trace missing in error logs');
    }
  } catch (error) {
    console.error('❌ Error format test failed:', error.message);
  }

  console.log('\n📊 Environment testing complete!');
}

// Run the tests
testLoggingFormats().catch(console.error);
