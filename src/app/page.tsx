import TypewriterQuotes from '@/app/components/TypewriterQuotes'

export default function HomePage() {
  return (
    <section>
      <h1 className="big-heading">phaedrus</h1>
      <p>software engineer, general tinkerer</p>
      <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexDirection: "row" }}>
        <a href="https://github.com/phrazzld" target="_blank" rel="noreferrer" className="content-link secondary-link">
          github
        </a>
        <a href="mailto:phaedrus.raznikov@pm.me" target="_blank" rel="noreferrer" className="content-link secondary-link">
          email
        </a>
      </div>
      <section
        style={{
          minHeight: '50vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}
      >
        <TypewriterQuotes />
      </section>
    </section>
  )
}
