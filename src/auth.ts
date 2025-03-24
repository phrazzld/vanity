/**
 * Auth configuration
 * 
 * This module handles authentication validation against environment variables.
 * Future implementation will use NextAuth for more robust authentication.
 */
import bcrypt from 'bcrypt';

// Authentication functions
const auth = {
  /**
   * Validates credentials against environment variables
   * 
   * @param username - Username to validate
   * @param password - Password to validate
   * @returns Success status and user object if valid
   */
  async validateCredentials(username: string, password: string) {
    // Get environment variables without fallbacks for security
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    // Check if environment variables are properly configured
    if (!adminUsername || !adminPassword) {
      console.error('Authentication configuration error: Missing environment variables');
      return {
        success: false,
        user: null,
        message: "Authentication system is not properly configured"
      };
    }
    
    // Log auth attempt (masking username for privacy)
    const maskedUsername = username.length > 2 
      ? `${username.substring(0, 2)}${'*'.repeat(username.length - 2)}`
      : '***';
    console.log(`Auth attempt for user: ${maskedUsername}`);
    
    // First, check the username matches
    if (username !== adminUsername) {
      console.log('Authentication failed: invalid username');
      return {
        success: false,
        user: null
      };
    }
    
    // Determine if the stored password is already hashed (bcrypt hashes start with $2b$)
    const isPasswordHashed = adminPassword.startsWith('$2b$');
    
    let passwordMatches = false;
    
    // Compare passwords - either using bcrypt or direct comparison for backward compatibility
    if (isPasswordHashed) {
      try {
        // Use bcrypt to compare password with the stored hash
        passwordMatches = await bcrypt.compare(password, adminPassword);
      } catch (error) {
        console.error('Authentication error during password comparison:', error);
        return {
          success: false,
          user: null,
          message: "Authentication error occurred"
        };
      }
    } else {
      // Fallback to direct comparison for backward compatibility
      // This branch will be used if the admin password is not yet hashed
      console.warn('Using plaintext password comparison. Consider hashing the ADMIN_PASSWORD');
      passwordMatches = password === adminPassword;
    }
    
    // Check if password matches
    if (passwordMatches) {
      console.log('Authentication successful');
      return {
        success: true,
        user: {
          id: "1",
          name: "Admin",
          email: "admin@example.com",
          role: "admin"
        }
      };
    }
    
    // Invalid credentials
    console.log('Authentication failed: invalid password');
    return {
      success: false,
      user: null
    };
  },

  /**
   * Generates a hashed password for storage in environment variables
   * 
   * @param password - Plain text password to hash
   * @param saltRounds - Number of salt rounds to use (default: 10)
   * @returns Hashed password
   */
  async hashPassword(password: string, saltRounds: number = 10): Promise<string> {
    return bcrypt.hash(password, saltRounds);
  }
};

export default auth;