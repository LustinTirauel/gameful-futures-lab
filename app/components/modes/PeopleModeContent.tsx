import PeopleModal from '../PeopleModal';
import { people, projects } from '../../data/content';
import type { Mode } from '../../types/navigation';

type PeopleModeContentProps = {
  mode: Mode;
  selectedPerson: string | null;
  onClosePerson: () => void;
};

export default function PeopleModeContent({ mode, selectedPerson, onClosePerson }: PeopleModeContentProps) {
  if (mode !== 'people' || !selectedPerson) return null;

  const person = people.find((item) => item.id === selectedPerson) ?? null;
  if (!person) return null;

  const personProjects = projects.filter((project) => project.memberIds.includes(selectedPerson));

  return <PeopleModal person={person} projects={personProjects} onClose={onClosePerson} />;
}
