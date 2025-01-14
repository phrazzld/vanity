import { READINGS, Reading } from '../data'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function ReadingDetailPage({ params }: Props) {
  const { slug } = await params
  const reading = READINGS.find((item: Reading) => item.slug === slug)
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
