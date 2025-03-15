'use client'

/**
 * @file ReadingCard component displays an individual book or reading in a card format
 * @module components/readings/ReadingCard
 */

import Image from 'next/image'
import { useState } from 'react'
import type { ReadingListItem } from '@/types'
import { getSeededPlaceholderStyles } from './placeholderUtils'

/**
 * Props for the ReadingCard component
 * Omits the author field from ReadingListItem as it's not displayed in the card
 * @typedef {Omit<ReadingListItem, 'author'>} ReadingCardProps
 */
type ReadingCardProps = Omit<ReadingListItem, 'author'>

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
        boxShadow: isHovered ? '0 4px 8px rgba(0,0,0,0.1)' : '0 1px 2px rgba(0,0,0,0.05)',
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
            fill
            style={{
              objectFit: 'cover',
              filter: dropped ? 'grayscale(100%)' : 'none',
              opacity: finishedDate === null ? 0.5 : 1,
              transition: 'filter 0.2s ease, opacity 0.2s ease', // smooth transition for hover effects
            }}
          />
        )}
      </div>
    </div>
  )
}