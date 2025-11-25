import { Inter, IBM_Plex_Mono } from 'next/font/google';

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
 * IBM Plex Mono font configuration
 * Used for headings and display text - technical, distinctive monospace aesthetic
 */
export const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-ibm-plex-mono',
  weight: ['400', '500', '600', '700'],
});
