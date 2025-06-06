/**
 * UTC date utilities for audit-filter
 *
 * This module provides timezone-independent date operations using date-fns
 * to ensure consistent behavior regardless of server timezone.
 */

import { parseISO, isAfter, isBefore, addDays, isValid } from 'date-fns';

/**
 * Parse a date string ensuring UTC timezone interpretation
 *
 * @param dateString - ISO 8601 date string (YYYY-MM-DD or full ISO string)
 * @returns Date object or null if invalid
 */
export function parseUtcDate(dateString: string): Date | null {
  if (!dateString) {
    return null;
  }

  try {
    // Ensure the date string is treated as UTC
    let utcDateString = dateString;

    // If it's just YYYY-MM-DD format, treat as UTC date at midnight
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      utcDateString = `${dateString}T00:00:00.000Z`;
    } else if (
      !dateString.endsWith('Z') &&
      !dateString.includes('+') &&
      !dateString.includes('-', 10)
    ) {
      // If no timezone info and contains T, assume UTC
      if (dateString.includes('T')) {
        utcDateString = `${dateString}Z`;
      } else {
        utcDateString = `${dateString}T00:00:00.000Z`;
      }
    }

    const parsed = parseISO(utcDateString);

    if (!isValid(parsed)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

/**
 * Get current UTC date (for testing, this can be mocked)
 *
 * @returns Current date in UTC
 */
export function getCurrentUtcDate(): Date {
  return new Date();
}

/**
 * Check if a date is after another date (timezone-independent)
 *
 * @param date - Date to check
 * @param compareDate - Date to compare against
 * @returns true if date is after compareDate
 */
export function isDateAfter(date: Date, compareDate: Date): boolean {
  return isAfter(date, compareDate);
}

/**
 * Check if a date is before another date (timezone-independent)
 *
 * @param date - Date to check
 * @param compareDate - Date to compare against
 * @returns true if date is before compareDate
 */
export function isDateBefore(date: Date, compareDate: Date): boolean {
  return isBefore(date, compareDate);
}

/**
 * Add days to a date (timezone-independent)
 *
 * @param date - Base date
 * @param days - Number of days to add
 * @returns New date with days added
 */
export function addDaysToDate(date: Date, days: number): Date {
  return addDays(date, days);
}

/**
 * Check if an allowlist entry has expired (timezone-independent)
 *
 * @param expirationDateString - ISO 8601 expiration date string
 * @param currentDate - Current date to compare against
 * @returns true if expired, false if valid, true if invalid date format
 */
export function isExpired(expirationDateString: string | undefined, currentDate: Date): boolean {
  if (!expirationDateString) {
    // No expiration date means it should be expired (per T006)
    return true;
  }

  const expirationDate = parseUtcDate(expirationDateString);

  if (!expirationDate) {
    // Invalid date format is treated as expired
    return true;
  }

  return isDateBefore(expirationDate, currentDate);
}

/**
 * Check if an allowlist entry will expire soon (timezone-independent)
 *
 * @param expirationDateString - ISO 8601 expiration date string
 * @param currentDate - Current date to compare against
 * @param daysThreshold - Number of days to look ahead (default: 30)
 * @returns true if expires within threshold, false otherwise
 */
export function willExpireSoon(
  expirationDateString: string | undefined,
  currentDate: Date,
  daysThreshold: number = 30
): boolean {
  if (!expirationDateString) {
    // No expiration date - doesn't expire soon, it's already expired
    return false;
  }

  const expirationDate = parseUtcDate(expirationDateString);

  if (!expirationDate) {
    // Invalid date format - doesn't expire soon, it's invalid
    return false;
  }

  // Don't consider already expired entries as "expiring soon"
  if (isDateBefore(expirationDate, currentDate)) {
    return false;
  }

  const thresholdDate = addDaysToDate(currentDate, daysThreshold);
  return (
    isDateBefore(expirationDate, thresholdDate) ||
    expirationDate.getTime() === thresholdDate.getTime()
  );
}

/**
 * Format a date as ISO 8601 UTC string
 *
 * @param date - Date to format
 * @returns ISO 8601 string in UTC
 */
export function formatUtcDate(date: Date): string {
  return date.toISOString();
}
