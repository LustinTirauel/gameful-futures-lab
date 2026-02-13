'use client';

// Page flow keeps discovery simple by moving visitors from home -> people -> projects.

import { useEffect, useMemo, useState } from 'react';
import CharacterLayer from './components/CharacterLayer';
import LandingScene3D, { defaultSceneTuning, type SceneTuning } from './components/LandingScene3D';
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

const sceneTuningStorageKey = 'gfl-scene-tuning-v1';

type TuningField = {
  key: keyof SceneTuning;
  label: string;
  min: number;
  max: number;
  step: number;
};

const tuningFields: TuningField[] = [
  { key: 'cameraX', label: 'Camera X', min: 2, max: 12, step: 0.1 },
  { key: 'cameraY', label: 'Camera Y', min: 1.5, max: 10, step: 0.1 },
  { key: 'cameraZ', label: 'Camera Z (distance)', min: 2, max: 12, step: 0.1 },
  { key: 'fov', label: 'FOV', min: 18, max: 60, step: 1 },
  { key: 'fogNear', label: 'Fog Near', min: 1, max: 18, step: 0.5 },
  { key: 'fogFar', label: 'Fog Far', min: 8, max: 35, step: 0.5 },
  { key: 'characterScale', label: 'Character Scale', min: 0.5, max: 1.2, step: 0.01 },
  { key: 'sceneOffsetX', label: 'Scene Offset X (%)', min: -30, max: 20, step: 0.5 },
  { key: 'sceneOffsetY', label: 'Scene Offset Y (%)', min: -20, max: 25, step: 0.5 },
  { key: 'campfireX', label: 'Campfire X', min: -4, max: 4, step: 0.05 },
  { key: 'campfireY', label: 'Campfire Y', min: -2, max: 2, step: 0.05 },
  { key: 'campfireZ', label: 'Campfire Z', min: -6, max: 2, step: 0.05 },
];

export default function Home() {
  const [mode, setMode] = useState<Mode>('home');
  // Tracks which person should stay expanded so users can compare profiles without losing context.
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  // Keeps one project detail pinned while people browse the full project list.
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  // Stores the currently reacting character so clicks feel acknowledged in the 2D fallback strip.
  const [reactionId, setReactionId] = useState<string | null>(null);
  const [scene3DFailed, setScene3DFailed] = useState(false);
  const [sceneTuning, setSceneTuning] = useState<SceneTuning>(defaultSceneTuning);
  const [showTuningPanel, setShowTuningPanel] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(sceneTuningStorageKey);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as Partial<SceneTuning>;
      setSceneTuning((current) => ({ ...current, ...parsed }));
    } catch {
      // Ignore invalid JSON and keep defaults.
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(sceneTuningStorageKey, JSON.stringify(sceneTuning));
  }, [sceneTuning]);

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

  function handleTuningChange(key: keyof SceneTuning, value: number) {
    setSceneTuning((current) => ({ ...current, [key]: value }));
  }

  function handleTuningReset() {
    setSceneTuning(defaultSceneTuning);
  }

  async function handleTuningCopy() {
    await navigator.clipboard.writeText(JSON.stringify(sceneTuning, null, 2));
  }

  return (
    <main className="main">
      {mode === 'home' && !scene3DFailed && (
        <LandingScene3D
          characters={sceneCharacters}
          movementBehavior={modeMovementBehavior[mode]}
          onRuntimeError={handleSceneRuntimeError}
          tuning={sceneTuning}
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

      {mode === 'home' && (
        <>
          <button className="tuning-toggle" onClick={() => setShowTuningPanel((visible) => !visible)}>
            {showTuningPanel ? 'Hide' : 'Tune scene'}
          </button>
          {showTuningPanel && (
            <aside className="tuning-panel">
              <h3>Scene tuning</h3>
              <p>Use sliders, then click "Copy JSON" to share/fix final values.</p>
              <div className="tuning-fields">
                {tuningFields.map((field) => (
                  <label key={field.key}>
                    <span>{field.label}</span>
                    <input
                      type="range"
                      min={field.min}
                      max={field.max}
                      step={field.step}
                      value={sceneTuning[field.key]}
                      onChange={(event) => handleTuningChange(field.key, Number(event.target.value))}
                    />
                    <strong>{sceneTuning[field.key].toFixed(2)}</strong>
                  </label>
                ))}
              </div>
              <div className="tuning-actions">
                <button onClick={handleTuningReset}>Reset</button>
                <button onClick={handleTuningCopy}>Copy JSON</button>
              </div>
            </aside>
          )}
        </>
      )}

      {/* Provides a reliable character strip when home is not active or 3D is unavailable. */}
      {(mode !== 'home' || scene3DFailed) && (
        <CharacterLayer
          mode={mode}
          reactionId={reactionId}
          isRunning={modeMovementBehavior[mode] === 'run'}
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
