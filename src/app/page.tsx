'use client';

import TypewriterQuotes from '@/app/components/TypewriterQuotes';
import { useEffect, useRef } from 'react';

export default function HomePage() {
  const heroRef = useRef<HTMLElement>(null);
  const quotesRef = useRef<HTMLElement>(null);
  const aboutRef = useRef<HTMLElement>(null);
  const linksRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const sections = [
      { ref: heroRef, delay: 0 },
      { ref: quotesRef, delay: 200 },
      { ref: aboutRef, delay: 400 },
      { ref: linksRef, delay: 600 },
    ];

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const section = sections.find(s => s.ref.current === entry.target);
            if (section) {
              setTimeout(() => {
                entry.target.classList.add('opacity-100', 'translate-y-0');
                entry.target.classList.remove('opacity-0', 'translate-y-4');
              }, section.delay);
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    sections.forEach(({ ref }) => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => {
      sections.forEach(({ ref }) => {
        if (ref.current) {
          observer.unobserve(ref.current);
        }
      });
    };
  }, []);

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
      <section
        ref={heroRef}
        className="section-hero border-l-2 border-amber-600 pl-8 opacity-0 translate-y-4 transition-all duration-500"
      >
        <h1 className="text-8xl md:text-9xl font-ibm-plex-mono">phaedrus</h1>
        <p className="text-xl md:text-2xl mt-4 text-gray-700 dark:text-gray-300">
          software engineer, general tinkerer
        </p>
      </section>

      {/* TypewriterQuotes Section - Centered, generous spacing */}
      <section
        ref={quotesRef}
        className="section-quotes opacity-0 translate-y-4 transition-all duration-500"
      >
        <TypewriterQuotes />
      </section>

      {/* About/Bio Section - Right-aligned, asymmetric */}
      <section
        ref={aboutRef}
        className="section-about opacity-0 translate-y-4 transition-all duration-500"
      >
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
      <section
        ref={linksRef}
        className="section-links opacity-0 translate-y-4 transition-all duration-500"
      >
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
