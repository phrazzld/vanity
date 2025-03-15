'use client'

/**
 * @file ReadingCard component displays an individual book or reading in a card format
 * @module components/readings/ReadingCard
 */

import Image from 'next/image'
import { useState, useEffect } from 'react'
import type { ReadingListItem } from '@/types'
import { getSeededPlaceholderStyles } from './placeholderUtils'

/**
 * Props for the ReadingCard component
 * Omits the author field from ReadingListItem as it's not displayed in the card
 * @typedef {Omit<ReadingListItem, 'author'>} ReadingCardProps
 */
type ReadingCardProps = Omit<ReadingListItem, 'author'>

/**
 * Formats a date to a human-readable format (e.g., "Jan 2023")
 * @param date The date to format
 */
function formatDate(date: Date | null): string {
  if (!date) return '';
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric'
  });
}

/**
 * ReadingCard component that displays a book cover with hover animations
 * If no cover image is provided, a colored placeholder is generated based on the slug
 * Visual cues are applied to show reading status (finished, in progress, or paused)
 *
 * @param {ReadingCardProps} props - Component properties
 * @param {string} props.slug - Unique URL-friendly identifier for the reading
 * @param {string} props.title - Title of the book or reading
 * @param {string|null} props.coverImageSrc - URL to cover image, or null if not available
 * @param {boolean} props.dropped - Whether the reading was paused before completion
 * @param {Date|null} props.finishedDate - When the reading was completed, or null if in progress
 * @returns {JSX.Element} A card with book cover and visual status indicators
 */
export default function ReadingCard({ 
  slug, 
  title,
  coverImageSrc, 
  dropped, 
  finishedDate 
}: ReadingCardProps) {
  // Generate a consistent placeholder background if no cover image is available
  const placeholderStyles = !coverImageSrc ? getSeededPlaceholderStyles(slug) : {}
  
  // State for hover effects
  const [isHovered, setIsHovered] = useState(false)
  
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
        // card container
        display: 'block',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '6px',
        transition: 'all 0.3s ease',
        aspectRatio: '2 / 3', // lock the shape
        boxShadow: isHovered 
          ? '0 4px 12px rgba(0,0,0,0.12)' 
          : '0 1px 3px rgba(0,0,0,0.08)',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        cursor: 'default',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={title} // Show title on hover
    >
      {/* Left edge indicator */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          backgroundColor: statusColor,
          zIndex: 3,
          transition: 'width 0.3s ease',
          width: isHovered ? '6px' : '4px'
        }} 
      />
      
      {/* Cover image or placeholder */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          ...placeholderStyles,
        }}
      >
        {coverImageSrc && (
          <Image
            src={`${process.env.NEXT_PUBLIC_SPACES_BASE_URL}${coverImageSrc}`}
            alt={`${title} cover`}
            fill={true}
            style={{
              objectFit: 'cover',
              filter: isPaused 
                ? 'grayscale(50%) brightness(0.95)' 
                : isFinished 
                  ? 'brightness(1.03)' 
                  : 'none',
              transition: 'all 0.3s ease',
            }}
          />
        )}
      </div>
      
      {/* Status badge in corner */}
      <div
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          borderRadius: '3px',
          overflow: 'hidden',
          zIndex: 3,
          transition: 'all 0.3s ease',
          opacity: isHovered ? 0.95 : 0.85,
          transform: isHovered ? 'scale(1.03)' : 'scale(1)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          backdropFilter: 'blur(4px)',
        }}
      >
        <div
          style={{
            backgroundColor: isHovered 
              ? statusColor 
              : `${statusColor}99`, // Add transparency when not hovered
            color: 'white',
            fontSize: '10px',
            fontWeight: 500,
            padding: '4px 8px',
            letterSpacing: '0.02em',
            transition: 'all 0.3s ease',
          }}
        >
          {statusText}
        </div>
      </div>
      
      {/* Overlay that shows additional details on hover */}
      {isHovered && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '8px',
            background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 80%, transparent 100%)',
            color: 'white',
            fontSize: '10px',
            lineHeight: 1.4,
            opacity: 0.9,
            zIndex: 2,
            transition: 'all 0.3s ease',
            transform: 'translateY(0)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: '2px' }}>{title}</div>
          {isFinished && (
            <div style={{ opacity: 0.8 }}>
              Completed {formattedFinishDate}
            </div>
          )}
          {isCurrentlyReading && (
            <div style={{ opacity: 0.8 }}>
              Currently reading
            </div>
          )}
          {isPaused && (
            <div style={{ opacity: 0.8 }}>
              Reading paused
            </div>
          )}
        </div>
      )}
    </div>
  )
}