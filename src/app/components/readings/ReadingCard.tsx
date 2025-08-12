'use client';

/**
 * @file ReadingCard component displays an individual book or reading in a card format
 * @module components/readings/ReadingCard
 *
 * Minimalist design with clean hover states that reveal book information
 * without overwhelming visual effects.
 */

import Image from 'next/image';
import { useState } from 'react';
import type { ReadingListItem } from '@/types';
import { getSeededPlaceholderStyles } from './placeholderUtils';
import { useTheme } from '@/app/context/ThemeContext';
import { getFullImageUrl } from '@/lib/utils/readingUtils';
import { logger, createLogContext } from '@/lib/logger';

/**
 * Status color constants for reading states
 */
const STATUS_COLORS = {
  READING: '#3b82f6', // blue
  FINISHED: '#10b981', // green
  PAUSED: '#6b7280', // gray
} as const;

/**
 * Props for the ReadingCard component
 */
type ReadingCardProps = ReadingListItem;

/**
 * Formats a date to a human-readable format (e.g., "Jan 2023")
 */
function formatDate(date: Date | string | null): string {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Minimalist ReadingCard component with clean hover overlay
 *
 * Features:
 * - Simple fade-in overlay on hover
 * - Clean typography without excessive effects
 * - Status indicated by subtle color accents
 * - Performant with minimal animations
 * - Mobile-friendly with no complex hover states
 */
export default function ReadingCard({
  slug,
  title,
  author,
  coverImageSrc,
  dropped,
  finishedDate,
}: ReadingCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { isDarkMode } = useTheme();

  // Generate placeholder styles if no cover image
  const placeholderStyles = !coverImageSrc || imageError ? getSeededPlaceholderStyles(slug) : {};

  // Determine reading status
  const isCurrentlyReading = finishedDate === null && !dropped;
  const isFinished = finishedDate !== null && !dropped;

  // Simple status colors
  const statusColor = isCurrentlyReading
    ? STATUS_COLORS.READING
    : isFinished
      ? STATUS_COLORS.FINISHED
      : STATUS_COLORS.PAUSED;

  // Status text
  const statusText = isCurrentlyReading
    ? 'Currently Reading'
    : isFinished
      ? `Finished ${formatDate(finishedDate)}`
      : 'Paused';

  return (
    <div
      className="reading-card"
      style={{
        display: 'block',
        width: '100%',
        position: 'relative',
        aspectRatio: '2 / 3',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: isDarkMode ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
        transition: 'box-shadow 0.2s ease',
        cursor: 'pointer',
        minHeight: '240px',
        maxHeight: '400px',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={`${title} by ${author}`}
    >
      {/* Book cover image */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          backgroundColor: isDarkMode ? '#1f2937' : '#f3f4f6',
          ...placeholderStyles,
        }}
      >
        {coverImageSrc && !imageError && (
          <Image
            src={getFullImageUrl(coverImageSrc)}
            alt={`${title} cover`}
            fill={true}
            sizes="(max-width: 480px) 33vw, (max-width: 768px) 25vw, (max-width: 1024px) 20vw, 200px"
            loading="lazy"
            onError={() => {
              logger.warn(
                `Failed to load image for "${title}"`,
                createLogContext('components/readings/ReadingCard', 'onImageError', {
                  book_title: title,
                  image_src: coverImageSrc,
                })
              );
              setImageError(true);
            }}
            style={{
              objectFit: 'cover',
            }}
          />
        )}
      </div>

      {/* Minimalist hover overlay */}
      <div
        className="hover-overlay"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.2s ease',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '20px',
          pointerEvents: isHovered ? 'auto' : 'none',
        }}
      >
        {/* Book information */}
        <div
          style={{
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? 'translateY(0)' : 'translateY(10px)',
            transition: 'all 0.3s ease',
            transitionDelay: isHovered ? '0.1s' : '0s',
          }}
        >
          {/* Title */}
          <h3
            style={{
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 600,
              marginBottom: '4px',
              lineHeight: 1.3,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {title}
          </h3>

          {/* Author */}
          <p
            style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '12px',
              fontWeight: 400,
              marginBottom: '12px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {author}
          </p>

          {/* Status indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {/* Status dot */}
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: statusColor,
                flexShrink: 0,
              }}
            />
            {/* Status text */}
            <span
              style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '11px',
                fontWeight: 500,
                letterSpacing: '0.02em',
              }}
            >
              {statusText}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
