'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { getSeededPlaceholderStyles } from '../readings/placeholderUtils'

interface ReadingCardProps {
  slug: string
  title: string
  coverImageSrc: string | null
  dropped: boolean
  finishedDate: Date | null
}

export default function ReadingCard({ 
  slug, 
  title,
  coverImageSrc, 
  dropped, 
  finishedDate 
}: ReadingCardProps) {
  const placeholderStyles = !coverImageSrc ? getSeededPlaceholderStyles(slug) : {}

  return (
    <Link
      key={slug}
      href={`/readings/${slug}`}
      style={{
        // card container
        display: 'block',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '6px',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        aspectRatio: '2 / 3', // lock the shape
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        textDecoration: 'none',
        color: 'inherit',
      }}
      onMouseEnter={(e) => {
        const card = e.currentTarget
        card.style.transform = 'translateY(-2px) scale(1.02)'
        card.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)'
      }}
      onMouseLeave={(e) => {
        const card = e.currentTarget
        card.style.transform = 'translateY(0) scale(1)'
        card.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)'
      }}
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
    </Link>
  )
}