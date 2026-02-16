import type { Person, Project } from '../data/content';

type PeopleModalProps = {
  person: Person;
  projects: Project[];
  onClose: () => void;
};

export default function PeopleModal({ person, projects, onClose }: PeopleModalProps) {
  return (
    <div className="people-modal-backdrop" role="presentation" onClick={onClose}>
      <article className="people-modal" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="people-modal-close" onClick={onClose}>
          Close
        </button>
        <img src={person.picture} alt={person.name} className="people-modal-photo" />
        <h2>{person.name}</h2>
        <p>{person.bio}</p>

        <p>
          <strong>Tags:</strong> {person.tags.join(', ')}
        </p>

        <section>
          <h3>Publications</h3>
          <ul>
            {person.publications.map((publication) => (
              <li key={publication}>{publication}</li>
            ))}
          </ul>
        </section>

        <section>
          <h3>Projects</h3>
          <ul>
            {projects.map((project) => (
              <li key={project.id}>{project.title}</li>
            ))}
          </ul>
        </section>
      </article>
    </div>
  );
}
