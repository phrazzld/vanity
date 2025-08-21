/**
 * Tests for data layer functions that parse markdown content
 */

import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';
import { getQuotes, getReadings, getProjects, getPlaces } from '../data';

// Mock dependencies
jest.mock('fs');
jest.mock('gray-matter');
jest.mock('path');

const mockFs = fs as jest.Mocked<typeof fs>;
const mockMatter = matter as jest.MockedFunction<typeof matter>;
const mockPath = path as jest.Mocked<typeof path>;

describe('Data Layer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default path mocking
    mockPath.join.mockImplementation((...args) => args.join('/'));
  });

  describe('getQuotes', () => {
    it('should parse quotes from markdown files correctly', () => {
      mockFs.readdirSync.mockReturnValue(['001.md', '002.md'] as any);
      mockFs.readFileSync
        .mockReturnValueOnce('mock file content 1')
        .mockReturnValueOnce('mock file content 2');

      mockMatter
        .mockReturnValueOnce({
          data: { id: 1, author: 'Author One' },
          content: 'Quote text one  \n  ',
        } as any)
        .mockReturnValueOnce({
          data: { id: 2, author: 'Author Two' },
          content: '\n  Quote text two',
        } as any);

      const quotes = getQuotes();

      expect(quotes).toEqual([
        { id: 1, author: 'Author One', text: 'Quote text one' },
        { id: 2, author: 'Author Two', text: 'Quote text two' },
      ]);
      expect(mockPath.join).toHaveBeenCalledWith(process.cwd(), 'content/quotes');
      expect(mockFs.readdirSync).toHaveBeenCalledWith(path.join(process.cwd(), 'content/quotes'));
    });

    it('should handle malformed frontmatter gracefully', () => {
      mockFs.readdirSync.mockReturnValue(['malformed.md'] as any);
      mockFs.readFileSync.mockReturnValue('mock file content');

      // Simulate malformed frontmatter by returning undefined values
      mockMatter.mockReturnValue({
        data: { id: undefined, author: null },
        content: 'Valid quote text',
      } as any);

      const quotes = getQuotes();

      expect(quotes).toEqual([{ id: undefined, author: null, text: 'Valid quote text' }]);
    });

    it('should handle missing content directory', () => {
      mockFs.readdirSync.mockImplementation(() => {
        throw new Error('ENOENT: no such file or directory');
      });

      expect(() => getQuotes()).toThrow('ENOENT: no such file or directory');
    });

    it('should handle empty content directory', () => {
      mockFs.readdirSync.mockReturnValue([] as any);

      const quotes = getQuotes();

      expect(quotes).toEqual([]);
    });

    it('should handle file read errors', () => {
      mockFs.readdirSync.mockReturnValue(['error.md'] as any);
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      expect(() => getQuotes()).toThrow('Permission denied');
    });

    it('should performance test with large number of quotes', () => {
      const numberOfQuotes = 1000;
      const files = Array.from(
        { length: numberOfQuotes },
        (_, i) => `${String(i).padStart(4, '0')}.md`
      );

      mockFs.readdirSync.mockReturnValue(files as any);
      mockFs.readFileSync.mockImplementation(() => 'mock content');
      mockMatter.mockImplementation(
        (_, index) =>
          ({
            data: { id: index, author: `Author ${index}` },
            content: `Quote text ${index}`,
          }) as any
      );

      const startTime = Date.now();
      const quotes = getQuotes();
      const endTime = Date.now();

      expect(quotes).toHaveLength(numberOfQuotes);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second
    });
  });

  describe('getReadings', () => {
    it('should parse readings from markdown files correctly', () => {
      mockFs.readdirSync.mockReturnValue(['book-one.md', 'book-two.md'] as any);
      mockFs.readFileSync
        .mockReturnValueOnce('mock content 1')
        .mockReturnValueOnce('mock content 2');

      mockMatter
        .mockReturnValueOnce({
          data: {
            title: 'Book One',
            author: 'Author One',
            finished: '2023-01-15',
            coverImage: 'cover1.jpg',
            audiobook: false,
          },
          content: 'Thoughts on book one',
        } as any)
        .mockReturnValueOnce({
          data: {
            title: 'Book Two',
            author: 'Author Two',
            finished: '2023-02-20',
            coverImage: null,
            audiobook: false,
          },
          content: 'Thoughts on book two',
        } as any);

      const readings = getReadings();

      expect(readings).toEqual([
        {
          slug: 'book-two',
          title: 'Book Two',
          author: 'Author Two',
          finishedDate: '2023-02-20',
          coverImageSrc: null,
          thoughts: 'Thoughts on book two',
          audiobook: false,
        },
        {
          slug: 'book-one',
          title: 'Book One',
          author: 'Author One',
          finishedDate: '2023-01-15',
          coverImageSrc: 'cover1.jpg',
          thoughts: 'Thoughts on book one',
          audiobook: false,
        },
      ]);
    });

    it('should process all readings (dropped status removed)', () => {
      mockFs.readdirSync.mockReturnValue(['book-one.md', 'book-two.md'] as any);
      mockFs.readFileSync
        .mockReturnValueOnce('mock content 1')
        .mockReturnValueOnce('mock content 2');

      mockMatter
        .mockReturnValueOnce({
          data: {
            title: 'Book One',
            author: 'Author',
            finished: '2023-01-15',
            audiobook: false,
          },
          content: 'Book one thoughts',
        } as any)
        .mockReturnValueOnce({
          data: {
            title: 'Book Two',
            author: 'Author',
            finished: '2023-02-20',
            audiobook: true,
          },
          content: 'Book two thoughts',
        } as any);

      const readings = getReadings();

      expect(readings).toHaveLength(2);
      expect(readings[0]!.title).toBe('Book Two');
      expect(readings[0]!.audiobook).toBe(true);
      expect(readings[1]!.title).toBe('Book One');
      expect(readings[1]!.audiobook).toBe(false);
    });

    it('should handle null/undefined finished dates', () => {
      mockFs.readdirSync.mockReturnValue(['reading.md', 'current.md'] as any);
      mockFs.readFileSync
        .mockReturnValueOnce('mock content 1')
        .mockReturnValueOnce('mock content 2');

      mockMatter
        .mockReturnValueOnce({
          data: {
            title: 'Finished Book',
            author: 'Author',
            finished: '2023-01-15',
          },
          content: 'Finished thoughts',
        } as any)
        .mockReturnValueOnce({
          data: {
            title: 'Current Book',
            author: 'Author',
            finished: null,
          },
          content: 'Current thoughts',
        } as any);

      const readings = getReadings();

      // Current readings (null finished date) should come last
      expect(readings[0]!.title).toBe('Finished Book');
      expect(readings[1]!.title).toBe('Current Book');
      expect(readings[1]!.finishedDate).toBeNull();
    });

    it('should sort readings by finished date (most recent first)', () => {
      mockFs.readdirSync.mockReturnValue(['old.md', 'new.md', 'middle.md'] as any);
      mockFs.readFileSync
        .mockReturnValueOnce('content 1')
        .mockReturnValueOnce('content 2')
        .mockReturnValueOnce('content 3');

      mockMatter
        .mockReturnValueOnce({
          data: { title: 'Old Book', author: 'Author', finished: '2023-01-01' },
          content: 'Old thoughts',
        } as any)
        .mockReturnValueOnce({
          data: { title: 'New Book', author: 'Author', finished: '2023-03-01' },
          content: 'New thoughts',
        } as any)
        .mockReturnValueOnce({
          data: { title: 'Middle Book', author: 'Author', finished: '2023-02-01' },
          content: 'Middle thoughts',
        } as any);

      const readings = getReadings();

      expect(readings.map(r => r.title)).toEqual(['New Book', 'Middle Book', 'Old Book']);
    });
  });

  describe('getProjects', () => {
    it('should parse projects from markdown files correctly', () => {
      mockFs.readdirSync.mockReturnValue(['project1.md', 'project2.md'] as any);
      mockFs.readFileSync
        .mockReturnValueOnce('mock content 1')
        .mockReturnValueOnce('mock content 2');

      mockMatter
        .mockReturnValueOnce({
          data: {
            title: 'Project One',
            description: 'Description one',
            techStack: ['React', 'TypeScript'],
            siteUrl: 'https://project1.com',
            codeUrl: 'https://github.com/user/project1',
            imageSrc: 'project1.jpg',
            altText: 'Project one screenshot',
            order: 2,
          },
          content: 'Project content',
        } as any)
        .mockReturnValueOnce({
          data: {
            title: 'Project Two',
            description: 'Description two',
            techStack: ['Vue', 'JavaScript'],
            siteUrl: undefined,
            codeUrl: 'https://github.com/user/project2',
            imageSrc: 'project2.jpg',
            altText: 'Project two screenshot',
            order: 1,
          },
          content: 'Project content',
        } as any);

      const projects = getProjects();

      expect(projects).toEqual([
        {
          title: 'Project Two',
          description: 'Description two',
          techStack: ['Vue', 'JavaScript'],
          siteUrl: undefined,
          codeUrl: 'https://github.com/user/project2',
          imageSrc: 'project2.jpg',
          altText: 'Project two screenshot',
          order: 1,
        },
        {
          title: 'Project One',
          description: 'Description one',
          techStack: ['React', 'TypeScript'],
          siteUrl: 'https://project1.com',
          codeUrl: 'https://github.com/user/project1',
          imageSrc: 'project1.jpg',
          altText: 'Project one screenshot',
          order: 2,
        },
      ]);
    });

    it('should handle missing order field with default value', () => {
      mockFs.readdirSync.mockReturnValue(['no-order.md'] as any);
      mockFs.readFileSync.mockReturnValue('mock content');

      mockMatter.mockReturnValue({
        data: {
          title: 'No Order Project',
          description: 'Description',
          techStack: ['React'],
          imageSrc: 'image.jpg',
          altText: 'Alt text',
          // order field missing
        },
        content: 'Project content',
      } as any);

      const projects = getProjects();

      expect(projects[0]!.order).toBe(999);
    });
  });

  describe('getPlaces', () => {
    it('should parse places from markdown files correctly', () => {
      mockFs.readdirSync.mockReturnValue(['place1.md', 'place2.md'] as any);
      mockFs.readFileSync
        .mockReturnValueOnce('mock content 1')
        .mockReturnValueOnce('mock content 2');

      mockMatter
        .mockReturnValueOnce({
          data: {
            id: '2',
            name: 'Place Two',
            lat: 40.7128,
            lng: -74.006,
            note: 'New York City',
          },
          content: 'Place content',
        } as any)
        .mockReturnValueOnce({
          data: {
            id: '1',
            name: 'Place One',
            lat: 37.7749,
            lng: -122.4194,
            note: undefined,
          },
          content: 'Place content',
        } as any);

      const places = getPlaces();

      // Should be sorted by ID (numeric)
      expect(places).toEqual([
        {
          id: '1',
          name: 'Place One',
          lat: 37.7749,
          lng: -122.4194,
          note: undefined,
        },
        {
          id: '2',
          name: 'Place Two',
          lat: 40.7128,
          lng: -74.006,
          note: 'New York City',
        },
      ]);
    });

    it('should sort places by numeric ID value', () => {
      mockFs.readdirSync.mockReturnValue(['place10.md', 'place2.md', 'place1.md'] as any);
      mockFs.readFileSync
        .mockReturnValue('mock content')
        .mockReturnValue('mock content')
        .mockReturnValue('mock content');

      mockMatter
        .mockReturnValueOnce({
          data: { id: '10', name: 'Place Ten', lat: 0, lng: 0 },
          content: '',
        } as any)
        .mockReturnValueOnce({
          data: { id: '2', name: 'Place Two', lat: 0, lng: 0 },
          content: '',
        } as any)
        .mockReturnValueOnce({
          data: { id: '1', name: 'Place One', lat: 0, lng: 0 },
          content: '',
        } as any);

      const places = getPlaces();

      expect(places.map(p => p.name)).toEqual(['Place One', 'Place Two', 'Place Ten']);
    });
  });

  describe('Error Handling Edge Cases', () => {
    it('should handle gray-matter parsing errors', () => {
      mockFs.readdirSync.mockReturnValue(['corrupted.md'] as any);
      mockFs.readFileSync.mockReturnValue('corrupted content');
      mockMatter.mockImplementation(() => {
        throw new Error('Invalid YAML frontmatter');
      });

      expect(() => getQuotes()).toThrow('Invalid YAML frontmatter');
    });

    it('should handle binary or non-text files', () => {
      mockFs.readdirSync.mockReturnValue(['image.md'] as any);
      mockFs.readFileSync.mockReturnValue(Buffer.from([0xff, 0xd8, 0xff, 0xe0]));

      // gray-matter should handle binary content gracefully
      mockMatter.mockReturnValue({
        data: {},
        content: '',
      } as any);

      const quotes = getQuotes();
      expect(quotes).toEqual([{ id: undefined, author: undefined, text: '' }]);
    });

    it('should handle very large markdown files', () => {
      const largeContent = 'x'.repeat(1000000); // 1MB of content

      mockFs.readdirSync.mockReturnValue(['large.md'] as any);
      mockFs.readFileSync.mockReturnValue(largeContent);
      mockMatter.mockReturnValue({
        data: { id: 1, author: 'Author' },
        content: largeContent,
      } as any);

      const startTime = Date.now();
      const quotes = getQuotes();
      const endTime = Date.now();

      expect(quotes[0]!.text).toHaveLength(1000000);
      expect(endTime - startTime).toBeLessThan(500); // Should handle large files quickly
    });
  });
});
