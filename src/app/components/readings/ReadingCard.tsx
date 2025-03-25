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
  
  // Status colors
  const colors = {
    current: '#3b82f6', // blue
    finished: '#10b981', // green
    paused: '#6b7280'    // gray
  }
  
  // Status badge text
  const statusText = isCurrentlyReading 
    ? 'Reading' 
    : isFinished 
      ? formattedFinishDate 
      : 'Paused'
      
  // Status color
  const statusColor = isCurrentlyReading 
    ? colors.current 
    : isFinished 
      ? colors.finished 
      : colors.paused

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
          ? 'transform 0.6s cubic-bezier(0.19, 1, 0.22, 1), box-shadow 0.6s cubic-bezier(0.19, 1, 0.22, 1)'
          : 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
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
                ? 'transform 0.7s cubic-bezier(0.19, 1, 0.22, 1), filter 0.5s ease'
                : 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1), filter 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: isHovered ? 'scale(1.05)' : 'scale(1)', // Slightly more pronounced zoom
              willChange: 'transform', // Performance hint
            }}
          />
        )}
      </div>
      
      {/* Ribbon that unfurls across the bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: isHovered ? '100%' : '0', // Unfurl/refurl horizontally (0 without units to ensure complete collapse)
          height: isHovered ? 'auto' : '0', // Complete collapse when not hovered
          minHeight: isHovered ? '90px' : '0', // Remove all height when not hovered
          maxHeight: isHovered ? '150px' : '0', // Increased maximum height for very long content
          backgroundColor: statusColor, // Use the status color
          color: 'white',
          overflow: 'hidden',
          // Perfectly symmetrical animation in both directions
          transition: isHovered
            // Enter: First expand width, then height
            ? 'width 0.65s cubic-bezier(0.19, 1, 0.22, 1), min-height 0.5s cubic-bezier(0.215, 0.61, 0.355, 1) 0.3s, max-height 0.5s cubic-bezier(0.215, 0.61, 0.355, 1) 0.3s'
            // Exit: First collapse height, then width
            : 'min-height 0.5s cubic-bezier(0.215, 0.61, 0.355, 1), max-height 0.5s cubic-bezier(0.215, 0.61, 0.355, 1), width 0.65s cubic-bezier(0.19, 1, 0.22, 1) 0.3s', 
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: isHovered ? '14px 16px' : '0', // No padding when collapsed
          opacity: isHovered ? 1 : 0, // Completely transparent when not hovered
          // Create a cleaner edge with a subtle shadow
          boxShadow: isHovered 
            ? '0 -4px 10px -4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)' 
            : 'none',
          transformOrigin: 'bottom left',
        }}
        data-testid="ribbon-container"
      >
        {/* Layered semi-transparent overlay for depth */}
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0) 100%)',
            opacity: isHovered ? 1 : 0,
            transition: isHovered
              // Enter: Fade in with the ribbon expansion
              ? 'opacity 0.3s ease 0.3s'
              // Exit: Fade out before the ribbon collapses
              : 'opacity 0.2s ease',
            pointerEvents: 'none', // Ensure it doesn't interfere with interactions
          }}
        />
      
        {/* Ribbon content container */}
        <div
          style={{
            // Content must disappear before the ribbon collapses
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? 'translateY(0)' : 'translateY(5px)',
            // Synchronized transitions
            transition: isHovered
              // Enter: Content fades in after ribbon appears
              ? 'opacity 0.4s ease 0.5s, transform 0.4s cubic-bezier(0.215, 0.61, 0.355, 1) 0.5s'
              // Exit: Content fades out quickly before ribbon collapses 
              : 'opacity 0.25s ease, transform 0.25s cubic-bezier(0.215, 0.61, 0.355, 1)',
            // Full height container
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative', // For positioning elements
            zIndex: 2, // Above the gradient overlay
          }}
        >
          {/* Book metadata section (title and author) */}
          <div style={{ marginBottom: '10px' }}>
            {/* Book title - can now span multiple lines as needed */}
            <div 
              style={{ 
                fontWeight: 700,
                fontSize: '12.5px',
                lineHeight: 1.3,
                marginBottom: '6px',
                letterSpacing: '0.02em',
                color: 'rgba(255,255,255,1)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                // Allow up to 4 lines with ellipsis for extra-long titles
                display: '-webkit-box',
                WebkitLineClamp: 4,
                WebkitBoxOrient: 'vertical',
                // For non-webkit browsers
                maxHeight: '65px', // 4 lines x 12.5px font x 1.3 line height
                textShadow: '0 1px 1px rgba(0,0,0,0.5)',
                // Symmetrical entrance and exit animations
                transform: isHovered ? 'translateY(0)' : 'translateY(-5px)',
                transition: isHovered
                  // Enter: Fade in after ribbon expands
                  ? 'transform 0.5s cubic-bezier(0.215, 0.61, 0.355, 1) 0.5s, opacity 0.4s ease 0.5s'
                  // Exit: Fade out quickly first (title leads the exit)
                  : 'transform 0.25s cubic-bezier(0.215, 0.61, 0.355, 1), opacity 0.25s ease',
              }}
              data-testid="book-title"
            >
              {title}
            </div>
            
            {/* Author name with better handling for long names */}
            <div 
              style={{ 
                fontSize: '11px',
                fontWeight: 500,
                fontStyle: 'italic',
                lineHeight: 1.2,
                overflow: 'hidden',
                // Allow for wrapping of very long author names
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                maxHeight: '27px', // 2 lines of text
                marginTop: '2px', // Add space between title and author
                opacity: 0.85,
                color: 'rgba(255,255,255,0.92)',
                paddingBottom: '2px',
                // Subtle bottom border for separation
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                marginBottom: '4px', // Add space after author
                // Symmetrical entrance and exit animations
                transform: isHovered ? 'translateY(0)' : 'translateY(5px)', 
                transition: isHovered
                  // Enter: Fade in slightly after title
                  ? 'transform 0.5s cubic-bezier(0.215, 0.61, 0.355, 1) 0.6s, opacity 0.4s ease 0.6s'
                  // Exit: Fade out after title (sequence matters)
                  : 'transform 0.25s cubic-bezier(0.215, 0.61, 0.355, 1) 0.05s, opacity 0.25s ease 0.05s',
              }}
              data-testid="book-author"
            >
              {author}
            </div>
          </div>
          
          {/* Status badge - now a standalone element at the bottom */}
          <div 
            style={{
              // Reset to prevent inheritance issues
              display: 'inline-flex',
              alignItems: 'center',
              alignSelf: 'flex-start',
              // Clean badge styling
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(4px)',
              borderRadius: '12px',
              padding: '4px 9px 4px 7px', // Slightly larger for better readability
              marginTop: '2px', // Ensure spacing from author text
              gap: '4px',
              // Symmetrical entrance and exit animations
              transform: isHovered ? 'translateY(0)' : 'translateY(8px)',
              opacity: isHovered ? 1 : 0,
              transition: isHovered
                // Enter: Fade in last 
                ? 'transform 0.5s cubic-bezier(0.215, 0.61, 0.355, 1) 0.7s, opacity 0.4s ease 0.7s'
                // Exit: Fade out last (badge exits last, just like it entered last)
                : 'transform 0.25s cubic-bezier(0.215, 0.61, 0.355, 1) 0.1s, opacity 0.25s ease 0.1s',
              // Clean shadow
              boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.15)',
              // Make sure it can handle long status text
              maxWidth: '100%',
            }}
            data-testid="status-text"
          >
            {/* Status icon with gentler animation */}
            <span 
              style={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                // Symmetrical scale animation
                transform: isHovered ? 'scale(1.05)' : 'scale(0.9)',
                transition: isHovered
                  // Enter: Scale up last with slight delay
                  ? 'transform 0.4s cubic-bezier(0.215, 0.61, 0.355, 1) 0.8s'
                  // Exit: Scale back quickly with badge
                  : 'transform 0.25s cubic-bezier(0.215, 0.61, 0.355, 1) 0.1s',
                marginRight: '4px', // More space between icon and text
                position: 'relative',
                top: '-1px', // Slight visual adjustment for better alignment
              }}
              data-testid="status-icon"
            >
              {isCurrentlyReading && <ReadingIcon color="rgba(255,255,255,0.95)" />}
              {isFinished && <FinishedIcon color="rgba(255,255,255,0.95)" />}
              {isPaused && <PausedIcon color="rgba(255,255,255,0.95)" />}
            </span>
            
            {/* Status text with better sizing */}
            <span style={{ 
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.02em',
              whiteSpace: 'nowrap',
              // Ensure text is visible even if long
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '180px', // Cap the width to prevent extreme stretching
              color: 'rgba(255,255,255,0.95)'
            }}>
              {isFinished && `Finished ${formattedFinishDate}`}
              {isCurrentlyReading && 'Currently reading'}
              {isPaused && 'Reading paused'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}