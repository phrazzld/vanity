import type { Config } from 'tailwindcss';
// Import defaultTheme with proper typing to avoid ESLint errors
import defaultTheme from 'tailwindcss/defaultTheme';
// Import container queries plugin
import containerQueries from '@tailwindcss/container-queries';

/**
 * Vanity Design System
 *
 * This configuration defines all design tokens and theming capabilities
 * for the Vanity project, following our design system principles.
 */
export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/stories/**/*.{js,ts,jsx,tsx,mdx}',
    './.storybook/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // Use class strategy for dark mode
  theme: {
    extend: {
      // Font families
      fontFamily: {
        inter: ['Inter', ...defaultTheme.fontFamily.sans],
        'space-grotesk': ['Space Grotesk', ...defaultTheme.fontFamily.sans],
      },

      // Color system with semantic naming
      colors: {
        // Base palette
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#0d1117',
        },
        blue: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        green: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },

        // Semantic tokens
        primary: {
          50: 'var(--primary-50)',
          100: 'var(--primary-100)',
          200: 'var(--primary-200)',
          300: 'var(--primary-300)',
          400: 'var(--primary-400)',
          500: 'var(--primary-500)',
          600: 'var(--primary-600)',
          700: 'var(--primary-700)',
          800: 'var(--primary-800)',
          900: 'var(--primary-900)',
        },

        // Status colors
        status: {
          reading: {
            light: '#4b93f7',
            main: '#3b82f6',
            dark: '#2563eb',
            lighter: '#93c5fd',
            darker: '#1d4ed8',
          },
          finished: {
            light: '#0ea974',
            main: '#10b981',
            dark: '#059669',
            lighter: '#6ee7b7',
            darker: '#047857',
          },
          paused: {
            light: '#7c8490',
            main: '#6b7280',
            dark: '#4b5563',
            lighter: '#d1d5db',
            darker: '#374151',
          },
        },

        // Theme tokens (light/dark mode variables)
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: 'var(--card)',
        'card-foreground': 'var(--card-foreground)',
        popover: 'var(--popover)',
        'popover-foreground': 'var(--popover-foreground)',
        border: 'var(--border)',
        input: 'var(--input)',
        muted: 'var(--muted)',
        'muted-foreground': 'var(--muted-foreground)',
        accent: 'var(--accent)',
        'accent-foreground': 'var(--accent-foreground)',
      },

      // Typography scale
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },

      // Spacing scale
      spacing: {
        // Add custom spacing values if needed
        '4.5': '1.125rem',
        '7.5': '1.875rem',
        '13': '3.25rem',
      },

      // Border radius
      borderRadius: {
        sm: '0.125rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        pill: '9999px',
      },

      // Box shadows
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        none: 'none',
        // Custom shadows
        'card-hover': '0 10px 20px -6px rgba(0, 0, 0, 0.15), 0 3px 6px -3px rgba(0, 0, 0, 0.1)',
        'card-hover-dark':
          '0 10px 20px -6px rgba(0, 0, 0, 0.35), 0 3px 6px -3px rgba(0, 0, 0, 0.25)',
        card: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.03)',
        'card-dark': '0 1px 3px rgba(0, 0, 0, 0.2), 0 1px 2px -1px rgba(0, 0, 0, 0.15)',
      },

      // Animation
      animation: {
        'fade-in': 'fade-in-up 0.4s ease forwards',
        'spin-slow': 'spin 3s linear infinite',
        'bounce-slow': 'bounce 2s ease-in-out infinite',
        'pulse-reading': 'pulseReading 2s infinite',
      },
      keyframes: {
        'fade-in-up': {
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        pulseReading: {
          '0%': { opacity: '1' },
          '50%': { opacity: '0.6' },
          '100%': { opacity: '1' },
        },
      },

      // Animation timing functions
      transitionTimingFunction: {
        'elegant-entrance': 'cubic-bezier(0.19, 1, 0.22, 1)',
        'standard-exit': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'content-entrance': 'cubic-bezier(0.215, 0.61, 0.355, 1)',
      },

      // Custom width utilities for responsive layouts
      width: {
        fit: 'fit-content',
        readable: 'clamp(45ch, 60%, 75ch)', // Optimal reading width
        prose: 'min(65ch, 100%)',
      },

      // Aspect ratio utilities
      aspectRatio: {
        portrait: '2/3',
        landscape: '16/9',
        ultrawide: '21/9',
        square: '1/1',
        golden: '1.618/1', // Golden ratio
      },

      // Custom height utilities
      height: {
        'screen-small': '100svh', // Small viewport height (mobile-friendly)
        'screen-large': '100lvh', // Large viewport height
        'screen-dynamic': '100dvh', // Dynamic viewport height
      },

      // Z-index scale with semantic naming
      zIndex: {
        behind: '-1',
        base: '0',
        elevated: '1',
        dropdown: '10',
        sticky: '20',
        fixed: '30',
        modal: '40',
        popover: '50',
        tooltip: '60',
        toast: '70',
        overlay: '80',
        spinner: '90',
        top: '100',
      },
    },
  },
  // Define custom screen breakpoints
  screens: {
    xs: '480px', // Extra small devices (phones)
    ...defaultTheme.screens,
    '2xl': '1536px', // Override for consistency
    '3xl': '1920px', // Extra large monitors/displays
  },

  // Add responsive variants
  variants: {
    extend: {
      // Extend variants as needed
      display: ['responsive', 'group-hover', 'hover', 'focus', 'dark'],
      opacity: ['responsive', 'group-hover', 'hover', 'focus', 'dark'],
      scale: ['responsive', 'hover', 'focus', 'active'],
      textColor: ['responsive', 'hover', 'focus', 'dark'],
      backgroundColor: ['responsive', 'hover', 'focus', 'dark'],
    },
  },

  // Register plugins
  plugins: [containerQueries],
} satisfies Config;
