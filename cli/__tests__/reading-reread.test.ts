import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import {
  findExistingReadings,
  getNextRereadFilename,
  getMostRecentReading,
  parseRereadSlug,
  buildRereadMap,
  computeReadCount,
  validateRereadSequences,
} from '../lib/reading-reread';

describe('reading-reread', () => {
  let testDir: string;
  let readingsDir: string;

  beforeEach(() => {
    // Create temp directory for testing
    testDir = join(tmpdir(), `reading-reread-test-${Date.now()}`);
    readingsDir = join(testDir, 'readings');
    mkdirSync(readingsDir, { recursive: true });
  });

  afterEach(() => {
    // Cleanup temp directories
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('findExistingReadings', () => {
    it('should return empty array when directory does not exist', () => {
      const nonExistentDir = join(testDir, 'nonexistent');
      const result = findExistingReadings('1984', nonExistentDir);
      expect(result).toEqual([]);
    });

    it('should return empty array when no matching files exist', () => {
      writeFileSync(join(readingsDir, 'other-book.md'), 'content');
      const result = findExistingReadings('1984', readingsDir);
      expect(result).toEqual([]);
    });

    it('should find base reading file', () => {
      writeFileSync(join(readingsDir, '1984.md'), 'content');
      const result = findExistingReadings('1984', readingsDir);
      expect(result).toEqual(['1984.md']);
    });

    it('should find base file and numbered rereads', () => {
      writeFileSync(join(readingsDir, '1984.md'), 'content');
      writeFileSync(join(readingsDir, '1984-02.md'), 'content');
      writeFileSync(join(readingsDir, '1984-03.md'), 'content');

      const result = findExistingReadings('1984', readingsDir);
      expect(result).toEqual(['1984.md', '1984-02.md', '1984-03.md']);
    });

    it('should sort base file first, then numbered versions', () => {
      // Create files in non-sorted order
      writeFileSync(join(readingsDir, '1984-03.md'), 'content');
      writeFileSync(join(readingsDir, '1984.md'), 'content');
      writeFileSync(join(readingsDir, '1984-02.md'), 'content');

      const result = findExistingReadings('1984', readingsDir);
      expect(result).toEqual(['1984.md', '1984-02.md', '1984-03.md']);
    });

    it('should not match files with different slugs', () => {
      writeFileSync(join(readingsDir, '1984.md'), 'content');
      writeFileSync(join(readingsDir, '1984-redux.md'), 'content'); // Different pattern
      writeFileSync(join(readingsDir, 'animal-farm.md'), 'content');

      const result = findExistingReadings('1984', readingsDir);
      expect(result).toEqual(['1984.md']);
    });

    it('should handle slugs with special characters', () => {
      const slug = 'dont-make-me-think';
      writeFileSync(join(readingsDir, `${slug}.md`), 'content');
      writeFileSync(join(readingsDir, `${slug}-02.md`), 'content');

      const result = findExistingReadings(slug, readingsDir);
      expect(result).toEqual([`${slug}.md`, `${slug}-02.md`]);
    });
  });

  describe('getNextRereadFilename', () => {
    it('should return base filename when no existing files', () => {
      const result = getNextRereadFilename('1984', readingsDir);
      expect(result).toBe('1984.md');
    });

    it('should return -02 filename when only base exists', () => {
      writeFileSync(join(readingsDir, '1984.md'), 'content');

      const result = getNextRereadFilename('1984', readingsDir);
      expect(result).toBe('1984-02.md');
    });

    it('should return -03 filename when base and -02 exist', () => {
      writeFileSync(join(readingsDir, '1984.md'), 'content');
      writeFileSync(join(readingsDir, '1984-02.md'), 'content');

      const result = getNextRereadFilename('1984', readingsDir);
      expect(result).toBe('1984-03.md');
    });

    it('should handle gaps in numbering sequence', () => {
      // Only base and -03 exist (skipping -02)
      writeFileSync(join(readingsDir, '1984.md'), 'content');
      writeFileSync(join(readingsDir, '1984-03.md'), 'content');

      const result = getNextRereadFilename('1984', readingsDir);
      expect(result).toBe('1984-04.md'); // Should use highest + 1
    });

    it('should zero-pad numbers correctly', () => {
      writeFileSync(join(readingsDir, '1984.md'), 'content');

      const result = getNextRereadFilename('1984', readingsDir);
      expect(result).toBe('1984-02.md'); // Not '1984-2.md'
    });

    it('should handle double-digit reread numbers', () => {
      writeFileSync(join(readingsDir, '1984.md'), 'content');
      writeFileSync(join(readingsDir, '1984-09.md'), 'content');

      const result = getNextRereadFilename('1984', readingsDir);
      expect(result).toBe('1984-10.md');
    });

    it('should work with slug containing hyphens', () => {
      const slug = 'dont-make-me-think';
      writeFileSync(join(readingsDir, `${slug}.md`), 'content');

      const result = getNextRereadFilename(slug, readingsDir);
      expect(result).toBe(`${slug}-02.md`);
    });
  });

  describe('getMostRecentReading', () => {
    it('should return null when no files exist', async () => {
      const result = await getMostRecentReading('1984', readingsDir);
      expect(result).toBeNull();
    });

    it('should return info for single reading', async () => {
      const content = `---
title: 1984
author: George Orwell
finished: 2024-01-15T00:00:00.000Z
---`;
      writeFileSync(join(readingsDir, '1984.md'), content);

      const result = await getMostRecentReading('1984', readingsDir);
      expect(result).toEqual({
        date: '2024-01-15T00:00:00.000Z',
        count: 1,
      });
    });

    it('should return null date for currently reading book', async () => {
      const content = `---
title: Dune
author: Frank Herbert
finished: null
---`;
      writeFileSync(join(readingsDir, 'dune.md'), content);

      const result = await getMostRecentReading('dune', readingsDir);
      expect(result).toEqual({
        date: null,
        count: 1,
      });
    });

    it('should return most recent reading from multiple rereads', async () => {
      // First reading (2023)
      writeFileSync(
        join(readingsDir, '1984.md'),
        `---
title: 1984
author: George Orwell
finished: 2023-01-15T00:00:00.000Z
---`
      );

      // Second reading (2024) - most recent
      writeFileSync(
        join(readingsDir, '1984-02.md'),
        `---
title: 1984
author: George Orwell
finished: 2024-06-20T00:00:00.000Z
---`
      );

      const result = await getMostRecentReading('1984', readingsDir);
      expect(result).toEqual({
        date: '2024-06-20T00:00:00.000Z',
        count: 2,
      });
    });

    it('should count all rereads including currently reading', async () => {
      writeFileSync(
        join(readingsDir, '1984.md'),
        `---
title: 1984
author: George Orwell
finished: 2023-01-15T00:00:00.000Z
---`
      );

      writeFileSync(
        join(readingsDir, '1984-02.md'),
        `---
title: 1984
author: George Orwell
finished: 2024-06-20T00:00:00.000Z
---`
      );

      // Currently reading third time
      writeFileSync(
        join(readingsDir, '1984-03.md'),
        `---
title: 1984
author: George Orwell
finished: null
---`
      );

      const result = await getMostRecentReading('1984', readingsDir);
      expect(result).toEqual({
        date: null, // Currently reading
        count: 3,
      });
    });

    it('should handle malformed frontmatter gracefully', async () => {
      writeFileSync(join(readingsDir, '1984.md'), 'Invalid frontmatter content');

      const result = await getMostRecentReading('1984', readingsDir);
      expect(result).toEqual({
        date: null,
        count: 1,
      });
    });

    it('should handle missing finished field', async () => {
      const content = `---
title: 1984
author: George Orwell
---`;
      writeFileSync(join(readingsDir, '1984.md'), content);

      const result = await getMostRecentReading('1984', readingsDir);
      expect(result).toEqual({
        date: null,
        count: 1,
      });
    });

    it('should handle file read errors gracefully', async () => {
      // Create a file we can't read (empty filename edge case)
      writeFileSync(join(readingsDir, '1984.md'), 'content');
      // Immediately delete it to simulate read error
      rmSync(join(readingsDir, '1984.md'));

      const result = await getMostRecentReading('1984', readingsDir);
      expect(result).toBeNull();
    });
  });

  describe('parseRereadSlug', () => {
    it('should parse base slug without suffix', () => {
      const result = parseRereadSlug('gatsby');
      expect(result).toEqual({ baseSlug: 'gatsby', sequence: 1 });
    });

    it('should parse slug with -02 suffix', () => {
      const result = parseRereadSlug('gatsby-02');
      expect(result).toEqual({ baseSlug: 'gatsby', sequence: 2 });
    });

    it('should parse hyphenated titles with suffix', () => {
      const result = parseRereadSlug('how-to-read-a-book-03');
      expect(result).toEqual({ baseSlug: 'how-to-read-a-book', sequence: 3 });
    });

    it('should parse high sequence numbers', () => {
      const result = parseRereadSlug('popular-book-15');
      expect(result).toEqual({ baseSlug: 'popular-book', sequence: 15 });
    });

    it('should parse suffixes without leading zero', () => {
      // The regex matches any numeric suffix, not just zero-padded
      const result = parseRereadSlug('book-2');
      expect(result).toEqual({ baseSlug: 'book', sequence: 2 });
    });

    it('should return null for null input', () => {
      const result = parseRereadSlug(null);
      expect(result).toBeNull();
    });

    it('should return null for undefined input', () => {
      const result = parseRereadSlug(undefined);
      expect(result).toBeNull();
    });

    it('should handle empty string', () => {
      const result = parseRereadSlug('');
      expect(result).toBeNull();
    });

    it('should parse double-digit sequences', () => {
      const result = parseRereadSlug('gatsby-10');
      expect(result).toEqual({ baseSlug: 'gatsby', sequence: 10 });
    });
  });

  describe('buildRereadMap', () => {
    it('should group rereads correctly', () => {
      const files = ['gatsby.md', 'gatsby-02.md'];
      const result = buildRereadMap(files);

      expect(result.get('gatsby')).toEqual(['gatsby.md', 'gatsby-02.md']);
    });

    it('should sort files by sequence within groups', () => {
      const files = ['gatsby-03.md', 'gatsby.md', 'gatsby-02.md'];
      const result = buildRereadMap(files);

      expect(result.get('gatsby')).toEqual(['gatsby.md', 'gatsby-02.md', 'gatsby-03.md']);
    });

    it('should handle single books', () => {
      const files = ['1984.md'];
      const result = buildRereadMap(files);

      expect(result.get('1984')).toEqual(['1984.md']);
    });

    it('should handle empty input', () => {
      const files: string[] = [];
      const result = buildRereadMap(files);

      expect(result.size).toBe(0);
    });

    it('should handle multiple different books', () => {
      const files = ['gatsby.md', 'gatsby-02.md', '1984.md', '1984-02.md', 'dune.md'];
      const result = buildRereadMap(files);

      expect(result.get('gatsby')).toEqual(['gatsby.md', 'gatsby-02.md']);
      expect(result.get('1984')).toEqual(['1984.md', '1984-02.md']);
      expect(result.get('dune')).toEqual(['dune.md']);
    });

    it('should handle hyphenated book titles', () => {
      const files = ['how-to-read-a-book.md', 'how-to-read-a-book-02.md'];
      const result = buildRereadMap(files);

      expect(result.get('how-to-read-a-book')).toEqual([
        'how-to-read-a-book.md',
        'how-to-read-a-book-02.md',
      ]);
    });

    it('should sort files with gaps in sequence', () => {
      const files = ['gatsby-05.md', 'gatsby.md', 'gatsby-03.md'];
      const result = buildRereadMap(files);

      expect(result.get('gatsby')).toEqual(['gatsby.md', 'gatsby-03.md', 'gatsby-05.md']);
    });
  });

  describe('computeReadCount', () => {
    it('should return 1 for first read', () => {
      const map = buildRereadMap(['gatsby.md', 'gatsby-02.md']);
      const result = computeReadCount('gatsby', map);

      expect(result).toBe(1);
    });

    it('should return 2 for second read', () => {
      const map = buildRereadMap(['gatsby.md', 'gatsby-02.md']);
      const result = computeReadCount('gatsby-02', map);

      expect(result).toBe(2);
    });

    it('should return 3 for third read', () => {
      const map = buildRereadMap(['1984.md', '1984-02.md', '1984-03.md']);
      const result = computeReadCount('1984-03', map);

      expect(result).toBe(3);
    });

    it('should return 1 for unmapped slug', () => {
      const map = buildRereadMap(['gatsby.md']);
      const result = computeReadCount('unknown', map);

      expect(result).toBe(1);
    });

    it('should handle empty map', () => {
      const map = buildRereadMap([]);
      const result = computeReadCount('gatsby', map);

      expect(result).toBe(1);
    });

    it('should compute count correctly with gaps in sequence', () => {
      const map = buildRereadMap(['gatsby.md', 'gatsby-03.md', 'gatsby-05.md']);
      // Position in sorted array determines count
      expect(computeReadCount('gatsby', map)).toBe(1); // First position
      expect(computeReadCount('gatsby-03', map)).toBe(2); // Second position
      expect(computeReadCount('gatsby-05', map)).toBe(3); // Third position
    });
  });

  describe('validateRereadSequences', () => {
    let consoleWarnSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleWarnSpy.mockRestore();
    });

    it('should not warn for valid sequence', () => {
      const map = buildRereadMap(['gatsby.md', 'gatsby-02.md', 'gatsby-03.md']);
      validateRereadSequences(map);

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should warn for sequence gap', () => {
      const map = buildRereadMap(['gatsby.md', 'gatsby-02.md', 'gatsby-04.md']);
      validateRereadSequences(map);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('gatsby: Expected -03 but found -04')
      );
    });

    it('should warn for missing base file', () => {
      const map = buildRereadMap(['gatsby-02.md', 'gatsby-03.md']);
      validateRereadSequences(map);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('gatsby: Missing base file')
      );
    });

    it('should not validate single book', () => {
      const map = buildRereadMap(['gatsby.md']);
      validateRereadSequences(map);

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should warn for unusually high count', () => {
      const files = [
        'gatsby.md',
        ...Array.from({ length: 11 }, (_, i) => `gatsby-${String(i + 2).padStart(2, '0')}.md`),
      ];
      const map = buildRereadMap(files);
      validateRereadSequences(map);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('gatsby: 12 rereads detected')
      );
    });

    it('should handle multiple sequence gaps', () => {
      const map = buildRereadMap(['gatsby.md', 'gatsby-02.md', 'gatsby-05.md', 'gatsby-08.md']);
      validateRereadSequences(map);

      expect(consoleWarnSpy).toHaveBeenCalledTimes(2);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Expected -03 but found -05')
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Expected -06 but found -08')
      );
    });
  });
});
