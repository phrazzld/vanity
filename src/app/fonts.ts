import { Inter, Space_Grotesk } from 'next/font/google';

/**
 * Inter font configuration
 * Used as the primary font for body text throughout the application
 */
export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
});

/**
 * Space Grotesk font configuration
 * Used for headings and display text
 */
export const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
  weight: ['400', '700'],
});
