import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync, mkdirSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import {
  readReadingFrontmatter,
  writeReadingFrontmatter,
  updateFrontmatterField,
  createReadingFrontmatter,
} from '../lib/reading-frontmatter';

describe('reading-frontmatter', () => {
  let testDir: string;
  let testFile: string;

  beforeEach(() => {
    // Create temp directory for testing
    testDir = join(tmpdir(), `reading-frontmatter-test-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });
    testFile = join(testDir, 'test.md');
  });

  afterEach(() => {
    // Cleanup temp directory
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('readReadingFrontmatter', () => {
    it('should read and parse frontmatter from markdown file', async () => {
      const markdown = `---
title: 1984
author: George Orwell
finished: 2024-01-15T00:00:00.000Z
audiobook: false
favorite: true
---

This is a dystopian novel.`;

      await writeFile(testFile, markdown, 'utf-8');

      const result = await readReadingFrontmatter(testFile);

      // gray-matter parses numbers and dates as their native types
      expect(result.frontmatter.title).toBe(1984);
      expect(result.frontmatter.author).toBe('George Orwell');
      expect(result.frontmatter.finished).toBeInstanceOf(Date);
      expect(result.frontmatter.audiobook).toBe(false);
      expect(result.frontmatter.favorite).toBe(true);
      expect(result.content).toBe('\nThis is a dystopian novel.');
    });

    it('should handle reading with null finished date', async () => {
      const markdown = `---
title: Currently Reading
author: Test Author
finished: null
---`;

      await writeFile(testFile, markdown, 'utf-8');

      const result = await readReadingFrontmatter(testFile);

      expect(result.frontmatter.finished).toBeNull();
    });

    it('should handle reading with minimal frontmatter', async () => {
      const markdown = `---
title: Test Book
author: Test Author
finished: null
---`;

      await writeFile(testFile, markdown, 'utf-8');

      const result = await readReadingFrontmatter(testFile);

      expect(result.frontmatter).toEqual({
        title: 'Test Book',
        author: 'Test Author',
        finished: null,
      });
    });

    it('should handle empty content', async () => {
      const markdown = `---
title: Test
author: Author
finished: null
---`;

      await writeFile(testFile, markdown, 'utf-8');

      const result = await readReadingFrontmatter(testFile);

      expect(result.content).toBe('');
    });
  });

  describe('writeReadingFrontmatter', () => {
    it('should write frontmatter and content to file', async () => {
      const frontmatter = {
        title: '1984',
        author: 'George Orwell',
        finished: '2024-01-15T00:00:00.000Z' as string | null,
        audiobook: false,
        favorite: true,
      };
      const content = 'This is a dystopian novel.';

      await writeReadingFrontmatter(testFile, frontmatter, content);

      const writtenContent = await readFile(testFile, 'utf-8');
      expect(writtenContent).toContain("title: '1984'"); // gray-matter quotes strings
      expect(writtenContent).toContain('This is a dystopian novel.');
    });

    it('should write with empty content by default', async () => {
      const frontmatter = {
        title: 'Test',
        author: 'Author',
        finished: null,
      };

      await writeReadingFrontmatter(testFile, frontmatter);

      const writtenContent = await readFile(testFile, 'utf-8');
      expect(writtenContent).toContain('title: Test');
      expect(writtenContent).toContain('finished: null');
    });

    it('should handle optional fields', async () => {
      const frontmatter = {
        title: 'Test',
        author: 'Author',
        finished: null,
        coverImage: '/images/test.webp',
        audiobook: true,
        favorite: false,
      };

      await writeReadingFrontmatter(testFile, frontmatter);

      const writtenContent = await readFile(testFile, 'utf-8');
      expect(writtenContent).toContain('coverImage: /images/test.webp');
      expect(writtenContent).toContain('audiobook: true');
      expect(writtenContent).toContain('favorite: false');
    });
  });

  describe('updateFrontmatterField', () => {
    it('should update a single field immutably', () => {
      const original = {
        title: '1984',
        author: 'George Orwell',
        finished: null as string | null,
      };

      const updated = updateFrontmatterField(original, 'finished', '2024-01-15T00:00:00.000Z');

      expect(updated).toEqual({
        title: '1984',
        author: 'George Orwell',
        finished: '2024-01-15T00:00:00.000Z',
      });
      // Original should not be mutated
      expect(original.finished).toBeNull();
    });

    it('should update audiobook field', () => {
      const original = {
        title: 'Test',
        author: 'Author',
        finished: null as string | null,
        audiobook: false,
      };

      const updated = updateFrontmatterField(original, 'audiobook', true);

      expect(updated.audiobook).toBe(true);
      expect(original.audiobook).toBe(false);
    });

    it('should update favorite field', () => {
      const original = {
        title: 'Test',
        author: 'Author',
        finished: null as string | null,
      };

      const updated = updateFrontmatterField(original, 'favorite', true);

      expect(updated.favorite).toBe(true);
      expect('favorite' in original).toBe(false);
    });

    it('should update coverImage field', () => {
      const original = {
        title: 'Test',
        author: 'Author',
        finished: null as string | null,
      };

      const updated = updateFrontmatterField(original, 'coverImage', '/images/new.webp');

      expect(updated.coverImage).toBe('/images/new.webp');
      expect('coverImage' in original).toBe(false);
    });
  });

  describe('createReadingFrontmatter', () => {
    it('should create frontmatter with required fields only', () => {
      const frontmatter = createReadingFrontmatter('1984', 'George Orwell', null);

      expect(frontmatter).toEqual({
        title: '1984',
        author: 'George Orwell',
        finished: null,
      });
    });

    it('should create frontmatter with finished date', () => {
      const frontmatter = createReadingFrontmatter(
        'Dune',
        'Frank Herbert',
        '2024-01-15T00:00:00.000Z'
      );

      expect(frontmatter).toEqual({
        title: 'Dune',
        author: 'Frank Herbert',
        finished: '2024-01-15T00:00:00.000Z',
      });
    });

    it('should create frontmatter with all optional fields', () => {
      const frontmatter = createReadingFrontmatter(
        'Foundation',
        'Isaac Asimov',
        '2023-12-01T00:00:00.000Z',
        {
          coverImage: '/images/foundation.webp',
          audiobook: true,
          favorite: true,
        }
      );

      expect(frontmatter).toEqual({
        title: 'Foundation',
        author: 'Isaac Asimov',
        finished: '2023-12-01T00:00:00.000Z',
        coverImage: '/images/foundation.webp',
        audiobook: true,
        favorite: true,
      });
    });

    it('should omit optional fields when false', () => {
      const frontmatter = createReadingFrontmatter('Test', 'Author', null, {
        audiobook: false,
        favorite: false,
      });

      expect(frontmatter).toEqual({
        title: 'Test',
        author: 'Author',
        finished: null,
      });
      expect(frontmatter.audiobook).toBeUndefined();
      expect(frontmatter.favorite).toBeUndefined();
    });

    it('should include coverImage when provided', () => {
      const frontmatter = createReadingFrontmatter('Test', 'Author', null, {
        coverImage: '/images/test.webp',
      });

      expect(frontmatter.coverImage).toBe('/images/test.webp');
    });

    it('should handle empty string as null for finished date', () => {
      const frontmatter = createReadingFrontmatter('Test', 'Author', '');

      expect(frontmatter.finished).toBeNull();
    });
  });

  describe('round-trip operations', () => {
    it('should preserve content when reading and writing', async () => {
      const originalMarkdown = `---
title: Test Book
author: Test Author
finished: null
---

This is the original content.
It has multiple lines.`;

      await writeFile(testFile, originalMarkdown, 'utf-8');

      const { frontmatter, content } = await readReadingFrontmatter(testFile);
      await writeReadingFrontmatter(testFile, frontmatter, content);

      const writtenContent = await readFile(testFile, 'utf-8');
      expect(writtenContent).toContain('This is the original content.');
      expect(writtenContent).toContain('It has multiple lines.');
    });

    it('should preserve frontmatter when updating a field', async () => {
      const originalMarkdown = `---
title: Test Book
author: Test Author
finished: null
coverImage: /images/test.webp
audiobook: true
---

Content here.`;

      await writeFile(testFile, originalMarkdown, 'utf-8');

      const { frontmatter, content } = await readReadingFrontmatter(testFile);
      const updatedFrontmatter = updateFrontmatterField(
        frontmatter,
        'finished',
        '2024-01-15T00:00:00.000Z'
      );
      await writeReadingFrontmatter(testFile, updatedFrontmatter, content);

      const writtenContent = await readFile(testFile, 'utf-8');
      expect(writtenContent).toContain("finished: '2024-01-15T00:00:00.000Z'"); // gray-matter quotes ISO dates
      expect(writtenContent).toContain('coverImage: /images/test.webp');
      expect(writtenContent).toContain('audiobook: true');
      expect(writtenContent).toContain('Content here.');
    });
  });
});
