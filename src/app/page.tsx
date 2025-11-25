import TypewriterQuotes from '@/app/components/TypewriterQuotes';

export default function HomePage() {
  const externalLinks = [
    {
      label: 'Misty Step',
      href: 'https://mistystep.ai',
      description: 'AI-powered dev tools company',
    },
    {
      label: 'GitHub',
      href: 'https://github.com/phrazzld',
      description: 'Open source contributions',
    },
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/phaedrus-raznikov/',
      description: 'Professional network',
    },
    {
      label: 'Email',
      href: 'mailto:phaedrus.raznikov@pm.me',
      description: 'Get in touch',
    },
    {
      label: 'Readings',
      href: 'https://www.scry.study',
      description: 'What I am reading',
    },
  ];

  return (
    <>
      {/* Hero Section - Full viewport, left-aligned, amber accent */}
      <section className="section-hero border-l-2 border-amber-600 pl-8">
        <h1 className="text-8xl md:text-9xl font-ibm-plex-mono">phaedrus</h1>
        <p className="text-xl md:text-2xl mt-4 text-gray-700 dark:text-gray-300">
          software engineer, general tinkerer
        </p>
      </section>

      {/* TypewriterQuotes Section - Centered, generous spacing */}
      <section className="section-quotes">
        <TypewriterQuotes />
      </section>

      {/* About/Bio Section - Right-aligned, asymmetric */}
      <section className="section-about">
        <h2 className="text-3xl md:text-4xl font-ibm-plex-mono mb-6">About</h2>
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-lg leading-relaxed text-gray-800 dark:text-gray-200">
            I build software with a focus on craftsmanship and intentional design. Currently working
            on{' '}
            <a
              href="https://mistystep.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-500 transition-colors underline decoration-amber-600/30 underline-offset-4 hover:decoration-amber-600"
            >
              Misty Step
            </a>
            , where we're making AI development tools that feel like magic.
          </p>
          <p className="text-lg leading-relaxed text-gray-800 dark:text-gray-200 mt-4">
            I believe in deep work, simple abstractions, and code that tells a story. When I'm not
            coding, you'll find me reading philosophy, exploring new ideas, or tinkering with side
            projects.
          </p>
        </div>
      </section>

      {/* External Links Section - Left-aligned, grid layout */}
      <section className="section-links">
        {externalLinks.map(link => (
          <a
            key={link.href}
            href={link.href}
            target={link.href.startsWith('http') ? '_blank' : undefined}
            rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
            className="group block p-6 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-amber-600 dark:hover:border-amber-600 hover:scale-105 transition-all duration-200 bg-white dark:bg-gray-900"
          >
            <h3 className="font-ibm-plex-mono text-xl mb-2 text-gray-900 dark:text-gray-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              {link.label}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{link.description}</p>
          </a>
        ))}
      </section>
    </>
  );
}
