import ReadingCard from '../components/readings/ReadingCard'
import { getReadings } from '@/lib/db'
import type { Reading } from '@/types'
import './readings.css'

export const dynamic = 'force-dynamic'; // Disable static rendering and caching

export default async function ReadingsPage() {
  const readings = await getReadings() as Reading[]

  return (
    <section className="readings-container">
      <div className="readings-grid">
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
