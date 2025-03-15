import { Reading } from '../page'
import { getReading } from '../utils'

export const dynamic = 'force-dynamic'; // Disable static rendering and caching

// Using a simpler parameter format to avoid interface mismatches
export default async function ReadingDetailPage(props: any) {
  const { params } = props
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
