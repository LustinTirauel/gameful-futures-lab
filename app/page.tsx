'use client';

import { useMemo, useState } from 'react';
import CharacterLayer from './components/CharacterLayer';
import LandingScene3D from './components/LandingScene3D';
import PeoplePanel from './components/PeoplePanel';
import ProjectsLayer from './components/ProjectsLayer';
import TopNav from './components/TopNav';
import { characterConfigs, people, projects } from './data/content';

type Mode = 'home' | 'people' | 'projects';

const modeMovementBehavior: Record<Mode, 'idle' | 'run'> = {
  home: 'idle',
  people: 'run',
  projects: 'run',
};

export default function Home() {
  const [mode, setMode] = useState<Mode>('home');
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [reactionId, setReactionId] = useState<string | null>(null);
  const [scene3DFailed, setScene3DFailed] = useState(false);

  const sortedPeople = useMemo(() => [...people].sort((a, b) => a.name.localeCompare(b.name)), []);
  const sceneCharacters = useMemo(
    () => people.map((person) => ({ id: person.id, config: characterConfigs[person.id] })),
    [],
  );

  /** Switches top-level mode and clears mode-specific selections. */
  function handleModeChange(nextMode: Mode) {
    setMode(nextMode);
    setSelectedPerson(null);
    setSelectedProject(null);
  }

  /** Triggers a brief character reaction bounce in home mode. */
  function handleCharacterReact(personId: string) {
    setReactionId(personId);
    setTimeout(() => setReactionId(null), 500);
  }

  /** Stores the currently focused person for the people panel. */
  function handleCharacterSelect(personId: string) {
    setSelectedPerson(personId);
  }

  /** Stores the currently focused project for the project detail panel. */
  function handleProjectSelect(projectId: string) {
    setSelectedProject(projectId);
  }

  /** Records 3D scene runtime failures and enables fallback rendering. */
  function handleSceneRuntimeError() {
    setScene3DFailed(true);
  }

  return (
    <main className="main">
      {mode === 'home' && !scene3DFailed && (
        <LandingScene3D
          characters={sceneCharacters}
          movementBehavior={modeMovementBehavior[mode]}
          onRuntimeError={handleSceneRuntimeError}
        />
      )}

      {/* navigation mode switching */}
      <TopNav mode={mode} onModeChange={handleModeChange} />

      {/* home hero rendering */}
      {mode === 'home' && (
        <div className="center-copy">
          <h1>Gameful Futures Lab</h1>
          <p>We build futures through games and play!</p>
        </div>
      )}

      {/* character rendering and interaction */}
      {(mode !== 'home' || scene3DFailed) && (
        <CharacterLayer
          mode={mode}
          reactionId={reactionId}
          movementBehavior={modeMovementBehavior[mode]}
          onReact={handleCharacterReact}
          onSelectPerson={handleCharacterSelect}
        />
      )}

      {/* people panel rendering */}
      {mode === 'people' && <PeoplePanel people={sortedPeople} selectedPerson={selectedPerson} />}

      {/* projects plate/detail rendering */}
      {mode === 'projects' && (
        <ProjectsLayer
          projects={projects}
          selectedProject={selectedProject}
          onProjectSelect={handleProjectSelect}
        />
      )}

      <section className="future">
        <strong>Prepared for next versions:</strong>
        <ul>
          <li>Blog/news page with editable posts</li>
          <li>User-submitted project form with HTML sanitization</li>
          <li>BibTeX-driven publications page</li>
          <li>People tag filters with "run away" behavior</li>
        </ul>
      </section>

      <div className="vignette" />
    </main>
  );
}
