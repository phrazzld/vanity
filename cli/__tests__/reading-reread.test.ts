import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import {
  findExistingReadings,
  getNextRereadFilename,
  getMostRecentReading,
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
});
