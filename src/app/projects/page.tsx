import ProjectItem from '@/app/components/ProjectItem';
import { getProjects } from '@/lib/data';

export default function ProjectsPage() {
  const projects = getProjects();

  return (
    <section>
      <div className="projects-list">
        {projects.map(project => (
          <ProjectItem key={project.title} {...project} />
        ))}
      </div>
    </section>
  );
}
