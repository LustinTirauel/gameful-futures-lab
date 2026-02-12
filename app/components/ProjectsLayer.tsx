import { type Project } from '../data/content';

type ProjectsLayerProps = {
  projects: Project[];
  selectedProject: string | null;
  onProjectSelect: (projectId: string) => void;
};

export default function ProjectsLayer({ projects, selectedProject, onProjectSelect }: ProjectsLayerProps) {
  const project = projects.find((item) => item.id === selectedProject);

  return (
    <>
      <section className="plates">
        {projects.map((item) => (
          <article key={item.id} className="plate" onClick={() => onProjectSelect(item.id)}>
            <h3>{item.title}</h3>
            <p>{item.summary}</p>
          </article>
        ))}
      </section>

      {project && (
        <aside className="panel">
          <h3>{project.title}</h3>
          <p>{project.summary}</p>
          <div dangerouslySetInnerHTML={{ __html: project.detailsHtml }} />
          <p>
            <strong>Team:</strong> {project.memberIds.join(', ')}
          </p>
        </aside>
      )}
    </>
  );
}
