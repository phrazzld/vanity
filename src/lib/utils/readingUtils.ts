/**
 * Utility functions for working with reading data
 */

import type { Reading } from '@/types';

/**
 * Creates a mapping of readings by year
 *
 * @param readings Array of reading objects to group by year
 * @returns Object with year keys and arrays of readings as values
 */
export function groupReadingsByYear(readings: Reading[]): Record<string, Reading[]> {
  // Initialize with special section for "Currently Reading"
  const grouped: Record<string, Reading[]> = {
    'Currently Reading': [],
  };

  // First pass: process readings into correct buckets based on status
  readings.forEach(reading => {
    // Handle special categories first
    if (reading.finishedDate === null) {
      grouped['Currently Reading']?.push(reading);
      return;
    }

    // For finished readings, determine the year
    const finishedDate =
      typeof reading.finishedDate === 'string'
        ? new Date(reading.finishedDate)
        : reading.finishedDate;

    const year = finishedDate.getFullYear().toString();

    // Initialize array for this year if it doesn't exist yet
    if (!grouped[year]) {
      grouped[year] = [];
    }

    // Add reading to appropriate year
    grouped[year]?.push(reading);
  });

  // Remove empty special categories
  Object.keys(grouped).forEach(key => {
    if (grouped[key]?.length === 0) {
      delete grouped[key];
    }
  });

  return grouped;
}

/**
 * Returns sorted year keys with special sections first
 *
 * @param yearGroups Object with year keys and reading arrays
 * @returns Array of year keys sorted in display order
 */
export function getSortedYearKeys(yearGroups: Record<string, Reading[]>): string[] {
  const years = Object.keys(yearGroups);

  // Separate special sections and regular years
  const specialSections = ['Currently Reading'].filter(section => years.includes(section));

  const regularYears = years
    .filter(year => !specialSections.includes(year))
    .sort((a, b) => parseInt(b, 10) - parseInt(a, 10)); // Sort years in descending order

  // Combine with special sections first
  return [...specialSections, ...regularYears];
}

/**
 * Sorts readings within a specific category/year
 *
 * @param readings Array of readings to sort
 * @param category Category/year being sorted
 * @returns Sorted array of readings
 */
export function sortReadingsWithinCategory(readings: Reading[], category: string): Reading[] {
  if (category === 'Currently Reading') {
    // Sorting logic for currently reading items (e.g. by title)
    return [...readings].sort((a, b) => a.title.localeCompare(b.title));
  }

  // For year categories, sort by finishedDate in descending order (most recent first)
  return [...readings].sort((a, b) => {
    const dateA = new Date(a.finishedDate as string | Date);
    const dateB = new Date(b.finishedDate as string | Date);
    return dateB.getTime() - dateA.getTime();
  });
}

export function getFullImageUrl(src: string | null): string {
  if (!src) return '/images/projects/book-02.webp';
  if (src.startsWith('http://') || src.startsWith('https://')) return src;

  // Local images (created by CLI tool) should be served directly from public directory
  if (src.startsWith('/images/readings/')) return src;

  // Legacy relative paths - return as-is (should be updated in content)
  return src;
}

/**
 * Validates an image URL for basic format correctness
 *
 * @param url URL string to validate
 * @returns Object with validation result and error message if invalid
 */
export function validateImageUrl(url: string): { isValid: boolean; error?: string } {
  if (!url) {
    return { isValid: false, error: 'URL is required' };
  }

  // Allow internal paths
  if (url.startsWith('/')) {
    return { isValid: true };
  }

  // Validate external URLs
  try {
    const parsed = new URL(url);

    // Only allow HTTPS protocol for external URLs (security requirement)
    if (parsed.protocol !== 'https:') {
      return { isValid: false, error: 'Only HTTPS URLs are allowed for external images' };
    }

    // SSRF Protection: Block internal/private IP addresses
    const hostname = parsed.hostname.toLowerCase();

    // Block localhost variations
    if (hostname === 'localhost' || hostname === '0.0.0.0') {
      return { isValid: false, error: 'Internal hostnames are blocked for security' };
    }

    // Block IPv4 private/internal ranges
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const ipv4Match = hostname.match(ipv4Regex);

    if (ipv4Match) {
      const a = Number(ipv4Match[1]);
      const b = Number(ipv4Match[2]);
      const c = Number(ipv4Match[3]);
      const d = Number(ipv4Match[4]);

      // Validate each octet is 0-255
      if (
        isNaN(a) ||
        isNaN(b) ||
        isNaN(c) ||
        isNaN(d) ||
        a > 255 ||
        b > 255 ||
        c > 255 ||
        d > 255
      ) {
        return { isValid: false, error: 'Invalid IP address format' };
      }

      // Block private and internal IP ranges
      if (
        a === 127 || // 127.0.0.0/8 - loopback
        (a === 169 && b === 254) || // 169.254.0.0/16 - link-local
        a === 10 || // 10.0.0.0/8 - private
        (a === 172 && b >= 16 && b <= 31) || // 172.16.0.0/12 - private
        (a === 192 && b === 168) // 192.168.0.0/16 - private
      ) {
        return { isValid: false, error: 'Private/internal IP addresses are blocked for security' };
      }
    }

    // Block IPv6 localhost and link-local
    if (
      hostname === '::1' ||
      hostname.startsWith('fe80:') ||
      hostname.startsWith('[::1]') ||
      hostname.startsWith('[fe80:')
    ) {
      return { isValid: false, error: 'IPv6 internal addresses are blocked for security' };
    }

    // Block port specifications for security (including explicit default ports)
    const hasExplicitPort = /:\d+\//.test(url);
    if (parsed.port || hasExplicitPort) {
      return { isValid: false, error: 'Port specifications are not allowed' };
    }

    // Domain allowlist - only approved CDN domains
    const allowedDomains = [
      'm.media-amazon.com',
      'images-na.ssl-images-amazon.com',
      'cdn11.bigcommerce.com',
      'i.pinimg.com',
      'resizing.flixster.com',
    ];

    if (!allowedDomains.includes(hostname)) {
      return { isValid: false, error: 'Domain not in allowlist' };
    }

    // Block excessively long URLs (potential attack vector)
    if (url.length > 1000) {
      return { isValid: false, error: 'URL too long' };
    }

    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Invalid URL format' };
  }
}
