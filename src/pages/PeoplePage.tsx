import { getAlphabeticalPeople } from '../data/people';

export function PeoplePage(): JSX.Element {
  const alphabeticalNames = getAlphabeticalPeople().map((person) => `${person.lastName}, ${person.firstName}`).join(' • ');

  return (
    <>
      <h2 style={{ marginTop: 0 }}>People Layout (A–Z by Last Name)</h2>
      <p style={{ marginBottom: 0 }}>{alphabeticalNames}</p>
    </>
  );
}
