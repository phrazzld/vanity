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
      <h2 className="text-2xl md:text-3xl font-bold mb-2">{title}</h2>
      <p className="text-base leading-relaxed mb-3">{description}</p>
      <div className="flex items-center flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-400">
        {techStack.map((tech, index) => (
          <span key={tech}>
            {tech}
            {index < techStack.length - 1 && (
              <span className="ml-2 text-gray-400 dark:text-gray-600">•</span>
            )}
          </span>
        ))}
      </div>
      <div className="project-links mt-4 flex gap-4">
        {siteUrl && (
          <a
            href={siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm"
          >
            Live Demo
          </a>
        )}
        {codeUrl && (
          <a
            href={codeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="content-link secondary-link"
          >
            View Code
          </a>
        )}
      </div>
    </article>
  );
}
