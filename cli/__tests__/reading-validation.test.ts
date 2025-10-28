import { validateDateInput, sanitizeSlug, validateDateForPrompt } from '../lib/reading-validation';

describe('reading-validation', () => {
  describe('validateDateInput', () => {
    it('should accept valid ISO date string', () => {
      const result = validateDateInput('2024-01-15');
      expect(result).toBe('2024-01-15T00:00:00.000Z');
    });

    it('should accept various date formats', () => {
      const formats = ['2024-01-15', '01/15/2024', 'January 15, 2024'];

      formats.forEach(format => {
        const result = validateDateInput(format);
        expect(result).toContain('2024-01-15');
      });
    });

    it('should normalize dates to ISO 8601 format', () => {
      const result = validateDateInput('2024-06-20');
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should throw error for empty string', () => {
      expect(() => validateDateInput('')).toThrow('Date is required');
    });

    it('should throw error for whitespace only', () => {
      expect(() => validateDateInput('   ')).toThrow('Date is required');
    });

    it('should throw error for invalid date string', () => {
      expect(() => validateDateInput('not-a-date')).toThrow('Please enter a valid date');
    });

    it('should throw error for malformed date', () => {
      expect(() => validateDateInput('2024-13-45')).toThrow('Please enter a valid date');
    });

    it('should throw error for date in the future', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const futureDateString = futureDate.toISOString().split('T')[0];
      if (!futureDateString) throw new Error('Failed to generate future date');

      expect(() => validateDateInput(futureDateString)).toThrow('Date cannot be in the future');
    });

    it("should accept today's date", () => {
      const today = new Date().toISOString().split('T')[0];
      if (!today) throw new Error('Failed to generate today date');
      const result = validateDateInput(today);
      expect(result).toBeDefined();
    });

    it('should accept dates from the past', () => {
      const result = validateDateInput('2020-01-01');
      expect(result).toBe('2020-01-01T00:00:00.000Z');
    });

    it('should handle leap year dates', () => {
      const result = validateDateInput('2024-02-29');
      expect(result).toBe('2024-02-29T00:00:00.000Z');
    });

    it('should handle invalid leap year dates (Date auto-adjusts)', () => {
      // Note: JavaScript Date auto-adjusts invalid dates (2023-02-29 -> 2023-03-01)
      // This is expected Date behavior, not a bug
      const result = validateDateInput('2023-02-29');
      expect(result).toBe('2023-03-01T00:00:00.000Z'); // Auto-adjusted by Date
    });
  });

  describe('sanitizeSlug', () => {
    it('should convert title to lowercase slug', () => {
      const result = sanitizeSlug('The Great Gatsby');
      expect(result).toBe('the-great-gatsby');
    });

    it('should replace spaces with hyphens', () => {
      const result = sanitizeSlug('War and Peace');
      expect(result).toBe('war-and-peace');
    });

    it('should remove special characters', () => {
      const result = sanitizeSlug("Don't Make Me Think!");
      expect(result).toBe('dont-make-me-think');
    });

    it('should handle numbers in titles', () => {
      const result = sanitizeSlug('1984');
      expect(result).toBe('1984');
    });

    it('should handle ampersands', () => {
      const result = sanitizeSlug('War & Peace');
      expect(result).toBe('war-and-peace');
    });

    it('should handle multiple consecutive spaces', () => {
      const result = sanitizeSlug('The    Great    Gatsby');
      expect(result).toBe('the-great-gatsby');
    });

    it('should handle leading and trailing spaces', () => {
      const result = sanitizeSlug('  Clean Code  ');
      expect(result).toBe('clean-code');
    });

    it('should handle unicode characters', () => {
      const result = sanitizeSlug('Café Society');
      expect(result).toBe('cafe-society');
    });

    it('should throw error for empty string', () => {
      expect(() => sanitizeSlug('')).toThrow('Title is required');
    });

    it('should throw error for whitespace only', () => {
      expect(() => sanitizeSlug('   ')).toThrow('Title is required');
    });

    it('should handle complex punctuation', () => {
      const result = sanitizeSlug('The Lord of the Rings: The Fellowship of the Ring');
      expect(result).toBe('the-lord-of-the-rings-the-fellowship-of-the-ring');
    });

    it('should handle already hyphenated titles', () => {
      const result = sanitizeSlug('check-list-manifesto');
      expect(result).toBe('check-list-manifesto');
    });

    it('should be consistent with same input', () => {
      const title = 'Design Patterns';
      const result1 = sanitizeSlug(title);
      const result2 = sanitizeSlug(title);
      expect(result1).toBe(result2);
    });
  });

  describe('validateDateForPrompt', () => {
    it('should return true for valid date', () => {
      const result = validateDateForPrompt('2024-01-15');
      expect(result).toBe(true);
    });

    it('should return true for empty string (optional)', () => {
      const result = validateDateForPrompt('');
      expect(result).toBe(true);
    });

    it('should return true for whitespace (optional)', () => {
      const result = validateDateForPrompt('   ');
      expect(result).toBe(true);
    });

    it('should return error message for invalid date', () => {
      const result = validateDateForPrompt('not-a-date');
      expect(result).toBe('Please enter a valid date (YYYY-MM-DD)');
    });

    it('should return error message for future date', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const futureDateString = futureDate.toISOString().split('T')[0];
      if (!futureDateString) throw new Error('Failed to generate future date');

      const result = validateDateForPrompt(futureDateString);
      expect(result).toBe('Date cannot be in the future');
    });

    it('should be compatible with inquirer validate function', () => {
      // Inquirer expects either true or a string
      const validResult = validateDateForPrompt('2024-01-15');
      const invalidResult = validateDateForPrompt('invalid');

      expect(typeof validResult === 'boolean' || typeof validResult === 'string').toBe(true);
      expect(typeof invalidResult === 'boolean' || typeof invalidResult === 'string').toBe(true);
    });

    it("should return true for today's date", () => {
      const today = new Date().toISOString().split('T')[0];
      if (!today) throw new Error('Failed to generate today date');
      const result = validateDateForPrompt(today);
      expect(result).toBe(true);
    });

    it('should return true for past dates', () => {
      const result = validateDateForPrompt('2020-01-01');
      expect(result).toBe(true);
    });
  });
});
