/**
 * Tests for UTC date utilities
 *
 * Tests timezone-independent date operations to ensure consistent behavior
 * regardless of server timezone.
 */

import {
  parseUtcDate,
  getCurrentUtcDate,
  isDateAfter,
  isDateBefore,
  addDaysToDate,
  isExpired,
  willExpireSoon,
  formatUtcDate,
} from '../dateUtils';

// Mock nanoid for consistent correlation IDs
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'test-correlation-id'),
}));

describe('UTC Date Utilities', () => {
  describe('parseUtcDate', () => {
    test('should parse YYYY-MM-DD format as UTC midnight', () => {
      const result = parseUtcDate('2023-06-15');
      expect(result).toEqual(new Date('2023-06-15T00:00:00.000Z'));
    });

    test('should parse full ISO 8601 UTC string', () => {
      const result = parseUtcDate('2023-06-15T14:30:00.000Z');
      expect(result).toEqual(new Date('2023-06-15T14:30:00.000Z'));
    });

    test('should treat date without timezone as UTC', () => {
      const result = parseUtcDate('2023-06-15T14:30:00');
      expect(result).toEqual(new Date('2023-06-15T14:30:00.000Z'));
    });

    test('should return null for invalid date strings', () => {
      expect(parseUtcDate('invalid-date')).toBe(null);
      expect(parseUtcDate('2023-13-45')).toBe(null);
      expect(parseUtcDate('')).toBe(null);
    });

    test('should handle edge cases', () => {
      expect(parseUtcDate('2024-02-29')).toEqual(new Date('2024-02-29T00:00:00.000Z')); // Leap year
      expect(parseUtcDate('2023-02-29')).toBe(null); // Invalid leap day
    });
  });

  describe('getCurrentUtcDate', () => {
    test('should return current date', () => {
      const before = new Date();
      const result = getCurrentUtcDate();
      const after = new Date();

      expect(result.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(result.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('isDateAfter and isDateBefore', () => {
    const date1 = new Date('2023-06-15T12:00:00Z');
    const date2 = new Date('2023-06-16T12:00:00Z');

    test('isDateAfter should work correctly', () => {
      expect(isDateAfter(date2, date1)).toBe(true);
      expect(isDateAfter(date1, date2)).toBe(false);
      expect(isDateAfter(date1, date1)).toBe(false);
    });

    test('isDateBefore should work correctly', () => {
      expect(isDateBefore(date1, date2)).toBe(true);
      expect(isDateBefore(date2, date1)).toBe(false);
      expect(isDateBefore(date1, date1)).toBe(false);
    });
  });

  describe('addDaysToDate', () => {
    test('should add days correctly', () => {
      const baseDate = new Date('2023-06-15T12:00:00Z');
      const result = addDaysToDate(baseDate, 5);
      expect(result).toEqual(new Date('2023-06-20T12:00:00Z'));
    });

    test('should handle negative days', () => {
      const baseDate = new Date('2023-06-15T12:00:00Z');
      const result = addDaysToDate(baseDate, -5);
      expect(result).toEqual(new Date('2023-06-10T12:00:00Z'));
    });

    test('should handle month boundaries', () => {
      const baseDate = new Date('2023-06-30T12:00:00Z');
      const result = addDaysToDate(baseDate, 1);
      expect(result).toEqual(new Date('2023-07-01T12:00:00Z'));
    });

    test('should handle leap years', () => {
      const baseDate = new Date('2024-02-28T12:00:00Z');
      const result = addDaysToDate(baseDate, 1);
      expect(result).toEqual(new Date('2024-02-29T12:00:00Z'));
    });
  });

  describe('isExpired', () => {
    const currentDate = new Date('2023-06-15T12:00:00Z');

    test('should return true for missing expiration date', () => {
      expect(isExpired(undefined, currentDate)).toBe(true);
      expect(isExpired('', currentDate)).toBe(true);
    });

    test('should return true for invalid date format', () => {
      expect(isExpired('invalid-date', currentDate)).toBe(true);
      expect(isExpired('2023-13-45', currentDate)).toBe(true);
    });

    test('should return true for expired dates', () => {
      expect(isExpired('2023-06-14', currentDate)).toBe(true);
      expect(isExpired('2023-06-15T11:59:59Z', currentDate)).toBe(true);
    });

    test('should return false for future dates', () => {
      expect(isExpired('2023-06-16', currentDate)).toBe(false);
      expect(isExpired('2023-06-15T12:00:01Z', currentDate)).toBe(false);
    });

    test('should handle exact boundary correctly', () => {
      const exactDate = new Date('2023-06-15T12:00:00Z');
      expect(isExpired('2023-06-15T12:00:00Z', exactDate)).toBe(false);
    });
  });

  describe('willExpireSoon', () => {
    const currentDate = new Date('2023-06-15T12:00:00Z');

    test('should return false for missing expiration date', () => {
      expect(willExpireSoon(undefined, currentDate, 30)).toBe(false);
      expect(willExpireSoon('', currentDate, 30)).toBe(false);
    });

    test('should return false for invalid date format', () => {
      expect(willExpireSoon('invalid-date', currentDate, 30)).toBe(false);
      expect(willExpireSoon('2023-13-45', currentDate, 30)).toBe(false);
    });

    test('should return false for already expired dates', () => {
      expect(willExpireSoon('2023-06-14', currentDate, 30)).toBe(false);
      expect(willExpireSoon('2023-06-15T11:59:59Z', currentDate, 30)).toBe(false);
    });

    test('should return true for dates expiring within threshold', () => {
      expect(willExpireSoon('2023-06-16', currentDate, 30)).toBe(true);
      expect(willExpireSoon('2023-07-14', currentDate, 30)).toBe(true); // 29 days
      expect(willExpireSoon('2023-07-15', currentDate, 30)).toBe(true); // 30 days exactly
    });

    test('should return false for dates beyond threshold', () => {
      expect(willExpireSoon('2023-07-16', currentDate, 30)).toBe(false); // 31 days
      expect(willExpireSoon('2024-06-15', currentDate, 30)).toBe(false);
    });

    test('should handle custom thresholds', () => {
      expect(willExpireSoon('2023-06-22', currentDate, 7)).toBe(true); // 7 days
      expect(willExpireSoon('2023-06-23', currentDate, 7)).toBe(false); // 8 days
    });

    test('should handle exact threshold boundary', () => {
      const exactThresholdDate = '2023-07-15T12:00:00Z'; // Exactly 30 days
      expect(willExpireSoon(exactThresholdDate, currentDate, 30)).toBe(true);
    });
  });

  describe('formatUtcDate', () => {
    test('should format date as ISO 8601 UTC string', () => {
      const date = new Date('2023-06-15T14:30:45.123Z');
      const result = formatUtcDate(date);
      expect(result).toBe('2023-06-15T14:30:45.123Z');
    });
  });

  describe('Timezone Independence Tests', () => {
    test('should produce same results regardless of system timezone', () => {
      const currentDate = new Date('2023-06-15T12:00:00Z');

      // Test the same expiration date in different timezone formats
      const utcExpiry = '2023-06-20T00:00:00Z';
      const pstEquivalent = '2023-06-19T17:00:00-07:00'; // Same moment in PST
      const estEquivalent = '2023-06-19T20:00:00-04:00'; // Same moment in EST

      // All should produce the same result
      expect(isExpired(utcExpiry, currentDate)).toBe(false);
      expect(isExpired(pstEquivalent, currentDate)).toBe(false);
      expect(isExpired(estEquivalent, currentDate)).toBe(false);

      expect(willExpireSoon(utcExpiry, currentDate, 30)).toBe(true);
      expect(willExpireSoon(pstEquivalent, currentDate, 30)).toBe(true);
      expect(willExpireSoon(estEquivalent, currentDate, 30)).toBe(true);
    });

    test('should handle YYYY-MM-DD format consistently', () => {
      const currentDate = new Date('2023-06-15T23:59:59Z'); // Late in the day
      const nextDayDate = '2023-06-16'; // Should be treated as 2023-06-16T00:00:00Z

      // Should not be expired even though current time is late on 15th
      expect(isExpired(nextDayDate, currentDate)).toBe(false);
    });

    test('should handle leap year calculations correctly', () => {
      const leapYearDate = new Date('2024-02-28T12:00:00Z');
      const nonLeapYearDate = new Date('2023-02-28T12:00:00Z');

      // Adding 1 day to Feb 28 in leap year vs non-leap year
      const leapResult = addDaysToDate(leapYearDate, 1);
      const nonLeapResult = addDaysToDate(nonLeapYearDate, 1);

      expect(leapResult).toEqual(new Date('2024-02-29T12:00:00Z'));
      expect(nonLeapResult).toEqual(new Date('2023-03-01T12:00:00Z'));
    });
  });
});
