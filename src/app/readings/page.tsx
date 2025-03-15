import prisma from '@/lib/prisma'
import ReadingCard from '../components/ReadingCard'

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

export async function getReadings() {
  try {
    console.log('Getting readings from database...')
    
    // Use raw query for maximum compatibility
    const readings = await prisma.$queryRaw`
      SELECT id, slug, title, author, "finishedDate", "coverImageSrc", thoughts, dropped
      FROM "Reading"
      ORDER BY 
        CASE WHEN "finishedDate" IS NULL THEN 1 ELSE 0 END,
        "finishedDate" DESC,
        id DESC;
    `
    
    console.log(`Found ${Array.isArray(readings) ? readings.length : 0} readings`)
    
    if (!readings || (Array.isArray(readings) && readings.length === 0)) {
      console.warn('No readings found in database')
    }
    
    return readings
  } catch (error) {
    console.error('Error fetching readings:', error)
    return []
  }
}

export const dynamic = 'force-dynamic'; // Disable static rendering and caching

export default async function ReadingsPage() {
  const readings = await getReadings()
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
