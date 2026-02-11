import { getAlphabeticalPeople } from './data/people';
import { LabScene } from './scene/LabScene';
import { Nav } from './ui/Nav';

export default function App(): JSX.Element {
  const alphabeticalNames = getAlphabeticalPeople().map((person) => `${person.lastName}, ${person.firstName}`).join(' • ');

  return (
    <main className="page-shell">
      <div className="page-container">
        <header className="spotlight">
          <h1 className="spotlight__title">Gameful Futures Lab — Interactive Site Skeleton</h1>
          <p className="spotlight__text">Route-aware characters run to Home, Projects clusters, or People alphabetical placements.</p>
        </header>

        <Nav />
        <div className="scene-shell vignette-overlay">
          <LabScene />
        </div>

        <section className="info-panel">
          <h2>People Layout (A–Z by Last Name)</h2>
          <p>{alphabeticalNames}</p>
        </section>
      </div>
    </main>
  );
}
