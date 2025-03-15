import ReadingCard from '../components/readings/ReadingCard'
import { getReadings } from '@/lib/db'
import type { Reading } from '@/types'

export const dynamic = 'force-dynamic'; // Disable static rendering and caching

export default async function ReadingsPage() {
  const readings = await getReadings() as Reading[]

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
        {readings.map((reading) => (
          <ReadingCard
            key={reading.slug}
            slug={reading.slug}
            title={reading.title}
            coverImageSrc={reading.coverImageSrc}
            dropped={reading.dropped}
            finishedDate={reading.finishedDate}
          />
        ))}
      </div>
    </section>
  )
}
