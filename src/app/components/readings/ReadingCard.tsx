'use client'

/**
 * @file ReadingCard component displays an individual book or reading in a card format
 * @module components/readings/ReadingCard
 * 
 * The ReadingCard component renders a book cover with a slide-up animation on hover,
 * revealing additional information about the reading status.
 * 
 * Features:
 * - Responsive design that works on all device sizes
 * - Dark mode support via ThemeContext
 * - Smooth animations with covers that slide up on hover
 * - Status indicators with appropriate icons
 * - Fallback styles for missing cover images
 * - Touch device support
 * - Accessibility enhancements
 */

import Image from 'next/image'
import { useState, useEffect } from 'react'
import type { ReadingListItem } from '@/types'
import { getSeededPlaceholderStyles } from './placeholderUtils'
import { useTheme } from '@/app/context/ThemeContext'

/**
 * Animation timing constants for consistent, reusable animations across the component
 */
const ANIMATION_TIMING = {
  // Dramatic, elegant timing for hover/enter states with a pronounced overshoot
  ELEGANT_ENTRANCE: 'cubic-bezier(0.19, 1, 0.22, 1)',
  
  // Standard material design timing for exits/non-hover states
  STANDARD_EXIT: 'cubic-bezier(0.4, 0, 0.2, 1)',
  
  // Refined timing for content elements with subtle acceleration and deceleration
  CONTENT_ENTRANCE: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
  
  // Simple ease timing for basic transitions
  SIMPLE: 'ease'
}

/**
 * Icon component for a book that is currently being read
 * Renders an open book SVG icon
 * 
 * @param {Object} props - Component properties
 * @param {string} [props.color='#3b82f6'] - Color for the icon (default: blue)
 * @returns {JSX.Element} SVG icon of an open book
 */
const ReadingIcon = ({ color = '#3b82f6' }: { color?: string }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
  </svg>
);

/**
 * Icon component for a finished book
 * Renders a checkmark in a circle SVG icon
 * 
 * @param {Object} props - Component properties
 * @param {string} [props.color='#10b981'] - Color for the icon (default: green)
 * @returns {JSX.Element} SVG icon of a checkmark in a circle
 */
