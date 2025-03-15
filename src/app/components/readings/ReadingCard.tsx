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
 * Visual cues are applied to show reading status (finished, in progress, or dropped)
 *
 * @param {ReadingCardProps} props - Component properties
 * @param {string} props.slug - Unique URL-friendly identifier for the reading
 * @param {string} props.title - Title of the book or reading
 * @param {string|null} props.coverImageSrc - URL to cover image, or null if not available
 * @param {boolean} props.dropped - Whether the reading was abandoned before completion
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
  
  // State for pulsing animation (for currently reading books)
  const [pulseValue, setPulseValue] = useState(0)
  
  // Determine reading status
  const isCurrentlyReading = finishedDate === null && !dropped
  const isFinished = finishedDate !== null && !dropped
  const isDropped = dropped
  
  // Format finish date for display
  const formattedFinishDate = formatDate(finishedDate)
  
  // Pulsing effect for currently reading books
  useEffect(() => {
    if (!isCurrentlyReading) return;
    
    const interval = setInterval(() => {
      setPulseValue(prev => (prev + 0.01) % 1);
    }, 50);
    
    return () => clearInterval(interval);
  }, [isCurrentlyReading]);
  
  // Calculate the pulse animation value
  const pulseIntensity = isCurrentlyReading ? 
    Math.sin(pulseValue * Math.PI * 2) * 0.5 + 0.5 : 0;

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
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        aspectRatio: '2 / 3', // lock the shape
        boxShadow: isHovered 
          ? '0 4px 8px rgba(0,0,0,0.1)' 
          : isCurrentlyReading 
            ? `0 0 ${2 + pulseIntensity * 5}px rgba(59, 130, 246, ${0.2 + pulseIntensity * 0.2})` 
            : '0 1px 2px rgba(0,0,0,0.05)',
        transform: isHovered ? 'translateY(-2px) scale(1.02)' : 'translateY(0) scale(1)',
        cursor: 'default',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={title} // Show title on hover
    >
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
              filter: isDropped ? 'grayscale(100%)' : 'none',
              transition: 'filter 0.2s ease, opacity 0.2s ease',
            }}
          />
        )}
      </div>
      
      {/* Status indicators */}
      {isCurrentlyReading && (
        <div 
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            width: '15px',
            height: '24px',
            backgroundColor: 'rgba(59, 130, 246, 0.9)',
            borderRadius: '2px 0 0 2px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
            zIndex: 2,
          }}
        >
          {/* Bookmark icon */}
          <div 
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: 0,
              height: 0,
              borderLeft: '7.5px solid transparent',
              borderRight: '7.5px solid transparent',
              borderBottom: '7px solid white',
              zIndex: 3,
            }}
          />
        </div>
      )}
      
      {isFinished && (
        <div 
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '6px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            fontSize: '11px',
            fontWeight: 500,
            textAlign: 'center',
            zIndex: 2,
            backdropFilter: 'blur(2px)',
          }}
        >
          Finished {formattedFinishDate}
        </div>
      )}
      
      {isDropped && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: 0,
            backgroundColor: 'rgba(239, 68, 68, 0.9)',
            color: 'white',
            fontSize: '10px',
            fontWeight: 'bold',
            padding: '3px 8px',
            transform: 'rotate(0deg)',
            transformOrigin: 'top right',
            zIndex: 2,
            boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
            borderTopLeftRadius: '2px',
            borderBottomLeftRadius: '2px',
          }}
        >
          DROPPED
        </div>
      )}
    </div>
  )
}