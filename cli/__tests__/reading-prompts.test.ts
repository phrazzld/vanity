import inquirer from 'inquirer';
import {
  promptBasicReadingInfo,
  promptReadingMetadata,
  promptCoverImage,
  promptRereadAction,
} from '../lib/reading-prompts';

// Mock inquirer
jest.mock('inquirer');
const mockInquirer = inquirer as jest.Mocked<typeof inquirer>;

describe('reading-prompts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('promptBasicReadingInfo', () => {
    it('should prompt for title and author', async () => {
      mockInquirer.prompt.mockResolvedValueOnce({
        title: '1984',
        author: 'George Orwell',
      });

      const result = await promptBasicReadingInfo();

      expect(result).toEqual({
        title: '1984',
        author: 'George Orwell',
      });
      expect(mockInquirer.prompt).toHaveBeenCalledTimes(1);
    });

    it('should include validation for required fields', async () => {
      mockInquirer.prompt.mockResolvedValueOnce({
        title: 'Test Book',
        author: 'Test Author',
      });

      await promptBasicReadingInfo();

      const promptCall = mockInquirer.prompt.mock.calls[0]?.[0] as unknown as any[];
      expect(promptCall[0].validate(' ')).toBe('Title is required');
      expect(promptCall[0].validate('Valid Title')).toBe(true);
      expect(promptCall[1].validate(' ')).toBe('Author is required');
      expect(promptCall[1].validate('Valid Author')).toBe(true);
    });
  });

  describe('promptReadingMetadata', () => {
    it('should prompt for finished status and not ask for date if not finished', async () => {
      mockInquirer.prompt
        .mockResolvedValueOnce({ finished: false })
        .mockResolvedValueOnce({ audiobook: false })
        .mockResolvedValueOnce({ favorite: false });

      const result = await promptReadingMetadata();

      expect(result).toEqual({
        finished: false,
        finishedDate: null,
        audiobook: false,
        favorite: false,
      });
      expect(mockInquirer.prompt).toHaveBeenCalledTimes(3);
    });

    it('should prompt for date if finished', async () => {
      mockInquirer.prompt
        .mockResolvedValueOnce({ finished: true })
        .mockResolvedValueOnce({ dateInput: '2024-01-15' })
        .mockResolvedValueOnce({ audiobook: true })
        .mockResolvedValueOnce({ favorite: true });

      const result = await promptReadingMetadata();

      expect(result.finished).toBe(true);
      expect(result.finishedDate).toBe('2024-01-15T00:00:00.000Z');
      expect(result.audiobook).toBe(true);
      expect(result.favorite).toBe(true);
      expect(mockInquirer.prompt).toHaveBeenCalledTimes(4);
    });

    it('should use today as default date', async () => {
      mockInquirer.prompt
        .mockResolvedValueOnce({ finished: true })
        .mockResolvedValueOnce({ dateInput: new Date().toISOString().split('T')[0] })
        .mockResolvedValueOnce({ audiobook: false })
        .mockResolvedValueOnce({ favorite: false });

      const result = await promptReadingMetadata();

      expect(result.finished).toBe(true);
      expect(result.finishedDate).toBeDefined();
      // Date should be today (check year at minimum)
      expect(result.finishedDate).toContain(new Date().getFullYear().toString());
    });
  });

  describe('promptCoverImage', () => {
    it('should return skip choice with null value', async () => {
      mockInquirer.prompt.mockResolvedValueOnce({ imageChoice: 'skip' });

      const result = await promptCoverImage();

      expect(result).toEqual({
        choice: 'skip',
        value: null,
      });
      expect(mockInquirer.prompt).toHaveBeenCalledTimes(1);
    });

    it('should prompt for URL and return it', async () => {
      mockInquirer.prompt
        .mockResolvedValueOnce({ imageChoice: 'url' })
        .mockResolvedValueOnce({ imageUrl: 'https://example.com/cover.jpg' });

      const result = await promptCoverImage();

      expect(result).toEqual({
        choice: 'url',
        value: 'https://example.com/cover.jpg',
      });
      expect(mockInquirer.prompt).toHaveBeenCalledTimes(2);
    });

    it('should prompt for local path and return it', async () => {
      mockInquirer.prompt
        .mockResolvedValueOnce({ imageChoice: 'local' })
        .mockResolvedValueOnce({ imagePath: '/path/to/image.jpg' });

      const result = await promptCoverImage();

      expect(result).toEqual({
        choice: 'local',
        value: '/path/to/image.jpg',
      });
      expect(mockInquirer.prompt).toHaveBeenCalledTimes(2);
    });

    it('should validate URL format', async () => {
      mockInquirer.prompt
        .mockResolvedValueOnce({ imageChoice: 'url' })
        .mockResolvedValueOnce({ imageUrl: 'https://example.com/cover.jpg' });

      await promptCoverImage();

      const urlPromptCall = mockInquirer.prompt.mock.calls[1]?.[0] as unknown as any[];
      expect(urlPromptCall[0].validate('')).toBe('URL is required');
      expect(urlPromptCall[0].validate('not-a-url')).toBe('Please enter a valid URL');
      expect(urlPromptCall[0].validate('https://example.com')).toBe(true);
    });

    it('should validate path is not empty', async () => {
      mockInquirer.prompt
        .mockResolvedValueOnce({ imageChoice: 'local' })
        .mockResolvedValueOnce({ imagePath: '/valid/path.jpg' });

      await promptCoverImage();

      const pathPromptCall = mockInquirer.prompt.mock.calls[1]?.[0] as unknown as any[];
      expect(pathPromptCall[0].validate('')).toBe('Path is required');
      expect(pathPromptCall[0].validate('/valid/path')).toBe(true);
    });
  });

  describe('promptRereadAction', () => {
    it('should prompt with reread option showing filename', async () => {
      mockInquirer.prompt.mockResolvedValueOnce({ action: 'reread' });

      const result = await promptRereadAction('1984', 1, null, '1984-02.md');

      expect(result).toBe('reread');
      expect(mockInquirer.prompt).toHaveBeenCalledTimes(1);

      const promptCall = mockInquirer.prompt.mock.calls[0]?.[0] as unknown as any[];
      expect(promptCall[0].choices[0].name).toContain('1984-02.md');
    });

    it('should return update action', async () => {
      mockInquirer.prompt.mockResolvedValueOnce({ action: 'update' });

      const result = await promptRereadAction('Dune', 2, '2023-01-15T00:00:00.000Z', 'dune-03.md');

      expect(result).toBe('update');
    });

    it('should return cancel action', async () => {
      mockInquirer.prompt.mockResolvedValueOnce({ action: 'cancel' });

      const result = await promptRereadAction('Book Title', 1, null, 'book-title-02.md');

      expect(result).toBe('cancel');
    });

    it('should default to reread option', async () => {
      mockInquirer.prompt.mockResolvedValueOnce({ action: 'reread' });

      await promptRereadAction('Test', 1, null, 'test-02.md');

      const promptCall = mockInquirer.prompt.mock.calls[0]?.[0] as unknown as any[];
      expect(promptCall[0].default).toBe('reread');
    });

    it('should include all three action choices', async () => {
      mockInquirer.prompt.mockResolvedValueOnce({ action: 'reread' });

      await promptRereadAction('Test', 1, null, 'test-02.md');

      const promptCall = mockInquirer.prompt.mock.calls[0]?.[0] as unknown as any[];
      expect(promptCall[0].choices).toHaveLength(3);
      expect(promptCall[0].choices[0].value).toBe('reread');
      expect(promptCall[0].choices[1].value).toBe('update');
      expect(promptCall[0].choices[2].value).toBe('cancel');
    });
  });
});
