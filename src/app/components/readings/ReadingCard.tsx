'use client';

/**
 * @file ReadingCard component displays an individual book or reading in a card format
 * @module components/readings/ReadingCard
 *
 * Minimalist design with clean hover states that reveal book information
 * without overwhelming visual effects.
 */

import React from 'react';
import Image from 'next/image';
import { useState } from 'react';
import type { ReadingListItem } from '@/types';
import { getSeededPlaceholderStyles } from './placeholderUtils';

/**
 * Badge positioning constants
 */
const BADGE_SPACING = 8;
const BADGE_SIZE = 28;
const BADGE_OFFSET = BADGE_SIZE + BADGE_SPACING; // 36px

/** Badge component for audiobook indicator */
function AudiobookBadge() {
  return (
    <div
      style={{
        position: 'absolute',
        top: `${BADGE_SPACING}px`,
        right: `${BADGE_SPACING}px`,
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      aria-label="Audiobook"
    >
      <svg
        style={{
          width: '16px',
          height: '16px',
          color: 'rgba(255, 255, 255, 0.9)',
        }}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
        />
      </svg>
    </div>
  );
}

/** Badge component for favorite indicator */
function FavoriteBadge({ audiobook }: { audiobook?: boolean }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: audiobook ? `${BADGE_OFFSET + BADGE_SPACING}px` : `${BADGE_SPACING}px`,
        right: '8px',
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      aria-label="Favorite"
    >
      <svg
        style={{
          width: '16px',
          height: '16px',
          color: '#fbbf24',
        }}
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    </div>
  );
}

/** Badge component for read count indicator */
function ReadCountBadge({
  count,
  audiobook,
  favorite,
}: {
  count: number;
  audiobook?: boolean;
  favorite?: boolean;
}) {
  if (count <= 1) return null;

  const topOffset = BADGE_SPACING + (audiobook ? BADGE_OFFSET : 0) + (favorite ? BADGE_OFFSET : 0);
  const fontSize = count > 9 ? '9px' : '11px';

  return (
    <div
      style={{
        position: 'absolute',
        top: `${topOffset}px`,
        right: '8px',
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      aria-label={`Read ${count} times`}
    >
      <span
        style={{
          color: 'rgba(255, 255, 255, 0.9)',
          fontSize,
          fontWeight: 600,
          letterSpacing: '-0.02em',
        }}
      >
        ×{count}
      </span>
    </div>
  );
}

import { getFullImageUrl } from '@/lib/utils/readingUtils';
import { logger } from '@/lib/logger';

/**
 * Status color constants for reading states
 */
const STATUS_COLORS = {
  READING: '#3b82f6', // blue
  FINISHED: '#10b981', // green
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
const ReadingCard = React.memo(function ReadingCard({
  slug,
  title,
  author,
  coverImageSrc,
  audiobook,
  favorite,
  finishedDate,
  readCount,
}: ReadingCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Generate placeholder styles if no cover image
  const placeholderStyles = !coverImageSrc || imageError ? getSeededPlaceholderStyles(slug) : {};

  // Determine reading status
  const isCurrentlyReading = finishedDate === null;

  // Simple status colors
  const statusColor = isCurrentlyReading ? STATUS_COLORS.READING : STATUS_COLORS.FINISHED;

  // Status text - simplified to not mention format
  const statusText = isCurrentlyReading
    ? 'Currently Reading'
    : `Finished ${formatDate(finishedDate)}`;

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
        boxShadow: 'var(--reading-card-shadow)',
        cursor: 'pointer',
        minHeight: '240px',
        maxHeight: '400px',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      title={`${title} by ${author}`}
      tabIndex={0}
      role="button"
      aria-label={`${title} by ${author}, ${statusText}${audiobook ? ', Audiobook' : ''}${favorite ? ', Favorite' : ''}${readCount && readCount > 1 ? `, Read ${readCount} times` : ''}`}
    >
      {/* Book cover image */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          backgroundColor: 'var(--reading-card-bg)',
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
              logger.warn(`Failed to load image for "${title}"`);
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
        {/* Audiobook badge - only visible on hover */}
        {audiobook && <AudiobookBadge />}
        {/* Favorite badge - only visible on hover */}
        {favorite && <FavoriteBadge audiobook={audiobook} />}
        {/* Read count badge - only visible on hover */}
        {readCount && (
          <ReadCountBadge count={readCount} audiobook={audiobook} favorite={favorite} />
        )}
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
});

export default ReadingCard;