const FinishedIcon = ({ color = '#10b981' }: { color?: string }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

/**
 * Icon component for a book that was paused/dropped
 * Renders a pause symbol SVG icon (two vertical bars)
 * 
 * @param {Object} props - Component properties
 * @param {string} [props.color='#6b7280'] - Color for the icon (default: gray)
 * @returns {JSX.Element} SVG icon of a pause symbol
 */
const PausedIcon = ({ color = '#6b7280' }: { color?: string }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="6" y="4" width="4" height="16"></rect>
    <rect x="14" y="4" width="4" height="16"></rect>
  </svg>
);

/**
 * Props for the ReadingCard component
 * Uses ReadingListItem which includes title, author, status info, and cover image
 * @typedef {ReadingListItem} ReadingCardProps
 */
type ReadingCardProps = ReadingListItem

/**
 * Formats a date to a human-readable format (e.g., "Jan 2023")
 * @param date The date to format, can be a Date object, ISO string, or null
 */
function formatDate(date: Date | string | null): string {
  if (!date) return '';
  
  // BUG FIX: When using API data from raw SQL queries, 
  // dates are returned as strings and not automatically converted to Date objects.
  // We need to handle both Date objects and date strings.
  
  // Convert string date to Date object if needed
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Converts a hex color to RGB components string
 * @param hex Hex color string (e.g. "#ff0000" or "#f00")
 * @returns RGB components as string (e.g. "255, 0, 0")
 */
function hexToRgb(hex: string): string {
  // Remove the # if present
  const cleanHex = hex.replace('#', '');
  
  // Convert shorthand (3 chars) to full form (6 chars)
  const fullHex = cleanHex.length === 3 
    ? cleanHex.split('').map(c => c + c).join('')
    : cleanHex;
    
  // Parse the hex values
  const r = parseInt(fullHex.substring(0, 2), 16);
  const g = parseInt(fullHex.substring(2, 4), 16);
  const b = parseInt(fullHex.substring(4, 6), 16);
  
  // Return as RGB string
  return `${r}, ${g}, ${b}`;
}

/**
 * ReadingCard component that displays a book cover with ribbon unfurl animation on hover
 * The component uses a modern card design with smooth transitions and status-colored ribbon
 * 
 * Key features:
 * - Ribbon unfurls across the bottom of the cover on hover
 * - Status-specific coloring and icons (reading, finished, paused)
 * - Includes book title, author name, and status in the ribbon
 * - Responsive design that works on all screen sizes
 * - Dark mode support via ThemeContext
 * - Touch device detection and appropriate interactions
 * - Accessibility improvements with proper ARIA attributes
 * - Fallback colored placeholder for missing cover images
 *
 * @param {ReadingCardProps} props - Component properties
 * @param {string} props.slug - Unique URL-friendly identifier for the reading
 * @param {string} props.title - Title of the book or reading
 * @param {string} props.author - Author of the book or reading
 * @param {string|null} props.coverImageSrc - URL to cover image, or null if not available
 * @param {boolean} props.dropped - Whether the reading was paused before completion
 * @param {Date|null} props.finishedDate - When the reading was completed, or null if in progress
 * @returns {JSX.Element} A card with book cover and ribbon unfurl animation on hover
 */
export default function ReadingCard({ 
  slug, 
  title,
  author,
  coverImageSrc, 
  dropped, 
  finishedDate 
}: ReadingCardProps) {
  // Generate a consistent placeholder background if no cover image is available
  const placeholderStyles = !coverImageSrc ? getSeededPlaceholderStyles(slug) : {}
  
  // State for hover effects
  const [isHovered, setIsHovered] = useState(false)
  
  // State to detect if device is touch-capable
  // We'll use this to adjust behavior for touch devices
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  
  // Get current theme from context
  const { isDarkMode } = useTheme()
  
  // Check if device is touch-capable on first render
  // This helps us provide appropriate behavior for touch devices
  // where hover states aren't as useful
  useEffect(() => {
    // Only run on client-side
    if (typeof window !== 'undefined') {
      // Check if device has touch capabilities
      const hasTouchCapability = 
        'ontouchstart' in window || 
        navigator.maxTouchPoints > 0;
      
      setIsTouchDevice(hasTouchCapability);
    }
  }, []);
  
  // Determine reading status
  const isCurrentlyReading = finishedDate === null && !dropped
  const isFinished = finishedDate !== null && !dropped
  const isPaused = dropped
  
  // Format finish date for display
  const formattedFinishDate = formatDate(finishedDate)
  
  // Status colors - expanded with variations for gradients
  const colors = {
    current: {
      main: '#3b82f6',      // blue
      light: '#60a5fa',     // lighter blue for highlights
      dark: '#2563eb',      // darker blue for shadows
      lighter: '#93c5fd',   // very light blue for edge highlights
      darker: '#1d4ed8'     // very dark blue for deep shadows
    },
    finished: {
      main: '#10b981',      // green
      light: '#34d399',     // lighter green for highlights
      dark: '#059669',      // darker green for shadows
      lighter: '#6ee7b7',   // very light green for edge highlights
      darker: '#047857'     // very dark green for deep shadows
    },
    paused: {
      main: '#6b7280',      // gray
      light: '#9ca3af',     // lighter gray for highlights
      dark: '#4b5563',      // darker gray for shadows
      lighter: '#d1d5db',   // very light gray for edge highlights
      darker: '#374151'     // very dark gray for deep shadows
    }
  }
  
  // Status badge text
  const statusText = isCurrentlyReading 
    ? 'Reading' 
    : isFinished 
      ? formattedFinishDate 
      : 'Paused'
      
  // Status color object for the current status
  const statusColor = isCurrentlyReading 
    ? colors.current 
    : isFinished 
      ? colors.finished 
      : colors.paused
      
  // Main color for simple uses (string)
  const statusMainColor = statusColor.main

  return (
    <div
      key={slug}
      style={{
        // Main card container
        display: 'block',
        width: '100%',
        position: 'relative',
        // Smooth transitions in both directions
        transition: isHovered
          ? `transform 0.6s ${ANIMATION_TIMING.ELEGANT_ENTRANCE}, box-shadow 0.6s ${ANIMATION_TIMING.ELEGANT_ENTRANCE}`
          : `transform 0.7s ${ANIMATION_TIMING.STANDARD_EXIT}, box-shadow 0.7s ${ANIMATION_TIMING.STANDARD_EXIT}`,
        aspectRatio: '2 / 3', // Lock the shape
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: isDarkMode
          ? isHovered 
            ? '0 10px 20px -6px rgba(0,0,0,0.35), 0 3px 6px -3px rgba(0,0,0,0.25)' 
            : '0 1px 3px rgba(0,0,0,0.2), 0 1px 2px -1px rgba(0,0,0,0.15)'
          : isHovered 
            ? '0 10px 20px -6px rgba(0,0,0,0.15), 0 3px 6px -3px rgba(0,0,0,0.1)' 
            : '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px -1px rgba(0,0,0,0.03)',
        // More pronounced lift effect but with smoother animation
        transform: isHovered ? 'translateY(-4px) scale(1.01)' : 'translateY(0) scale(1)', 
        cursor: 'pointer',
        // Responsive adaptations
        minHeight: '240px', // Minimum height for very small screens
        maxHeight: '400px', // Maximum height on large screens
        willChange: 'transform, box-shadow', // Hint to browser for optimization
      }}
      onMouseEnter={() => !isTouchDevice && setIsHovered(true)}
      onMouseLeave={() => !isTouchDevice && setIsHovered(false)}
      onTouchStart={() => isTouchDevice && setIsHovered(true)}
      // Extended delay for touch devices to better appreciate the animation
      onTouchEnd={() => isTouchDevice && setTimeout(() => setIsHovered(false), 1500)}
      title={title}
      aria-label={`Book: ${title} by ${author}, Status: ${
        isCurrentlyReading ? 'Currently Reading' : 
        isFinished ? `Finished on ${formattedFinishDate}` : 
        'Reading Paused'
      }`} // Accessibility improvement
    >
      {/* Book cover image */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          backgroundColor: isDarkMode ? '#111' : '#f9f9f9',
          ...placeholderStyles,
        }}
      >
        {coverImageSrc && (
          <Image
            src={`${process.env.NEXT_PUBLIC_SPACES_BASE_URL}${coverImageSrc}`}
            alt={`${title} cover`}
            fill={true}
            sizes="(max-width: 480px) 33vw, (max-width: 768px) 25vw, (max-width: 1024px) 20vw, 200px"
            loading="lazy" // BUG FIX: Removed conflicting priority="false" prop. Next.js Image component cannot use both priority and loading props.
            style={{
              objectFit: 'cover',
              filter: isPaused 
                ? 'grayscale(50%) brightness(0.95)' 
                : isFinished 
                  ? 'brightness(1.03)' 
                  : 'none',
              // Subtle zoom with smoother animations in both directions
              transition: isHovered
                ? `transform 0.7s ${ANIMATION_TIMING.ELEGANT_ENTRANCE}, filter 0.5s ${ANIMATION_TIMING.SIMPLE}`
                : `transform 0.7s ${ANIMATION_TIMING.STANDARD_EXIT}, filter 0.6s ${ANIMATION_TIMING.STANDARD_EXIT}`,
              transform: isHovered ? 'scale(1.05)' : 'scale(1)', // Slightly more pronounced zoom
              willChange: 'transform', // Performance hint
            }}
          />
        )}
      </div>
      
      {/* Meta ribbon container - refined with transform-based animations */}
      <div
        className="ribbon-container"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%', // Always full width
          opacity: isHovered ? 1 : 0,
          visibility: isHovered ? 'visible' : 'hidden', // Hide when not hovered for accessibility
          // Transform-based animations create more elegant motion
          transform: isHovered 
            ? 'translateY(0) scale(1)' 
            : 'translateY(15px) scale(0.98)',
          transformOrigin: 'center bottom', // Scale from bottom center for a natural reveal
          // Refined animation timing with better sequencing
          transition: isHovered
            ? `transform 0.5s ${ANIMATION_TIMING.ELEGANT_ENTRANCE}, 
               opacity 0.45s ${ANIMATION_TIMING.ELEGANT_ENTRANCE}, 
               min-height 0.5s ${ANIMATION_TIMING.ELEGANT_ENTRANCE}, 
               max-height 0.5s ${ANIMATION_TIMING.ELEGANT_ENTRANCE}, 
               visibility 0s`
            : `transform 0.4s ${ANIMATION_TIMING.STANDARD_EXIT}, 
               opacity 0.35s ${ANIMATION_TIMING.STANDARD_EXIT}, 
               min-height 0.4s ${ANIMATION_TIMING.STANDARD_EXIT}, 
               max-height 0.4s ${ANIMATION_TIMING.STANDARD_EXIT}, 
               visibility 0s linear 0.4s`,
          borderRadius: '0 0 8px 8px', // Match card's border radius
          overflow: 'hidden',
          // Reserve space for ribbon even when not visible
          height: 'auto',
          minHeight: isHovered ? '100px' : '0',
          maxHeight: isHovered ? '160px' : '0',
          // Performance optimizations
          willChange: 'transform, opacity',
          // Add a subtle shadow to enhance depth perception during animation
          boxShadow: isHovered 
            ? '0 -10px 20px -10px rgba(0, 0, 0, 0.1)' 
            : 'none',
        }}
        data-testid="ribbon-container"
        aria-hidden={!isHovered}
      >
        {/* Glass morphism background layer */}
        <div
          className="ribbon-glass-bg"
          style={{
            position: 'absolute',
            inset: 0, // Cover entire container
            // Create a semi-transparent base that matches the status
            backgroundColor: `${statusMainColor}08`, // Very low opacity base (3%)
            // Glass effect with backdrop filter - blurs what's behind the element
            backdropFilter: 'blur(10px) saturate(160%)',
            WebkitBackdropFilter: 'blur(10px) saturate(160%)', // For Safari
            // Subtle border effect for depth
            borderTop: '1px solid rgba(255, 255, 255, 0.12)',
            // Complex shadow for depth - outer shadow and inner highlight
            boxShadow: 'rgba(0, 0, 0, 0.15) 0px 10px 15px -3px, rgba(0, 0, 0, 0.1) 0px 4px 6px -4px, inset 0 0 0 1px rgba(255, 255, 255, 0.08)',
            // Add a subtle noise texture for realism
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
            backgroundBlendMode: 'overlay',
            // Animation additions
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? 'scale(1)' : 'scale(0.98)',
            transformOrigin: 'center bottom',
            transition: isHovered 
              ? `opacity 0.4s ${ANIMATION_TIMING.SIMPLE} 0.1s, transform 0.5s ${ANIMATION_TIMING.ELEGANT_ENTRANCE} 0.05s` 
              : `opacity 0.3s ${ANIMATION_TIMING.SIMPLE}, transform 0.35s ${ANIMATION_TIMING.STANDARD_EXIT}`,
            zIndex: 1,
            willChange: 'opacity, transform',
          }}
        />
        
        {/* Gradient background layer - primary color layer */}
        <div
          className="ribbon-gradient-bg"
          style={{
            position: 'absolute',
            inset: 0, // Cover entire container
            // Rich, sophisticated multi-color gradients using our expanded color palette
            background: `linear-gradient(135deg, 
              rgba(${hexToRgb(statusColor.light)}, 0.75) 0%, 
              rgba(${hexToRgb(statusColor.main)}, 0.82) 50%, 
              rgba(${hexToRgb(statusColor.dark)}, 0.88) 100%)`,
            // Animation additions
            opacity: isHovered ? 0.92 : 0,
            transform: isHovered ? 'scale(1) translateY(0)' : 'scale(0.97) translateY(5px)',
            transformOrigin: 'center bottom',
            transition: isHovered 
              ? `opacity 0.4s ${ANIMATION_TIMING.SIMPLE} 0.05s, transform 0.55s ${ANIMATION_TIMING.ELEGANT_ENTRANCE}` 
              : `opacity 0.3s ${ANIMATION_TIMING.SIMPLE}, transform 0.4s ${ANIMATION_TIMING.STANDARD_EXIT}`,
            zIndex: 2,
            willChange: 'opacity, transform',
          }}
        />
        
        {/* Accent gradient layer - adds depth with diagonal highlights */}
        <div
          className="ribbon-accent-gradient"
          style={{
            position: 'absolute',
            inset: 0,
            // Diagonal highlight that adds dimensionality
            background: `linear-gradient(145deg, 
              rgba(${hexToRgb(statusColor.lighter)}, 0.15) 0%, 
              rgba(${hexToRgb(statusColor.lighter)}, 0.05) 25%, 
              rgba(${hexToRgb(statusColor.darker)}, 0.05) 75%, 
              rgba(${hexToRgb(statusColor.darker)}, 0.10) 100%)`,
            // Add subtle texture gradient for more dimension
            backgroundImage: `
              radial-gradient(circle at 15% 15%, rgba(${hexToRgb(statusColor.lighter)}, 0.18) 0%, transparent 35%),
              radial-gradient(circle at 85% 75%, rgba(${hexToRgb(statusColor.darker)}, 0.12) 0%, transparent 50%)
            `,
            backgroundBlendMode: 'overlay',
            // Animation additions 
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? 'scale(1) translateY(0)' : 'scale(0.96) translateY(8px)',
            transformOrigin: 'center bottom',
            transition: isHovered 
              ? `opacity 0.5s ${ANIMATION_TIMING.SIMPLE} 0.1s, transform 0.6s ${ANIMATION_TIMING.ELEGANT_ENTRANCE} 0.05s` 
              : `opacity 0.3s ${ANIMATION_TIMING.SIMPLE}, transform 0.45s ${ANIMATION_TIMING.STANDARD_EXIT}`,
            zIndex: 3,
            willChange: 'opacity, transform',
          }}
        />
        
        {/* Top edge highlight - creates a glossy edge effect with status-specific color */}
        <div
          className="ribbon-edge-highlight"
          style={{
            position: 'absolute',
            top: 0,
            left: '5%',
            right: '5%',
            height: '1px',
            // Subtle color-specific highlight that reinforces the status color
            background: `linear-gradient(90deg, 
              rgba(255, 255, 255, 0) 0%, 
              rgba(${hexToRgb(statusColor.lighter)}, 0.2) 20%, 
              rgba(255, 255, 255, 0.18) 50%, 
              rgba(${hexToRgb(statusColor.lighter)}, 0.2) 80%, 
              rgba(255, 255, 255, 0) 100%)`,
            // Enhanced animation
            opacity: isHovered ? 0.85 : 0,
            // Combine horizontal and vertical motion for more refined animation
            transform: isHovered 
              ? 'scaleX(1) translateY(0)' 
              : 'scaleX(0.92) translateY(-3px)', // Slight upward motion when hidden
            transformOrigin: 'center top',
            transition: isHovered
              ? `opacity 0.4s ${ANIMATION_TIMING.SIMPLE} 0.25s, transform 0.5s ${ANIMATION_TIMING.ELEGANT_ENTRANCE} 0.2s`
              : `opacity 0.3s ${ANIMATION_TIMING.SIMPLE}, transform 0.4s ${ANIMATION_TIMING.STANDARD_EXIT}`,
            zIndex: 4,
            willChange: 'opacity, transform',
          }}
        />
        
        {/* Bottom edge shadow - adds depth with status-specific darker color */}
        <div
          className="ribbon-edge-shadow"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '4px',
            // Use status darker color for the shadow to create cohesive design
            background: `linear-gradient(to bottom, 
              rgba(0, 0, 0, 0) 0%, 
              rgba(${hexToRgb(statusColor.darker)}, 0.15) 100%)`,
            // Enhanced animation
            opacity: isHovered ? 0.7 : 0,
            transform: isHovered 
              ? 'scaleY(1)' 
              : 'scaleY(0.5)', // Subtle scale effect on the shadow
            transformOrigin: 'center bottom',
            transition: isHovered
              ? `opacity 0.4s ${ANIMATION_TIMING.SIMPLE} 0.15s, transform 0.5s ${ANIMATION_TIMING.ELEGANT_ENTRANCE} 0.1s`
              : `opacity 0.3s ${ANIMATION_TIMING.SIMPLE}, transform 0.4s ${ANIMATION_TIMING.STANDARD_EXIT}`,
            zIndex: 4,
            borderRadius: '0 0 8px 8px', // Match container's bottom corners
            willChange: 'opacity, transform',
          }}
        />
        
        {/* Layered semi-transparent overlay for depth */}
        <div 
          className="ribbon-overlay"
          style={{
            position: 'absolute',
            inset: 0,
            // Create a subtle gradient overlay that enhances depth perception
            background: `linear-gradient(to bottom, 
              rgba(${hexToRgb(statusColor.darker)}, 0.08) 0%, 
              rgba(0, 0, 0, 0.03) 40%, 
              rgba(0, 0, 0, 0) 100%)`,
            // Enhanced animation
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? 'translateY(0)' : 'translateY(5px)', 
            transition: isHovered
              ? `opacity 0.4s ${ANIMATION_TIMING.SIMPLE} 0.15s, transform 0.45s ${ANIMATION_TIMING.ELEGANT_ENTRANCE} 0.1s`
              : `opacity 0.3s ${ANIMATION_TIMING.SIMPLE}, transform 0.4s ${ANIMATION_TIMING.STANDARD_EXIT}`,
            pointerEvents: 'none',
            zIndex: 5,
            borderRadius: '0 0 8px 8px', // Match container's border radius
            willChange: 'opacity, transform',
          }}
        />
        
        {/* Status-specific light reflections - subtle shine effect with color tint */}
        <div 
          className="ribbon-reflections"
          style={{
            position: 'absolute',
            inset: 0,
            // Create two reflection points with subtle color tint
            background: `
              radial-gradient(circle at 15% 15%, rgba(${hexToRgb(statusColor.lighter)}, 0.15) 0%, transparent 30%),
              radial-gradient(circle at 85% 25%, rgba(255, 255, 255, 0.08) 0%, transparent 40%)
            `,
            // Add a subtle horizontal sweep effect
            backgroundImage: `
              linear-gradient(90deg, 
                rgba(${hexToRgb(statusColor.lighter)}, 0) 0%,
                rgba(${hexToRgb(statusColor.lighter)}, 0.03) 20%, 
                rgba(255, 255, 255, 0.05) 50%,
                rgba(${hexToRgb(statusColor.lighter)}, 0.03) 80%,
                rgba(${hexToRgb(statusColor.lighter)}, 0) 100%)
            `,
            backgroundBlendMode: 'overlay',
            // Enhanced animation
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? 'scale(1) translateY(0)' : 'scale(0.98) translateY(10px)', 
            transformOrigin: 'center bottom',
            transition: isHovered
              ? `opacity 0.5s ${ANIMATION_TIMING.SIMPLE} 0.2s, transform 0.65s ${ANIMATION_TIMING.ELEGANT_ENTRANCE} 0.15s`
              : `opacity 0.3s ${ANIMATION_TIMING.SIMPLE}, transform 0.45s ${ANIMATION_TIMING.STANDARD_EXIT}`,
            pointerEvents: 'none',
            zIndex: 6,
            borderRadius: '0 0 8px 8px', // Match container's border radius
            willChange: 'opacity, transform',
          }}
        />
      
        {/* Fallback for browsers without backdrop-filter support */}
        <div
          className="ribbon-fallback"
          style={{
            position: 'absolute',
            inset: 0,
            // Rich gradient for browsers without backdrop-filter support
            background: `linear-gradient(135deg, 
              rgba(${hexToRgb(statusColor.light)}, 0.92) 0%, 
              rgba(${hexToRgb(statusColor.main)}, 0.95) 50%, 
              rgba(${hexToRgb(statusColor.dark)}, 0.97) 100%)`,
            // Add a subtle texture overlay for interest
            backgroundImage: `
              linear-gradient(135deg, 
                rgba(${hexToRgb(statusColor.lighter)}, 0.07) 0%, 
                rgba(${hexToRgb(statusColor.main)}, 0.02) 50%, 
                rgba(${hexToRgb(statusColor.darker)}, 0.07) 100%)
            `,
            // Enhanced animation
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(12px)',
            transformOrigin: 'center bottom',
            // Note: This fallback will show in browsers that don't support backdrop-filter
            // In browsers with backdrop-filter support, the glass effect will take precedence visually
            transition: isHovered
              ? `opacity 0.4s ${ANIMATION_TIMING.SIMPLE} 0.05s, transform 0.55s ${ANIMATION_TIMING.ELEGANT_ENTRANCE}`
              : `opacity 0.3s ${ANIMATION_TIMING.SIMPLE}, transform 0.4s ${ANIMATION_TIMING.STANDARD_EXIT}`,
            zIndex: 8,
            // Extra depth and polish for the fallback
            boxShadow: `inset 0 1px 0 rgba(255, 255, 255, 0.15), 
              inset 0 -1px 0 rgba(${hexToRgb(statusColor.darker)}, 0.1)`,
            borderRadius: '0 0 8px 8px',
            willChange: 'opacity, transform',
          }}
        />

        {/* Ribbon content container - position-based layout with refined staggered animation */}
        <div
          className="ribbon-content"
          style={{
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? 'translateY(0)' : 'translateY(5px)',
            transition: isHovered
              ? `opacity 0.4s ${ANIMATION_TIMING.SIMPLE} 0.2s, transform 0.4s ${ANIMATION_TIMING.CONTENT_ENTRANCE} 0.2s`
              : `opacity 0.25s ${ANIMATION_TIMING.SIMPLE}, transform 0.25s ${ANIMATION_TIMING.CONTENT_ENTRANCE}`,
            width: '100%',
            // Use position relative for containing absolutely positioned elements
            position: 'relative',
            zIndex: 10, // Highest z-index to ensure content is always on top
            // Set a minimum height to guarantee space for all elements
            minHeight: '120px', 
            // Refined padding with more space at top and extra space at bottom to ensure room for status
            padding: '18px 20px 48px', // Extra bottom padding reserves space for status badge
            // Remove any default margins
            margin: 0,
            boxSizing: 'border-box',
            // Hide overflow to prevent content from spilling out
            overflow: 'hidden',
          }}
        >
          {/* Book metadata section (title and author) - height-constrained layout */}
          <div 
            className="book-metadata" 
            style={{ 
              marginBottom: '14px', // Vertical spacing
              display: 'flex',
              flexDirection: 'column',
              width: '100%', // Ensure full width
              // Remove flexGrow to prevent excessive expansion
              // Set maximum height with overflow handling
              maxHeight: '85px', // Constrain height to prevent pushing the status off-screen
              overflow: 'hidden', // Hide overflow content
            }}
          >
            {/* Book title with refined typography and spacing */}
            <div 
              className="book-title"
              style={{ 
                fontWeight: 600,
                fontSize: '13px',
                lineHeight: 1.4,
                marginBottom: '8px', // Spacing after title
                letterSpacing: '-0.01em',
                color: 'rgba(255,255,255,0.95)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                // Limit to 3 lines to ensure space for author + status
                WebkitLineClamp: 3, 
                WebkitBoxOrient: 'vertical',
                // Reduced max height to ensure enough space
                maxHeight: '54.6px', // 3 lines x 13px font x 1.4 line height
                textShadow: '0 1px 2px rgba(0,0,0,0.15)',
                transform: isHovered ? 'translateY(0) scale(1)' : 'translateY(-5px) scale(0.98)',
                opacity: isHovered ? 1 : 0, // Make explicit for animation
                transformOrigin: 'left center', // Scale from left for text elements
                transition: isHovered
                  ? `transform 0.45s ${ANIMATION_TIMING.CONTENT_ENTRANCE} 0.25s, opacity 0.4s ${ANIMATION_TIMING.SIMPLE} 0.25s`
                  : `transform 0.25s ${ANIMATION_TIMING.CONTENT_ENTRANCE}, opacity 0.2s ${ANIMATION_TIMING.SIMPLE}`,
                width: '100%', // Full width utilization
              }}
              data-testid="book-title"
            >
              {title}
            </div>
            
            {/* Author name with refined typography and spacing */}
            <div 
              className="book-author"
              style={{ 
                fontSize: '11.5px',
                fontWeight: 500,
                fontStyle: 'normal',
                lineHeight: 1.3, // Good readability
                overflow: 'hidden',
                display: '-webkit-box',
                // Limit to 1 line to ensure consistent spacing
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                // Fixed height based on one line
                maxHeight: '15px', // 1 line x 11.5px font x 1.3 line height
                marginTop: '2px',
                color: 'rgba(255,255,255,0.78)',
                letterSpacing: '0.01em',
                paddingBottom: '4px', // Reduced to save space
                // Remove bottom border to save space
                transform: isHovered ? 'translateY(0) scale(1)' : 'translateY(5px) scale(0.98)', 
                opacity: isHovered ? 1 : 0, // Make explicit for animation
                transformOrigin: 'left center', // Scale from left for text elements
                transition: isHovered
                  ? `transform 0.45s ${ANIMATION_TIMING.CONTENT_ENTRANCE} 0.35s, opacity 0.4s ${ANIMATION_TIMING.SIMPLE} 0.35s, color 0.2s ${ANIMATION_TIMING.SIMPLE} 0.3s`
                  : `transform 0.25s ${ANIMATION_TIMING.CONTENT_ENTRANCE} 0.05s, opacity 0.2s ${ANIMATION_TIMING.SIMPLE}, color 0.2s ${ANIMATION_TIMING.SIMPLE}`,
                width: '100%', // Full width
              }}
              data-testid="book-author"
            >
              {author}
            </div>
          </div>
          
          {/* Divider line with gradient - improved spacing */}
          <div 
            className="ribbon-divider"
            style={{
              height: '1px',
              background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.05) 100%)',
              // Centered with more space above and below
              margin: '2px 8px 10px',
              width: 'calc(100% - 16px)', // Inset from edges for elegance
              alignSelf: 'center', // Center horizontally
              opacity: isHovered ? 1 : 0,
              transform: isHovered ? 'scaleX(0.96)' : 'scaleX(0.7)', // More pronounced scale effect
              transition: isHovered
                ? `opacity 0.4s ${ANIMATION_TIMING.SIMPLE} 0.4s, transform 0.5s ${ANIMATION_TIMING.ELEGANT_ENTRANCE} 0.4s`
                : `opacity 0.2s ${ANIMATION_TIMING.SIMPLE}, transform 0.3s ${ANIMATION_TIMING.STANDARD_EXIT}`,
              // Ensure consistent appearance
              padding: 0,
              border: 0,
            }}
          />
          
          {/* Status container - absolutely positioned at bottom to prevent overflow issues */}
          <div
            className="status-container"
            style={{
              display: 'flex',
              justifyContent: 'space-between', // Allows for future elements on the right
              alignItems: 'center',
              width: 'calc(100% - 40px)', // Full width minus the horizontal padding
              // Position at the bottom regardless of content
              position: 'absolute',
              bottom: '16px', // Match the bottom padding
              left: '20px', // Match the left padding
              right: '20px', // Match the right padding
              // Layout styles
              zIndex: 5, // Above content if needed
              height: '24px', // Fixed height
            }}
          >
            {/* Status badge with refined styling */}
            <div 
              className={`reading-status ${isCurrentlyReading ? 'currently-reading-status' : isFinished ? 'finished-status' : 'paused-status'}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                alignSelf: 'flex-start',
                background: 'rgba(255,255,255,0.12)',
                borderRadius: '4px',
                padding: '4px 10px', // Increased padding for better proportions
                marginTop: '2px',
                gap: '5px', // Slightly increased gap between icon and text
                transform: isHovered ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.96)',
                opacity: isHovered ? 1 : 0,
                transformOrigin: 'center center',
                transition: isHovered
                  ? `transform 0.5s ${ANIMATION_TIMING.CONTENT_ENTRANCE} 0.45s, opacity 0.45s ${ANIMATION_TIMING.SIMPLE} 0.45s`
                  : `transform 0.25s ${ANIMATION_TIMING.CONTENT_ENTRANCE}, opacity 0.2s ${ANIMATION_TIMING.SIMPLE}`,
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.08)',
                maxWidth: 'calc(100% - 4px)', // Prevent overflow
                height: '22px', // Fixed height for consistency
              }}
              data-testid="status-text"
              role="status"
            >
            {/* Status icon with improved positioning and animation */}
            <span 
              className="status-icon"
              style={{ 
                transform: isHovered ? 'scale(1.1) rotate(0deg)' : 'scale(0.85) rotate(-10deg)',
                opacity: isHovered ? 1 : 0,
                transition: isHovered
                  ? `transform 0.5s ${ANIMATION_TIMING.CONTENT_ENTRANCE} 0.55s, opacity 0.3s ${ANIMATION_TIMING.SIMPLE} 0.5s`
                  : `transform 0.3s ${ANIMATION_TIMING.CONTENT_ENTRANCE}, opacity 0.15s ${ANIMATION_TIMING.SIMPLE}`,
                marginRight: '5px', // Consistent with the gap
                position: 'relative',
                // Adjusted for perfect vertical alignment
                top: '0px',
                // Maintain size consistency
                width: '14px',
                height: '14px',
                // Center icon content
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              data-testid="status-icon"
            >
              {isCurrentlyReading && <ReadingIcon color="rgba(255,255,255,0.95)" />}
              {isFinished && <FinishedIcon color="rgba(255,255,255,0.95)" />}
              {isPaused && <PausedIcon color="rgba(255,255,255,0.95)" />}
            </span>
            
            {/* Status text with improved alignment and spacing */}
            <span 
              className="status-label"
              style={{ 
                fontSize: '10px',
                fontWeight: 600, // Slightly increased for better readability
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '180px',
                color: 'rgba(255,255,255,0.95)', // Slightly brighter for better contrast
                // Improve vertical alignment
                lineHeight: 1.2,
                // Prevent layout shifts
                height: '12px',
                display: 'flex',
                alignItems: 'center',
                // Add staggered animation
                opacity: isHovered ? 1 : 0,
                transform: isHovered ? 'translateX(0)' : 'translateX(-5px)',
                transition: isHovered
                  ? `opacity 0.35s ${ANIMATION_TIMING.SIMPLE} 0.6s, transform 0.45s ${ANIMATION_TIMING.CONTENT_ENTRANCE} 0.6s`
                  : `opacity 0.2s ${ANIMATION_TIMING.SIMPLE}, transform 0.3s ${ANIMATION_TIMING.CONTENT_ENTRANCE}`,
              }}
            >
              {isFinished && `Finished ${formattedFinishDate}`}
              {isCurrentlyReading && 'Currently reading'}
              {isPaused && 'Reading paused'}
            </span>
          </div>
          
          {/* Space for future right-aligned elements if needed */}
          <div className="reading-actions" style={{ opacity: 0 }}></div>
        </div>
        </div>
      </div>
    </div>
  )
}