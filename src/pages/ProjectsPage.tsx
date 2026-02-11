import { projects } from '../data/projects';

export function ProjectsPage(): JSX.Element {
  return (
    <>
      <h2 style={{ marginTop: 0 }}>Projects</h2>
      <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
        {projects.map((project) => (
          <li key={project.id}>
            {project.name}: cluster at ({project.position[0]}, {project.position[2]})
          </li>
        ))}
      </ul>
    </>
  );
}
