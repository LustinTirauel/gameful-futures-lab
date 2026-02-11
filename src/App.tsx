import { getAlphabeticalPeople } from './data/people';
import { LabScene } from './scene/LabScene';
import { Nav } from './ui/Nav';

export default function App(): JSX.Element {
  const alphabeticalNames = getAlphabeticalPeople().map((person) => `${person.lastName}, ${person.firstName}`).join(' • ');

  return (
    <main
      style={{
        minHeight: '100vh',
        margin: 0,
        padding: '1.5rem 1rem 2rem',
        boxSizing: 'border-box',
        fontFamily: 'Inter, system-ui, sans-serif',
        background: 'linear-gradient(#f8edff, #f1f7ff)',
      }}
    >
      <header style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <h1 style={{ marginBottom: '0.5rem', color: '#231942' }}>Gameful Futures Lab — Interactive Site Skeleton</h1>
        <p style={{ margin: 0, color: '#5e548e' }}>
          Route-aware characters run to Home, Projects clusters, or People alphabetical placements.
        </p>
      </header>

      <Nav />
      <LabScene />

      <section
        style={{
          maxWidth: '960px',
          margin: '1rem auto 0',
          background: '#ffffffc9',
          borderRadius: '12px',
          padding: '1rem',
          color: '#231942',
          lineHeight: 1.4,
        }}
      >
        <h2 style={{ marginTop: 0 }}>People Layout (A–Z by Last Name)</h2>
        <p style={{ marginBottom: 0 }}>{alphabeticalNames}</p>
      </section>
    </main>
  );
}
