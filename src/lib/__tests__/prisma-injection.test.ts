import { PrismaClient } from '@prisma/client';
import { readingsDb, quotesDb } from '../db';

// These tests demonstrate that Prisma's query builder is effective
// at preventing SQL injection attacks.
// These are more like integration tests than unit tests.

// IMPORTANT: These tests should NOT be run against a production database!
// They are meant to be run against a test/development database only.

// Skip these tests if not specifically enabled
// This prevents accidentally running these tests against real databases
const ENABLE_PRISMA_INJECTION_TESTS = process.env.ENABLE_PRISMA_INJECTION_TESTS === 'true';

// We'll always skip these integration tests by default
// Only run them when explicitly enabled through the environment variable
// This is because they require a running database and could potentially 
// run destructive operations if misconfigured
const runTests = false;

describe('Prisma SQL Injection Protection (Integration Tests)', () => {
  // Only run these tests if explicitly enabled
  (ENABLE_PRISMA_INJECTION_TESTS ? describe : describe.skip)('Actual Prisma Client Tests', () => {
    let prismaClient: PrismaClient;
    
    beforeAll(() => {
      // Create a new Prisma client for these tests
      prismaClient = new PrismaClient();
    });
    
    afterAll(async () => {
      // Clean up the Prisma client
      await prismaClient.$disconnect();
    });
    
    describe('Type Safety Protection', () => {
      it('should sanitize malicious input in findUnique operations', async () => {
        // This tests that Prisma's type safety prevents SQL injection
        // without relying on our code's validation
        
        // A malicious ID parameter that attempts SQL injection
        const maliciousId = "1; DROP TABLE \"Quote\"; --";
        
        // Directly use Prisma client to attempt the attack
        const result = await prismaClient.quote.findUnique({
          where: {
            // TypeScript would catch this at compile time, but
            // we're testing runtime protection
            // @ts-ignore
            id: maliciousId
          }
        });
        
        // The malicious SQL should not be executed
        // The query should simply return null (no match)
        expect(result).toBeNull();
        
        // If the attack worked, we would have lost data.
        // Verify we can still query the quotes table
        const count = await prismaClient.quote.count();
        // We just need to verify the count is a number (table exists)
        expect(typeof count).toBe('number');
      });
      
      it('should sanitize malicious input in where conditions', async () => {
        // A malicious search string
        const maliciousSearch = "'; DROP TABLE \"Reading\"; --";
        
        // Directly use Prisma client with the malicious input
        const result = await prismaClient.reading.findMany({
          where: {
            OR: [
              { title: { contains: maliciousSearch, mode: 'insensitive' } },
              { author: { contains: maliciousSearch, mode: 'insensitive' } }
            ]
          },
          take: 10
        });
        
        // The query should execute safely, just returning no results
        expect(Array.isArray(result)).toBe(true);
        
        // Verify the table still exists
        const count = await prismaClient.reading.count();
        expect(typeof count).toBe('number');
      });
    });

    describe('Parameterized Queries Protection', () => {
      it('should safely handle malicious input in $queryRaw with parameters', async () => {
        // Test that $queryRaw with proper parameterization is safe
        const maliciousSearch = "'; DROP TABLE \"Reading\"; --";
        
        // Use $queryRaw with parameters (the safe way)
        const result = await prismaClient.$queryRaw`
          SELECT id, title FROM "Reading" 
          WHERE title ILIKE ${'%' + maliciousSearch + '%'}
          LIMIT 10
        `;
        
        // The query should execute safely
        expect(Array.isArray(result)).toBe(true);
        
        // Verify the table still exists
        const count = await prismaClient.reading.count();
        expect(typeof count).toBe('number');
      });
      
      // This demonstrates that careless use of $queryRawUnsafe is dangerous
      it('should be vulnerable to SQL injection with $queryRawUnsafe if not careful', async () => {
        // DON'T do this in real code! This shows what NOT to do.
        // This test is skipped to prevent accidental data loss
        
        // This test demonstrates the danger of string concatenation
        // with $queryRawUnsafe. Our app avoids this pattern.
        if (false) { // Extra protection to never run this
          const maliciousInput = "'; DROP TABLE \"TestTable\"; --";
          
          // THIS IS THE WRONG WAY - direct string concatenation
          const dangerousQuery = `
            SELECT * FROM "Reading" WHERE title = '${maliciousInput}'
          `;
          
          // We're not actually executing this to avoid data loss
          // await prismaClient.$queryRawUnsafe(dangerousQuery);
        }
        
        // Instead, our app would use proper parameterization
        const maliciousInput = "'; DROP TABLE \"Reading\"; --";
        
        // THE RIGHT WAY - using parameters
        const query = `
          SELECT COUNT(*) FROM "Reading" WHERE title ILIKE $1
        `;
        
        const result = await prismaClient.$queryRawUnsafe(
          query,
          `%${maliciousInput}%`
        );
        
        // The query should execute safely
        expect(Array.isArray(result)).toBe(true);
        
        // Verify the table still exists
        const count = await prismaClient.reading.count();
        expect(typeof count).toBe('number');
      });
    });
    
    describe('Database Methods Protection', () => {
      it('should safely handle malicious input in getReading method', async () => {
        // Test our actual getReading method with malicious input
        const maliciousSlug = "valid-slug'; DROP TABLE \"Reading\"; --";
        
        // Call getReading with the malicious input
        const result = await readingsDb.getReading(maliciousSlug);
        
        // The method should handle the input safely
        expect(result).toBeNull(); // Just no matching reading
        
        // Verify the table still exists
        const count = await prismaClient.reading.count();
        expect(typeof count).toBe('number');
      });
      
      it('should safely handle malicious input in getQuote method', async () => {
        // Test our actual getQuote method with malicious input
        // This would parse to NaN which is handled safely
        const maliciousId = Number("1; DROP TABLE \"Quote\"; --");
        
        // Call getQuote with the malicious input
        const result = await quotesDb.getQuote(maliciousId);
        
        // The method should handle the input safely
        expect(result).toBeNull(); // Just no matching quote
        
        // Verify the table still exists
        const count = await prismaClient.quote.count();
        expect(typeof count).toBe('number');
      });
      
      it('should safely handle malicious input in getReadingsWithFilters method', async () => {
        // Test our actual getReadingsWithFilters method with malicious input
        const maliciousParams = {
          search: "'; DROP TABLE \"Reading\"; --",
          sortBy: "invalid; DROP TABLE; --", // This should be validated to a safe default
          sortOrder: "invalid'; --", // This should be validated to a safe default
          limit: "1000; --" as any, // This should be validated to a safe number
          offset: "0; DROP--" as any // This should be validated to a safe number
        };
        
        // Call getReadingsWithFilters with the malicious input
        const result = await readingsDb.getReadingsWithFilters(maliciousParams);
        
        // The method should handle the input safely
        expect(result).toHaveProperty('data');
        expect(Array.isArray(result.data)).toBe(true);
        
        // Verify the table still exists
        const count = await prismaClient.reading.count();
        expect(typeof count).toBe('number');
      });
    });
  });
});