import ReadingCard from '../components/readings/ReadingCard'
import { getReadings } from '@/lib/db'
import type { Reading } from '@/types'

export const dynamic = 'force-dynamic'; // Disable static rendering and caching

/**
 * Helper function to check if a reading is "currently reading"
 * Currently reading = no finishedDate and not dropped
 */
function isCurrentlyReading(reading: Reading): boolean {
  return reading.finishedDate === null && !reading.dropped;
}

/**
 * Sorts readings to prioritize currently reading items first
 */
function sortReadings(readings: Reading[]): Reading[] {
  return [...readings].sort((a, b) => {
    // If a is currently reading and b is not, a comes first
    if (isCurrentlyReading(a) && !isCurrentlyReading(b)) {
      return -1;
    }
    // If b is currently reading and a is not, b comes first
    if (!isCurrentlyReading(a) && isCurrentlyReading(b)) {
      return 1;
    }
    // Otherwise, keep original order
    return 0;
  });
}

export default async function ReadingsPage() {
  const readings = await getReadings() as Reading[];
  
  // Sort readings to display "currently reading" at the top
  const sortedReadings = sortReadings(readings);

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
        {sortedReadings.map((reading) => (
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
