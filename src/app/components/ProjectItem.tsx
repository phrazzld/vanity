interface ProjectItemProps {
  title: string;
  description: string;
  techStack: string[];
  siteUrl?: string;
  codeUrl?: string;
}

export default function ProjectItem({
  title,
  description,
  techStack,
  siteUrl,
  codeUrl,
}: ProjectItemProps) {
  return (
    <article className="project-item">
      <h2 className="project-title">{title}</h2>
      <p className="project-description">{description}</p>
      <div className="tech-stack">
        {techStack.map(tech => (
          <span key={tech} className="tech-badge">
            {tech}
          </span>
        ))}
      </div>
      <div className="project-links">
        {siteUrl && (
          <a href={siteUrl} target="_blank" rel="noopener noreferrer" className="project-link">
            live demo
          </a>
        )}
        {codeUrl && (
          <a href={codeUrl} target="_blank" rel="noopener noreferrer" className="project-link">
            view code
          </a>
        )}
      </div>
    </article>
  );
}
