import ProjectCard from '@/app/components/ProjectCard';
import { getProjects } from '@/lib/data';

export default function ProjectsPage() {
  const projects = getProjects();

  return (
    <section>
      <h1 className="medium-heading">projects</h1>
      <div className="projects-grid">
        {projects.map(project => (
          <ProjectCard key={project.title} {...project} />
        ))}
      </div>
    </section>
  );
}
