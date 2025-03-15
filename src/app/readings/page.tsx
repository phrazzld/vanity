import ReadingCard from '../components/ReadingCard'
import { getReadings } from '@/lib/db'

export type Reading = {
  id: number
  slug: string
  title: string
  author: string
  finishedDate: Date | null
  coverImageSrc: string | null
  thoughts: string
  dropped: boolean
}

export const dynamic = 'force-dynamic'; // Disable static rendering and caching

export default async function ReadingsPage() {
  const readings = await getReadings() as Reading[]
  console.log(`Rendering readings page with ${readings.length} readings`)

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
