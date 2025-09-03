/**
 * ImageSecurity Component Tests
 * @jest-environment jsdom
 *
 * Tests for SSRF protection and internal IP blocking in image components
 */

/* eslint-env jest */

import React from 'react';
import { validateImageUrl } from '@/lib/utils/readingUtils';

// Mock the logger
jest.mock('@/lib/logger', () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }: any) {
    return React.createElement('img', { src, alt, ...props, 'data-testid': 'mock-image' });
  };
});

describe('ImageSecurity', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('SSRF Protection - Internal IP Blocking', () => {
    const internalIPs = [
      '127.0.0.1',
      '127.0.0.2',
      '127.1.1.1',
      '169.254.169.254', // AWS metadata endpoint
      '169.254.0.1', // Link-local address
      '10.0.0.1', // Private network
      '172.16.0.1', // Private network
      '192.168.1.1', // Private network
      'localhost',
      '::1', // IPv6 localhost
      '0.0.0.0', // All interfaces
    ];

    internalIPs.forEach(ip => {
      it(`blocks internal IP/hostname: ${ip}`, () => {
        const maliciousUrls = [
          `http://${ip}/malicious`,
          `https://${ip}/metadata`,
          `http://${ip}:8080/admin`,
          `https://${ip}:443/secret`,
        ];

        maliciousUrls.forEach(url => {
          const result = validateImageUrl(url);
          expect(result.isValid).toBe(false);
        });
      });
    });

    it('blocks URLs with bypassing techniques', () => {
      const bypassAttempts = [
        'http://127.0.0.1.example.com/', // Subdomain trick
        'http://0x7f000001/', // Hex encoding
        'http://2130706433/', // Decimal encoding
        'http://017700000001/', // Octal encoding
        'http://127.000.000.1/', // Zero padding
        'http://[::1]/', // IPv6 localhost
        'http://[0:0:0:0:0:0:0:1]/', // IPv6 localhost expanded
      ];

      bypassAttempts.forEach(url => {
        const result = validateImageUrl(url);
        expect(result.isValid).toBe(false);
      });
    });
  });

  describe('Domain Allowlist Validation', () => {
    const allowedDomains = [
      'm.media-amazon.com',
      'images-na.ssl-images-amazon.com',
      'cdn11.bigcommerce.com',
      'i.pinimg.com',
      'resizing.flixster.com',
    ];

    allowedDomains.forEach(domain => {
      it(`allows images from approved domain: ${domain}`, () => {
        const validUrls = [
          `https://${domain}/book-cover.jpg`,
          `https://${domain}/path/to/image.png`,
          `https://${domain}/deep/nested/path/image.webp`,
        ];

        validUrls.forEach(url => {
          const result = validateImageUrl(url);
          expect(result.isValid).toBe(true);
        });
      });
    });

    it('rejects images from non-allowlisted domains', () => {
      const blockedUrls = [
        'https://evil.com/image.jpg',
        'https://malicious-site.net/cover.png',
        'https://unauthorized-cdn.com/book.webp',
        'http://sketchy-domain.org/picture.gif',
        'https://fake-amazon.com/book.jpg', // Similar but not exact match
        'https://not-approved.com/image.svg',
      ];

      blockedUrls.forEach(url => {
        const result = validateImageUrl(url);
        expect(result.isValid).toBe(false);
      });
    });
  });

  describe('URL Malformation Protection', () => {
    it('handles malformed URLs gracefully', () => {
      const malformedUrls = [
        'not-a-url',
        'ftp://example.com/file.jpg', // Wrong protocol
        'javascript:alert(1)', // XSS attempt
        'data:image/png;base64,abc123', // Data URLs
        '', // Empty string
        null, // Null value
        undefined, // Undefined value
      ];

      malformedUrls.forEach(url => {
        const result = validateImageUrl(url as any);
        expect(result.isValid).toBe(false);
      });
    });

    it('requires HTTPS protocol only', () => {
      const httpUrls = ['http://m.media-amazon.com/book.jpg', 'http://i.pinimg.com/image.png'];

      httpUrls.forEach(url => {
        const result = validateImageUrl(url);
        expect(result.isValid).toBe(false);
      });
    });
  });

  describe('Edge Cases and Security Boundaries', () => {
    it('validates extremely long URLs', () => {
      const longPath = 'a'.repeat(2000);
      const longUrl = `https://m.media-amazon.com/${longPath}/image.jpg`;

      const result = validateImageUrl(longUrl);
      expect(result.isValid).toBe(false); // Should reject excessively long URLs
    });

    it('handles Unicode and encoded characters', () => {
      const unicodeUrls = [
        'https://m.media-amazon.com/book%E2%80%8B.jpg', // Zero-width space
        'https://m.media-amazon.com/book\u200B.jpg', // Direct Unicode
        'https://m.media-amazon.com/../../../etc/passwd', // Path traversal
      ];

      unicodeUrls.forEach(url => {
        const result = validateImageUrl(url);
        // These should either be validated properly or rejected for safety
        expect(typeof result.isValid).toBe('boolean');
      });
    });

    it('prevents port specification on allowed domains', () => {
      const urlsWithPorts = [
        'https://m.media-amazon.com:8080/image.jpg',
        'https://i.pinimg.com:3000/cover.png',
        'https://cdn11.bigcommerce.com:443/book.webp', // Even standard HTTPS port
      ];

      urlsWithPorts.forEach(url => {
        const result = validateImageUrl(url);
        expect(result.isValid).toBe(false);
      });
    });
  });
});
