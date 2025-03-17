/**
 * Auth configuration
 *
 * This is a simple placeholder for the NextAuth configuration.
 * In a real implementation, we would include the full NextAuth configuration.
 */

// Simple placeholder for authentication functions
const auth = {
  /**
   * Validates credentials against environment variables
   *
   * @param username - Username to validate
   * @param password - Password to validate
   * @returns Success status and user object if valid
   */
  validateCredentials(username: string, password: string) {
    // Get environment variables with fallbacks for development
    const adminUsername = process.env.ADMIN_USERNAME || "admin";
    const adminPassword = process.env.ADMIN_PASSWORD || "password123";

    // Log auth attempt (without printing actual passwords)
    console.log(`Auth attempt for user: ${username}`);
    console.log(`Expected admin username: ${adminUsername}`);
    console.log(
      `Environment variables present: ${!!process.env.ADMIN_USERNAME}, ${!!process.env.ADMIN_PASSWORD}`,
    );

    // Check if someone is trying to use the demo credentials shown on the page
    if (
      username === "admin" &&
      password === "password123" &&
      (adminUsername !== "admin" || adminPassword !== "password123")
    ) {
      console.log(
        "Authentication failed: someone tried using the demo credentials",
      );
      return {
        success: false,
        user: null,
        message: "lol you really thought that would work?",
      };
    }

    // Check credentials against environment variables
    if (username === adminUsername && password === adminPassword) {
      console.log("Authentication successful");
      return {
        success: true,
        user: {
          id: "1",
          name: "Admin",
          email: "admin@example.com",
          role: "admin",
        },
      };
    }

    // Invalid credentials
    console.log("Authentication failed: invalid credentials");
    return {
      success: false,
      user: null,
    };
  },
};

export default auth;
