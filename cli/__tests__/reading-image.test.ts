import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import sharp from 'sharp';
import { processReadingCoverImage } from '../lib/reading-image';

// Mock sharp
jest.mock('sharp');

describe('reading-image', () => {
  const mockSharp = sharp as jest.MockedFunction<typeof sharp>;
  let testDir: string;
  let imagesDir: string;

  beforeEach(() => {
    // Create temp directories for testing
    testDir = join(tmpdir(), `reading-image-test-${Date.now()}`);
    imagesDir = join(testDir, 'images');
    mkdirSync(testDir, { recursive: true });

    // Reset mocks
    jest.clearAllMocks();

    // Setup sharp mock chain
    const mockResize = jest.fn().mockReturnThis();
    const mockWebp = jest.fn().mockReturnThis();
    const mockToFile = jest.fn().mockResolvedValue(undefined);

    mockSharp.mockReturnValue({
      resize: mockResize,
      webp: mockWebp,
      toFile: mockToFile,
    } as any);
  });

  afterEach(() => {
    // Cleanup temp directories
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('processReadingCoverImage', () => {
    it('should process valid image and return web path', async () => {
      // Create a test image file
      const testImage = join(testDir, 'test.jpg');
      writeFileSync(testImage, Buffer.alloc(1024)); // 1KB file

      const result = await processReadingCoverImage(testImage, 'test-slug', imagesDir);

      expect(result).toBe('/images/readings/test-slug.webp');
      expect(mockSharp).toHaveBeenCalledWith(testImage);
      expect(imagesDir).toBeDefined();
    });

    it('should create images directory if it does not exist', async () => {
      const testImage = join(testDir, 'test.png');
      writeFileSync(testImage, Buffer.alloc(1024));

      await processReadingCoverImage(testImage, 'test-slug', imagesDir);

      expect(existsSync(imagesDir)).toBe(true);
    });

    it('should throw error for non-existent file', async () => {
      const nonExistentPath = join(testDir, 'nonexistent.jpg');

      await expect(
        processReadingCoverImage(nonExistentPath, 'test-slug', imagesDir)
      ).rejects.toThrow('File not found');
    });

    it('should throw error for invalid file extension', async () => {
      const testImage = join(testDir, 'test.txt');
      writeFileSync(testImage, 'not an image');

      await expect(processReadingCoverImage(testImage, 'test-slug', imagesDir)).rejects.toThrow(
        'Invalid image format'
      );
    });

    it('should throw error for file too large', async () => {
      const testImage = join(testDir, 'large.jpg');
      // Create 11MB file (exceeds 10MB limit)
      writeFileSync(testImage, Buffer.alloc(11 * 1024 * 1024));

      await expect(processReadingCoverImage(testImage, 'test-slug', imagesDir)).rejects.toThrow(
        'File too large'
      );
    });

    it('should reject directory traversal with ..', async () => {
      const testImage = join(testDir, 'test.jpg');
      writeFileSync(testImage, Buffer.alloc(1024));

      const maliciousPath = `${testImage}/../../../etc/passwd`;

      await expect(processReadingCoverImage(maliciousPath, 'test-slug', imagesDir)).rejects.toThrow(
        'Directory traversal attempts are not allowed'
      );
    });

    it('should reject directory traversal with ~', async () => {
      const testImage = join(testDir, 'test.jpg');
      writeFileSync(testImage, Buffer.alloc(1024));

      const maliciousPath = `~/../../etc/passwd`;

      await expect(processReadingCoverImage(maliciousPath, 'test-slug', imagesDir)).rejects.toThrow(
        'Directory traversal attempts are not allowed'
      );
    });

    it('should reject URL-encoded directory traversal', async () => {
      const testImage = join(testDir, 'test.jpg');
      writeFileSync(testImage, Buffer.alloc(1024));

      const maliciousPath = `${testImage}/%2e%2e/sensitive`;

      await expect(processReadingCoverImage(maliciousPath, 'test-slug', imagesDir)).rejects.toThrow(
        'Encoded characters are not allowed'
      );
    });

    it('should accept all allowed image formats', async () => {
      const formats = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif'];

      for (const format of formats) {
        const testImage = join(testDir, `test.${format}`);
        writeFileSync(testImage, Buffer.alloc(1024));

        const result = await processReadingCoverImage(testImage, 'test-slug', imagesDir);
        expect(result).toBe('/images/readings/test-slug.webp');
      }
    });

    it('should call sharp with correct resize parameters', async () => {
      const testImage = join(testDir, 'test.jpg');
      writeFileSync(testImage, Buffer.alloc(1024));

      const mockResize = jest.fn().mockReturnThis();
      const mockWebp = jest.fn().mockReturnThis();
      const mockToFile = jest.fn().mockResolvedValue(undefined);

      mockSharp.mockReturnValue({
        resize: mockResize,
        webp: mockWebp,
        toFile: mockToFile,
      } as any);

      await processReadingCoverImage(testImage, 'test-slug', imagesDir);

      expect(mockResize).toHaveBeenCalledWith(400, 600, {
        fit: 'cover',
        position: 'center',
      });
      expect(mockWebp).toHaveBeenCalledWith({ quality: 80 });
    });
  });
});
