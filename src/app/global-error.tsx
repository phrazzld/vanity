'use client';

/**
 * Global error boundary for catastrophic failures where the root layout might be broken.
 * This component must work without any imports and creates a complete HTML document.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Log error to console in case logging infrastructure is available
  if (typeof console !== 'undefined' && console.error) {
    console.error('Global error:', error);
  }
  return (
    <html lang="en">
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background-color: #f9fafb;
            color: #111827;
            padding: 1rem;
          }

          body.dark {
            background-color: #111827;
            color: #f9fafb;
          }

          .container {
            max-width: 32rem;
            text-align: center;
            padding: 2rem;
            background-color: white;
            border-radius: 0.5rem;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
          }

          body.dark .container {
            background-color: #1f2937;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.5);
          }

          h1 {
            font-size: 2rem;
            font-weight: bold;
            margin-bottom: 1rem;
            color: #dc2626;
          }

          body.dark h1 {
            color: #f87171;
          }

          p {
            font-size: 1rem;
            line-height: 1.5;
            margin-bottom: 2rem;
            opacity: 0.8;
          }

          .button-group {
            display: flex;
            gap: 1rem;
            justify-content: center;
          }

          button, a {
            padding: 0.75rem 1.5rem;
            border-radius: 0.375rem;
            font-size: 0.875rem;
            font-weight: 500;
            text-decoration: none;
            cursor: pointer;
            transition: all 0.2s;
            border: none;
          }

          .home-button {
            background-color: #e5e7eb;
            color: #374151;
          }

          .home-button:hover {
            background-color: #d1d5db;
          }

          body.dark .home-button {
            background-color: #374151;
            color: #e5e7eb;
          }

          body.dark .home-button:hover {
            background-color: #4b5563;
          }

          .reset-button {
            background-color: #2563eb;
            color: white;
          }

          .reset-button:hover {
            background-color: #1d4ed8;
          }

          .error-code {
            font-family: monospace;
            font-size: 3rem;
            font-weight: bold;
            color: #dc2626;
            margin-bottom: 1rem;
          }

          body.dark .error-code {
            color: #f87171;
          }
        `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
          // Check localStorage for theme preference
          try {
            const theme = localStorage.getItem('theme');
            if (theme === 'dark') {
              document.body.classList.add('dark');
            }
          } catch (e) {
            // Ignore localStorage errors
          }
        `,
          }}
        />
      </head>
      <body>
        <div className="container">
          <div className="error-code">500</div>
          <h1>Something went critically wrong</h1>
          <p>
            a critical error occurred that prevented the application from loading properly. this
            error has been logged and we're working to fix it.
          </p>
          <div className="button-group">
            <button onClick={() => (window.location.href = '/')} className="home-button">
              go home
            </button>
            <button onClick={reset} className="reset-button">
              try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
