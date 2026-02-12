import { type Person } from '../data/content';

type PeoplePanelProps = {
  people: Person[];
  selectedPerson: string | null;
};

export default function PeoplePanel({ people, selectedPerson }: PeoplePanelProps) {
  const person = people.find((item) => item.id === selectedPerson);

  if (!person) {
    return null;
  }

  return (
    <aside className="panel">
      <h3>{person.name}</h3>
      <p>{person.bio}</p>
      <p>
        <strong>Tags:</strong> {person.tags.join(', ')}
      </p>
    </aside>
  );
}
