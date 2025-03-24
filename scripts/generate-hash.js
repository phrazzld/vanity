/**
 * Password Hash Generator Utility
 * 
 * Generates a bcrypt hash for use with the application's authentication system.
 * 
 * Usage: 
 *   node scripts/generate-hash.js password123
 * 
 * The script will output the bcrypt hash that can be used in the .env file
 * for the ADMIN_PASSWORD variable.
 */

const bcrypt = require('bcrypt');

// Default salt rounds - higher is more secure but slower
const SALT_ROUNDS = 10;

async function generateHash() {
  // Get password from command line arguments
  const password = process.argv[2];
  
  if (!password) {
    console.error('Error: No password provided');
    console.log('\nUsage: node scripts/generate-hash.js <your-password>');
    console.log('Example: node scripts/generate-hash.js mySecurePassword123');
    process.exit(1);
  }
  
  try {
    // Generate bcrypt hash
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    
    console.log('\n=== Password Hash Generated ===');
    console.log('\nBcrypt Hash:');
    console.log(hash);
    
    console.log('\nAdd this to your .env file:');
    console.log(`ADMIN_PASSWORD="${hash}"`);
    
    console.log('\nInformation:');
    console.log('- This hash includes the salt, cost factor, and algorithm identifier');
    console.log('- The format $2b$10$ indicates bcrypt algorithm with 10 rounds');
    console.log('- Each time you run this script, you\'ll get a different hash (different salt)');
    console.log('- All are valid for the same password');
    
  } catch (error) {
    console.error('Error generating hash:', error);
    process.exit(1);
  }
}

// Run the function
generateHash();