/**
 * Tests for Reading Status Migration Script
 *
 * Tests the migration from three-state (reading/finished/dropped) to
 * two-state (reading/finished) reading status system.
 */

/* eslint-env jest */

const fs = require('fs');
const matter = require('gray-matter');

// Mock dependencies
jest.mock('fs');
jest.mock('gray-matter');

// Import the functions to test
const {
  identifyDroppedReadings,
  createBackups,
  deleteDroppedFiles,
  cleanupRemainingFrontmatter,
  main,
} = require('../migrate-reading-status');

// Silence console output during tests
const originalConsole = { ...console };
beforeAll(() => {
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalConsole.log;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
});

describe('Reading Status Migration Script', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset process.exit mock
    jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit');
    });
  });

  afterEach(() => {
    process.exit.mockRestore();
  });

  describe('identifyDroppedReadings', () => {
    it('should identify dropped reading files correctly', () => {
      // Mock filesystem operations
      fs.existsSync.mockReturnValue(true);
      fs.readdirSync.mockReturnValue(['book1.md', 'book2.md', 'book3.md', 'not-markdown.txt']);

      // Mock file reading
      fs.readFileSync
        .mockReturnValueOnce('content1')
        .mockReturnValueOnce('content2')
        .mockReturnValueOnce('content3');

      // Mock gray-matter parsing
      matter
        .mockReturnValueOnce({
          data: { title: 'Book 1', author: 'Author 1', dropped: true },
          content: 'Book 1 content',
        })
        .mockReturnValueOnce({
          data: { title: 'Book 2', author: 'Author 2', dropped: false },
          content: 'Book 2 content',
        })
        .mockReturnValueOnce({
          data: { title: 'Book 3', author: 'Author 3', dropped: true },
          content: 'Book 3 content',
        });

      const result = identifyDroppedReadings();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        filename: 'book1.md',
        filepath: expect.stringContaining('book1.md'),
        title: 'Book 1',
        author: 'Author 1',
      });
      expect(result[1]).toEqual({
        filename: 'book3.md',
        filepath: expect.stringContaining('book3.md'),
        title: 'Book 3',
        author: 'Author 3',
      });
    });

    it('should handle missing title or author gracefully', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readdirSync.mockReturnValue(['book.md']);
      fs.readFileSync.mockReturnValue('content');

      matter.mockReturnValue({
        data: { dropped: true },
        content: 'Book content',
      });

      const result = identifyDroppedReadings();

      expect(result[0]).toEqual({
        filename: 'book.md',
        filepath: expect.stringContaining('book.md'),
        title: 'Unknown Title',
        author: 'Unknown Author',
      });
    });

    it('should handle parsing errors gracefully', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readdirSync.mockReturnValue(['book.md']);
      fs.readFileSync.mockReturnValue('content');

      matter.mockImplementation(() => {
        throw new Error('Invalid YAML');
      });

      const result = identifyDroppedReadings();

      expect(result).toHaveLength(0);
      expect(console.warn).toHaveBeenCalled();
      expect(console.warn.mock.calls[0][0]).toContain('Could not parse book.md');
    });

    it('should exit if readings directory does not exist', () => {
      fs.existsSync.mockReturnValue(false);

      expect(() => identifyDroppedReadings()).toThrow('process.exit');
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Readings directory not found')
      );
    });
  });

  describe('createBackups', () => {
    it('should create backup copies of dropped files', () => {
      const droppedFiles = [
        {
          filename: 'book1.md',
          filepath: '/content/readings/book1.md',
          title: 'Book 1',
          author: 'Author 1',
        },
        {
          filename: 'book2.md',
          filepath: '/content/readings/book2.md',
          title: 'Book 2',
          author: 'Author 2',
        },
      ];

      fs.copyFileSync.mockImplementation(() => {});

      createBackups(droppedFiles);

      expect(fs.copyFileSync).toHaveBeenCalledTimes(2);
      expect(fs.copyFileSync).toHaveBeenCalledWith(
        '/content/readings/book1.md',
        expect.stringContaining('book1.md')
      );
      expect(fs.copyFileSync).toHaveBeenCalledWith(
        '/content/readings/book2.md',
        expect.stringContaining('book2.md')
      );
    });

    it('should handle empty array gracefully', () => {
      createBackups([]);

      expect(fs.copyFileSync).not.toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('No backups needed'));
    });

    it('should exit on backup failure', () => {
      const droppedFiles = [
        {
          filename: 'book1.md',
          filepath: '/content/readings/book1.md',
          title: 'Book 1',
          author: 'Author 1',
        },
      ];

      fs.copyFileSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      expect(() => createBackups(droppedFiles)).toThrow('process.exit');
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to backup book1.md'),
        'Permission denied'
      );
    });
  });

  describe('deleteDroppedFiles', () => {
    it('should delete dropped files', () => {
      const droppedFiles = [
        {
          filename: 'book1.md',
          filepath: '/content/readings/book1.md',
          title: 'Book 1',
          author: 'Author 1',
        },
        {
          filename: 'book2.md',
          filepath: '/content/readings/book2.md',
          title: 'Book 2',
          author: 'Author 2',
        },
      ];

      fs.unlinkSync.mockImplementation(() => {});

      deleteDroppedFiles(droppedFiles);

      expect(fs.unlinkSync).toHaveBeenCalledTimes(2);
      expect(fs.unlinkSync).toHaveBeenCalledWith('/content/readings/book1.md');
      expect(fs.unlinkSync).toHaveBeenCalledWith('/content/readings/book2.md');
    });

    it('should handle empty array gracefully', () => {
      deleteDroppedFiles([]);

      expect(fs.unlinkSync).not.toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('No files to delete'));
    });

    it('should continue on delete failure', () => {
      const droppedFiles = [
        {
          filename: 'book1.md',
          filepath: '/content/readings/book1.md',
          title: 'Book 1',
          author: 'Author 1',
        },
        {
          filename: 'book2.md',
          filepath: '/content/readings/book2.md',
          title: 'Book 2',
          author: 'Author 2',
        },
      ];

      fs.unlinkSync
        .mockImplementationOnce(() => {
          throw new Error('File not found');
        })
        .mockImplementationOnce(() => {});

      deleteDroppedFiles(droppedFiles);

      expect(fs.unlinkSync).toHaveBeenCalledTimes(2);
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to delete book1.md'),
        'File not found'
      );
      // Should not exit, continues with book2.md
      expect(process.exit).not.toHaveBeenCalled();
    });
  });

  describe('cleanupRemainingFrontmatter', () => {
    it('should remove dropped field from frontmatter', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readdirSync.mockReturnValue(['book1.md', 'book2.md']);

      fs.readFileSync.mockReturnValueOnce('content1').mockReturnValueOnce('content2');

      matter
        .mockReturnValueOnce({
          data: { title: 'Book 1', dropped: false },
          content: 'Book 1 content',
        })
        .mockReturnValueOnce({
          data: { title: 'Book 2', finished: true },
          content: 'Book 2 content',
        });

      matter.stringify
        .mockReturnValueOnce('---\ntitle: Book 1\n---\nBook 1 content')
        .mockReturnValueOnce('---\ntitle: Book 2\nfinished: true\n---\nBook 2 content');

      cleanupRemainingFrontmatter();

      // Should only update the first file (which had 'dropped' field)
      expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('book1.md'),
        '---\ntitle: Book 1\n---\nBook 1 content'
      );
    });

    it('should handle parsing errors gracefully', () => {
      fs.readdirSync.mockReturnValue(['book.md']);
      fs.readFileSync.mockReturnValue('content');

      matter.mockImplementation(() => {
        throw new Error('Invalid YAML');
      });

      cleanupRemainingFrontmatter();

      expect(console.warn).toHaveBeenCalled();
      expect(console.warn.mock.calls[0][0]).toContain('Could not process book.md');
      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });

    it('should exit on directory read error', () => {
      fs.readdirSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      expect(() => cleanupRemainingFrontmatter()).toThrow('process.exit');
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Error cleaning frontmatter'),
        expect.any(Error)
      );
    });
  });

  describe('main', () => {
    it('should complete full migration successfully', () => {
      // Mock ensureBackupDirectory
      fs.existsSync
        .mockReturnValueOnce(false) // backup dir doesn't exist
        .mockReturnValue(true); // readings dir exists
      fs.mkdirSync.mockImplementation(() => {});

      // Mock identifyDroppedReadings
      fs.readdirSync.mockReturnValue(['book1.md', 'book2.md']);
      fs.readFileSync
        .mockReturnValueOnce('content1')
        .mockReturnValueOnce('content2')
        .mockReturnValueOnce('content1')
        .mockReturnValueOnce('content2');

      matter
        .mockReturnValueOnce({
          data: { title: 'Book 1', author: 'Author 1', dropped: true },
          content: 'Book 1 content',
        })
        .mockReturnValueOnce({
          data: { title: 'Book 2', author: 'Author 2', dropped: false },
          content: 'Book 2 content',
        })
        .mockReturnValueOnce({
          data: { title: 'Book 2', author: 'Author 2', dropped: false },
          content: 'Book 2 content',
        });

      // Mock createBackups
      fs.copyFileSync.mockImplementation(() => {});

      // Mock deleteDroppedFiles
      fs.unlinkSync.mockImplementation(() => {});

      // Mock cleanupRemainingFrontmatter
      matter.stringify.mockReturnValue('cleaned content');
      fs.writeFileSync.mockImplementation(() => {});

      main();

      expect(fs.mkdirSync).toHaveBeenCalled();
      expect(fs.copyFileSync).toHaveBeenCalled();
      expect(fs.unlinkSync).toHaveBeenCalled();
      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Reading Status Migration Complete!')
      );
    });

    it('should handle no dropped readings gracefully', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readdirSync.mockReturnValue(['book1.md']);
      fs.readFileSync.mockReturnValue('content');

      matter.mockReturnValue({
        data: { title: 'Book 1', dropped: false },
        content: 'Book 1 content',
      });

      main();

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('No dropped readings found. Migration complete!')
      );
      expect(fs.copyFileSync).not.toHaveBeenCalled();
      expect(fs.unlinkSync).not.toHaveBeenCalled();
    });

    it('should handle errors and exit gracefully', () => {
      fs.existsSync.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      expect(() => main()).toThrow('process.exit');
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Migration failed'),
        expect.any(Error)
      );
    });
  });

  describe('Module exports', () => {
    it('should export all required functions', () => {
      const migration = require('../migrate-reading-status');

      expect(migration.main).toBeDefined();
      expect(migration.identifyDroppedReadings).toBeDefined();
      expect(migration.createBackups).toBeDefined();
      expect(migration.deleteDroppedFiles).toBeDefined();
      expect(migration.cleanupRemainingFrontmatter).toBeDefined();

      expect(typeof migration.main).toBe('function');
      expect(typeof migration.identifyDroppedReadings).toBe('function');
      expect(typeof migration.createBackups).toBe('function');
      expect(typeof migration.deleteDroppedFiles).toBe('function');
      expect(typeof migration.cleanupRemainingFrontmatter).toBe('function');
    });
  });
});
