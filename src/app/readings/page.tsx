"use client"

import Link from 'next/link'
import Image from 'next/image'
import { READINGS, Reading } from './data'
import { getSeededPlaceholderStyles } from './placeholderUtils'

export default function ReadingsPage() {
  return (
    <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
      <div
        style={{
          display: 'grid',
          gap: '1rem',
          // auto-fill ensures as many columns as fit in the container
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        }}
      >
        {READINGS.map((reading: Reading) => {
          const { slug, coverImageSrc } = reading
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
                    alt={`${reading.title} cover`}
                    fill
                    style={{
                      objectFit: 'cover',
                      // apply styles based on whether the book is unfinished
                      filter: reading.finishedDate === null ? 'grayscale(100%)' : 'none',
                      opacity: reading.finishedDate === null ? 0.7 : 1,
                      transition: 'filter 0.2s ease, opacity 0.2s ease', // smooth transition for hover effects
                    }}
                  />
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
