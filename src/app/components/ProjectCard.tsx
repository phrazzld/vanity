'use client'

import Image from 'next/image'

interface ProjectCardProps {
  title: string
  description: string
  techStack: string[]
  siteUrl?: string
  codeUrl?: string
  imageSrc: string
  altText: string
}

export default function ProjectCard({
  title,
  description,
  techStack,
  siteUrl,
  codeUrl,
  imageSrc,
  altText
}: ProjectCardProps) {
  return (
    <article className="project-card">
      <div className="project-image-container">
        <Image
          src={imageSrc}
          alt={altText}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={false}
          loading="lazy"
          style={{ objectFit: 'cover' }}
        />
      </div>
      <div className="project-content">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
          <ul className="tech-stack">
            {techStack.map((tech) => (
              <li key={tech}>{tech}</li>
            ))}
          </ul>
        </div>
        <div className="project-links">
          {siteUrl && (
            <a href={siteUrl} target="_blank" className="content-link secondary-link" rel="noreferrer">
              view site
            </a>
          )}
          {codeUrl && (
            <a href={codeUrl} target="_blank" className="content-link secondary-link" rel="noreferrer">
              view code
            </a>
          )}
        </div>
      </div>
    </article>
  )
}
