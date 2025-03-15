import prisma from '@/lib/prisma'
import { Reading } from '../page'

interface Props {
  params: { slug: string }
}

export const dynamic = 'force-dynamic'; // Disable static rendering and caching

export async function getReading(slug: string) {
  try {
    console.log(`Fetching reading with slug: ${slug}`)
    
    // Use raw query for maximum compatibility
    const readings = await prisma.$queryRaw`
      SELECT id, slug, title, author, "finishedDate", "coverImageSrc", thoughts, dropped
      FROM "Reading"
      WHERE slug = ${slug}
      LIMIT 1;
    `
    
    const reading = Array.isArray(readings) && readings.length > 0 ? readings[0] : null
    
    console.log(reading ? `Found reading: ${reading.title}` : `No reading found for slug: ${slug}`)
    return reading
  } catch (error) {
    console.error(`Error fetching reading with slug ${slug}:`, error)
    return null
  }
}

export default async function ReadingDetailPage({ params }: Props) {
  const { slug } = params
  const reading = await getReading(slug)
  
  if (!reading) {
    return <div>not found</div>
  }

  const { title, author, finishedDate, thoughts } = reading
  const isFinished = Boolean(finishedDate)

  return (
    <section style={{ maxWidth: '700px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: 0 }}>{title.toLowerCase()}</h1>
      <h2 style={{ fontWeight: '400', marginTop: 0 }}>{author.toLowerCase()}</h2>

      <p style={{ fontSize: '0.9rem', color: '#666' }}>
        {isFinished
          ? `finished on ${finishedDate?.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).toLowerCase()}`
          : 'still reading...'}
      </p>

      <div style={{ marginTop: '1rem' }}>
        <p>{thoughts}</p>
      </div>
    </section>
  )
}
