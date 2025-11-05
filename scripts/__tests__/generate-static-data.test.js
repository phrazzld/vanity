/**
 * Integration tests for Static Data Generation with Reread Detection
 *
 * Tests that the static data generator correctly processes markdown files,
 * detects rereads, and outputs valid JSON with readCount/baseSlug fields.
 */

/* eslint-env jest */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

describe('Static Data Generation with Rereads', () => {
  const dataDir = path.join(process.cwd(), 'public', 'data');
  const readingsFile = path.join(dataDir, 'readings.json');
  const hashFile = path.join(dataDir, '.content-hash');

  let readingsData;
  let scriptOutput;

  beforeAll(() => {
    // Clear cache to force regeneration and capture output
    if (fs.existsSync(hashFile)) {
      fs.unlinkSync(hashFile);
    }

    // Run script once and capture output
    scriptOutput = execSync('npx tsx scripts/generate-static-data.ts', {
      cwd: process.cwd(),
      encoding: 'utf8',
    });

    // Read generated JSON once
    readingsData = JSON.parse(fs.readFileSync(readingsFile, 'utf8'));
  });

  describe('JSON Output Structure', () => {
    it('generates readings.json with correct structure', () => {
      expect(readingsData).toHaveProperty('data');
      expect(readingsData).toHaveProperty('totalCount');
      expect(readingsData).toHaveProperty('hasMore');
      expect(Array.isArray(readingsData.data)).toBe(true);
    });

    it('includes readCount field in readings', () => {
      // Every reading should have readCount field
      readingsData.data.forEach(reading => {
        expect(reading).toHaveProperty('readCount');
        expect(typeof reading.readCount).toBe('number');
        expect(reading.readCount).toBeGreaterThanOrEqual(1);
      });
    });

    it('includes baseSlug field in readings', () => {
      readingsData.data.forEach(reading => {
        expect(reading).toHaveProperty('baseSlug');
        expect(typeof reading.baseSlug).toBe('string');
        expect(reading.baseSlug.length).toBeGreaterThan(0);
      });
    });

    it('first read has readCount=1', () => {
      // Find a base reading (without -02, -03 suffix in slug)
      const baseReading = readingsData.data.find(r => !r.slug.match(/-\d+$/) && r.readCount === 1);

      expect(baseReading).toBeDefined();
      expect(baseReading.readCount).toBe(1);
    });

    it('second read has readCount=2', () => {
      // Find a reread (with -02 suffix)
      const reread = readingsData.data.find(r => r.slug.match(/-02$/));

      if (reread) {
        expect(reread.readCount).toBe(2);
      }
    });

    it('rereads share same baseSlug', () => {
      // Find a book with rereads (e.g., how-to-read-a-book)
      const firstRead = readingsData.data.find(r => r.slug === 'how-to-read-a-book');
      const secondRead = readingsData.data.find(r => r.slug === 'how-to-read-a-book-02');

      if (firstRead && secondRead) {
        expect(firstRead.baseSlug).toBe('how-to-read-a-book');
        expect(secondRead.baseSlug).toBe('how-to-read-a-book');
      }
    });
  });

  describe('Reread Detection', () => {
    it('detects existing rereads in content/readings/', () => {
      const rereads = readingsData.data.filter(r => r.readCount > 1);
      expect(rereads.length).toBeGreaterThan(0);
    });

    it('groups files correctly by baseSlug', () => {
      // Group by baseSlug
      const grouped = readingsData.data.reduce((acc, reading) => {
        const base = reading.baseSlug;
        if (!acc[base]) acc[base] = [];
        acc[base].push(reading);
        return acc;
      }, {});

      // Check that rereads are properly grouped
      Object.entries(grouped).forEach(([_baseSlug, books]) => {
        if (books.length > 1) {
          // Verify readCounts are sequential
          const counts = books.map(b => b.readCount).sort((a, b) => a - b);
          counts.forEach((count, idx) => {
            expect(count).toBe(idx + 1);
          });
        }
      });
    });

    it('computes correct readCount for each file', () => {
      // Find books with multiple reads
      const baseSlugCounts = {};
      readingsData.data.forEach(r => {
        const base = r.baseSlug;
        baseSlugCounts[base] = (baseSlugCounts[base] || 0) + 1;
      });

      // Verify readCount matches position in sequence
      readingsData.data.forEach(reading => {
        const totalReads = baseSlugCounts[reading.baseSlug];
        expect(reading.readCount).toBeGreaterThan(0);
        expect(reading.readCount).toBeLessThanOrEqual(totalReads);
      });
    });
  });

  describe('Logging Output', () => {
    it('logs reread detection summary', () => {
      expect(scriptOutput).toMatch(/Detected \d+ rereads/i);
    });

    it('logs unique book count', () => {
      expect(scriptOutput).toMatch(/\d+ unique books/i);
    });
  });

  describe('Error Handling', () => {
    it('handles orphaned reread files gracefully', () => {
      // All readings should have valid readCount ≥1
      readingsData.data.forEach(reading => {
        expect(reading.readCount).toBeGreaterThanOrEqual(1);
      });
    });

    it('build completes successfully despite potential warnings', () => {
      // If we got here, the build completed
      expect(readingsData).toBeDefined();
      expect(readingsData.data).toBeDefined();
      expect(readingsData.data.length).toBeGreaterThan(0);
    });

    it('JSON output is valid and parseable', () => {
      // If beforeAll succeeded, JSON is valid
      expect(readingsData).toHaveProperty('data');
      expect(Array.isArray(readingsData.data)).toBe(true);
    });
  });
});
