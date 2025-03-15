import prisma from '../prisma';

// Mock console spies
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('Database Connection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  it('creates a singleton Prisma instance', () => {
    // Import the client again to test the singleton pattern
    const prisma2 = require('../prisma').default;
    
    // Should be the same instance
    expect(prisma).toBe(prisma2);
  });

  it('uses a single PrismaClient instance', () => {
    // Basic test to verify the prisma object exists
    expect(prisma).toBeDefined();
  });

  it('has proper database methods', () => {
    // Verify that the prisma client has expected methods
    expect(typeof prisma.$queryRaw).toBe('function');
    expect(typeof prisma.$disconnect).toBe('function');
  });
});