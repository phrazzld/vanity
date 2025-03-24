import auth from '../auth';
import bcrypt from 'bcrypt';

// Mock environment variables
const originalEnv = process.env;

describe('Auth module', () => {
  beforeEach(() => {
    // Mock environment variables before each test
    jest.resetModules();
    process.env = { ...originalEnv };
    process.env.ADMIN_USERNAME = 'admin_test';
    // Default to plaintext password for backward compatibility tests
    process.env.ADMIN_PASSWORD = 'password123';
    
    // Mock console methods to prevent noise during tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore environment variables
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  describe('validateCredentials', () => {
    it('should return success for valid plaintext credentials', async () => {
      const result = await auth.validateCredentials('admin_test', 'password123');
      expect(result.success).toBe(true);
      expect(result.user).toHaveProperty('id', '1');
      expect(result.user).toHaveProperty('role', 'admin');
    });

    it('should return failure for invalid username', async () => {
      const result = await auth.validateCredentials('wrong_user', 'password123');
      expect(result.success).toBe(false);
      expect(result.user).toBeNull();
      expect(result.message).toBe('Invalid credentials');
    });

    it('should return failure for invalid password', async () => {
      const result = await auth.validateCredentials('admin_test', 'wrong_password');
      expect(result.success).toBe(false);
      expect(result.user).toBeNull();
      expect(result.message).toBe('Invalid credentials');
    });

    it('should return failure when environment variables are missing', async () => {
      // Remove environment variables
      delete process.env.ADMIN_USERNAME;
      delete process.env.ADMIN_PASSWORD;
      
      const result = await auth.validateCredentials('admin_test', 'password123');
      expect(result.success).toBe(false);
      expect(result.user).toBeNull();
      expect(result.message).toBe('Authentication system is not properly configured');
    });

    it('should support bcrypt hashed passwords', async () => {
      // Generate a real bcrypt hash for "password123"
      const hashedPassword = await bcrypt.hash('password123', 10);
      process.env.ADMIN_PASSWORD = hashedPassword;
      
      const result = await auth.validateCredentials('admin_test', 'password123');
      expect(result.success).toBe(true);
      expect(result.user).toHaveProperty('role', 'admin');
    });

    it('should reject incorrect passwords when using bcrypt hash', async () => {
      // Generate a real bcrypt hash for "password123"
      const hashedPassword = await bcrypt.hash('password123', 10);
      process.env.ADMIN_PASSWORD = hashedPassword;
      
      const result = await auth.validateCredentials('admin_test', 'wrong_password');
      expect(result.success).toBe(false);
      expect(result.user).toBeNull();
      expect(result.message).toBe('Invalid credentials');
    });

    it('should handle bcrypt errors gracefully', async () => {
      // Mock bcrypt.compare to throw an error
      const originalCompare = bcrypt.compare;
      bcrypt.compare = jest.fn().mockRejectedValue(new Error('Bcrypt error'));
      
      try {
        // Set a valid-looking hash but bcrypt.compare is mocked to throw
        process.env.ADMIN_PASSWORD = '$2b$10$validLookingHashButMockedToFail';
        
        const result = await auth.validateCredentials('admin_test', 'password123');
        expect(result.success).toBe(false);
        expect(result.user).toBeNull();
        expect(result.message).toBe('Authentication error occurred');
      } finally {
        // Restore original bcrypt.compare function
        bcrypt.compare = originalCompare;
      }
    });
  });

  describe('hashPassword', () => {
    it('should generate a valid bcrypt hash', async () => {
      const password = 'test_password';
      const hash = await auth.hashPassword(password);
      
      // Should start with bcrypt identifier
      expect(hash).toMatch(/^\$2b\$/);
      
      // Should be a valid hash that can be verified
      const isValid = await bcrypt.compare(password, hash);
      expect(isValid).toBe(true);
    });

    it('should accept custom salt rounds', async () => {
      const password = 'test_password';
      const hash = await auth.hashPassword(password, 12);
      
      // Should have the specified salt rounds (12)
      expect(hash).toMatch(/^\$2b\$12\$/);
      
      // Should be a valid hash
      const isValid = await bcrypt.compare(password, hash);
      expect(isValid).toBe(true);
    });
    
    it('should generate different hashes for the same password', async () => {
      const password = 'same_password';
      const hash1 = await auth.hashPassword(password);
      const hash2 = await auth.hashPassword(password);
      
      // Hashes should be different due to different salt
      expect(hash1).not.toBe(hash2);
      
      // Both should still verify against the original password
      expect(await bcrypt.compare(password, hash1)).toBe(true);
      expect(await bcrypt.compare(password, hash2)).toBe(true);
    });
    
    it('should reject incorrect passwords against valid hash', async () => {
      const correctPassword = 'correct_password';
      const wrongPassword = 'wrong_password';
      
      const hash = await auth.hashPassword(correctPassword);
      
      // Correct password should verify
      expect(await bcrypt.compare(correctPassword, hash)).toBe(true);
      
      // Wrong password should not verify
      expect(await bcrypt.compare(wrongPassword, hash)).toBe(false);
    });
    
    it('should handle empty passwords', async () => {
      const emptyPassword = '';
      const hash = await auth.hashPassword(emptyPassword);
      
      // Should be a valid bcrypt hash
      expect(hash).toMatch(/^\$2b\$/);
      
      // Should verify against the empty string
      expect(await bcrypt.compare(emptyPassword, hash)).toBe(true);
      
      // Should not verify against other strings
      expect(await bcrypt.compare('not_empty', hash)).toBe(false);
    });
  });
  
  describe('Authentication flow with password hashing', () => {
    it('should authenticate with password generated by hashPassword', async () => {
      const username = 'admin_test';
      const password = 'secure_password';
      
      // First, hash the password
      const hashedPassword = await auth.hashPassword(password);
      
      // Set the hashed password in environment
      process.env.ADMIN_USERNAME = username;
      process.env.ADMIN_PASSWORD = hashedPassword;
      
      // Now try to authenticate
      const result = await auth.validateCredentials(username, password);
      
      // Should authenticate successfully
      expect(result.success).toBe(true);
      expect(result.user).toHaveProperty('role', 'admin');
    });
    
    it('should reject wrong passwords against hashPassword generated hash', async () => {
      const username = 'admin_test';
      const correctPassword = 'correct_password';
      const wrongPassword = 'wrong_password';
      
      // First, hash the correct password
      const hashedPassword = await auth.hashPassword(correctPassword);
      
      // Set the hashed password in environment
      process.env.ADMIN_USERNAME = username;
      process.env.ADMIN_PASSWORD = hashedPassword;
      
      // Try to authenticate with the wrong password
      const result = await auth.validateCredentials(username, wrongPassword);
      
      // Should fail authentication
      expect(result.success).toBe(false);
      expect(result.user).toBeNull();
      expect(result.message).toBe('Invalid credentials');
    });
    
    it('should work with different salt rounds', async () => {
      const username = 'admin_test';
      const password = 'secure_password';
      
      // Test with different salt rounds
      for (const saltRounds of [8, 10, 12]) {
        // Hash the password with specific salt rounds
        const hashedPassword = await auth.hashPassword(password, saltRounds);
        
        // Set the hashed password in environment
        process.env.ADMIN_USERNAME = username;
        process.env.ADMIN_PASSWORD = hashedPassword;
        
        // Try to authenticate
        const result = await auth.validateCredentials(username, password);
        
        // Should authenticate successfully regardless of salt rounds
        expect(result.success).toBe(true);
        expect(result.user).toHaveProperty('role', 'admin');
      }
    });
  });
});