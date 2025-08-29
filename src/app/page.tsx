import TypewriterQuotes from '@/app/components/TypewriterQuotes';

export default function HomePage() {
  return (
    <section>
      <h1 className="big-heading">phaedrus</h1>
      <p>software engineer, general tinkerer</p>
      <section
        style={{
          minHeight: '50vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <TypewriterQuotes />
      </section>
    </section>
  );
}
