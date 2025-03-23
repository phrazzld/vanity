/**
 * Auth configuration
 * 
 * This module handles authentication validation against environment variables.
 * Future implementation will use NextAuth for more robust authentication.
 */

// Authentication functions
const auth = {
  /**
   * Validates credentials against environment variables
   * 
   * @param username - Username to validate
   * @param password - Password to validate
   * @returns Success status and user object if valid
   */
  validateCredentials(username: string, password: string) {
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
    
    // Check credentials against environment variables
    if (username === adminUsername && password === adminPassword) {
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
    console.log('Authentication failed: invalid credentials');
    return {
      success: false,
      user: null
    };
  }
};

export default auth;