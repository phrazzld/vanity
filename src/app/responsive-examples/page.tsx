/**
 * Responsive Examples Page
 *
 * This page showcases the responsive design utilities and patterns available in the project.
 * It serves as a live demo of the responsive capabilities implemented in the design system.
 *
 * NOTE: This page is for development only and should not be included in production builds.
 */

import ResponsivePatterns from '../components/responsive/ResponsiveExamples';

export const metadata = {
  title: 'Responsive Design Examples | Vanity',
  description:
    'Examples of responsive design patterns and utilities available in the Vanity project',
  robots: 'noindex,nofollow', // Prevent indexing of demo page
};

export default function ResponsiveExamplesPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Responsive Design Examples</h1>
      <p className="mb-8 text-lg text-amber-600 dark:text-amber-400">
        ⚠️ Development Only: This page is for testing responsive design patterns and is excluded
        from production builds.
      </p>
      <p className="mb-8 text-lg">
        This page demonstrates the responsive design utilities and patterns available in the Vanity
        project. Resize your browser window to see how the components adapt to different screen
        sizes.
      </p>

      <ResponsivePatterns />
    </div>
  );
}
