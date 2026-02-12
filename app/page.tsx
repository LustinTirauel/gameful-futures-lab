'use client';

// Page flow keeps discovery simple by moving visitors from home -> people -> projects.

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
  // Tracks which person should stay expanded so users can compare profiles without losing context.
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  // Keeps one project detail pinned while people browse the full project list.
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  // Stores the currently reacting character so clicks feel acknowledged in the 2D fallback strip.
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

  /** Triggers a brief character reaction bounce when a character is clicked. */
  function handleCharacterClick(personId: string) {
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

      {/* Keeps mode switching always visible so users can jump between major sections quickly. */}
      <TopNav mode={mode} onModeChange={handleModeChange} />

      {/* Anchors the home mode with a concise mission statement before deeper exploration. */}
      {mode === 'home' && (
        <div className="center-copy">
          <h1>Gameful Futures Lab</h1>
          <p>We build futures through games and play!</p>
        </div>
      )}

      {/* Provides a reliable character strip when home is not active or 3D is unavailable. */}
      {(mode !== 'home' || scene3DFailed) && (
        <CharacterLayer
          mode={mode}
          reactionId={reactionId}
          movementBehavior={modeMovementBehavior[mode]}
          onReact={handleCharacterClick}
          onSelectPerson={handleCharacterSelect}
        />
      )}

      {/* Focuses attention on people bios to support team discovery before project deep-dives. */}
      {mode === 'people' && <PeoplePanel people={sortedPeople} selectedPerson={selectedPerson} />}

      {/* Keeps project browsing in its own mode so details can expand without crowding other content. */}
      {mode === 'projects' && (
        <ProjectsLayer
          projects={projects}
          selectedProject={selectedProject}
          onProjectSelect={handleProjectSelect}
        />
      )}

      {/* Signals planned roadmap items so contributors understand where this experience is heading next. */}
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
