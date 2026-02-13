'use client';

import { useEffect, useMemo, useState } from 'react';
import CharacterLayer from './components/CharacterLayer';
import LandingScene3D, {
  defaultSceneTuning,
  type ModelOverride,
  type SceneTuning,
} from './components/LandingScene3D';
import PeoplePanel from './components/PeoplePanel';
import ProjectsLayer from './components/ProjectsLayer';
import TopNav from './components/TopNav';
import { characterConfigs, people, projects } from './data/content';

type Mode = 'home' | 'people' | 'projects';
type EditableModelId = string | 'fire';
type NumericSceneTuningKey = Exclude<keyof SceneTuning, 'characterOverrides' | 'fireOverride'>;

const modeMovementBehavior: Record<Mode, 'idle' | 'run'> = {
  home: 'idle',
  people: 'run',
  projects: 'run',
};

const sceneTuningStorageKey = 'gfl-scene-tuning-v1';

const tuningFields: Array<{ key: NumericSceneTuningKey; label: string; min: number; max: number; step: number }> = [
  { key: 'cameraX', label: 'Camera X', min: 2, max: 14, step: 0.1 },
  { key: 'cameraY', label: 'Camera Y', min: 1.5, max: 12, step: 0.1 },
  { key: 'cameraZ', label: 'Camera Z (distance)', min: 2, max: 14, step: 0.1 },
  { key: 'fov', label: 'FOV', min: 18, max: 60, step: 1 },
  { key: 'fogNear', label: 'Fog Near', min: 1, max: 28, step: 0.5 },
  { key: 'fogFar', label: 'Fog Far', min: 8, max: 60, step: 0.5 },
  { key: 'characterScale', label: 'Character Scale', min: 0.4, max: 1.4, step: 0.01 },
  { key: 'sceneOffsetX', label: 'Scene Offset X (%)', min: -40, max: 20, step: 0.5 },
  { key: 'sceneOffsetY', label: 'Scene Offset Y (%)', min: -30, max: 25, step: 0.5 },
  { key: 'sceneRadius', label: 'Scene Size / Radius', min: 6, max: 120, step: 1 },
];

const modelFields: Array<{ key: keyof ModelOverride; min: number; max: number; step: number }> = [
  { key: 'scale', min: 0.4, max: 1.8, step: 0.01 },
  { key: 'x', min: -20, max: 20, step: 0.05 },
  { key: 'y', min: -3, max: 3, step: 0.05 },
  { key: 'z', min: -20, max: 20, step: 0.05 },
  { key: 'rotX', min: -3.14, max: 3.14, step: 0.01 },
  { key: 'rotY', min: -3.14, max: 3.14, step: 0.01 },
  { key: 'rotZ', min: -3.14, max: 3.14, step: 0.01 },
];

export default function Home() {
  const [mode, setMode] = useState<Mode>('home');
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [reactionId, setReactionId] = useState<string | null>(null);
  const [scene3DFailed, setScene3DFailed] = useState(false);
  const [sceneTuning, setSceneTuning] = useState<SceneTuning>(defaultSceneTuning);
  const [editMode, setEditMode] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState<EditableModelId | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(sceneTuningStorageKey);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as Partial<SceneTuning>;
      setSceneTuning((current) => ({
        ...current,
        ...parsed,
        characterOverrides: {
          ...current.characterOverrides,
          ...(parsed.characterOverrides ?? {}),
        },
        fireOverride: {
          ...current.fireOverride,
          ...(parsed.fireOverride ?? {}),
        },
      }));
    } catch {
      // Keep defaults when saved JSON is invalid.
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

  const selectedCharacter =
    selectedModelId && selectedModelId !== 'fire'
      ? sceneCharacters.find((character) => character.id === selectedModelId)
      : null;

  function handleModeChange(nextMode: Mode) {
    setMode(nextMode);
    setSelectedPerson(null);
    setSelectedProject(null);
  }

  function handleCharacterClick(personId: string) {
    setReactionId(personId);
    setTimeout(() => setReactionId(null), 500);
  }

  function handleCharacterSelect(personId: string) {
    setSelectedPerson(personId);
  }

  function handleProjectSelect(projectId: string) {
    setSelectedProject(projectId);
  }

  function handleSceneRuntimeError() {
    setScene3DFailed(true);
  }

  function handleTuningChange(key: NumericSceneTuningKey, value: number) {
    setSceneTuning((current) => ({ ...current, [key]: value }));
  }

  function handleTuningReset() {
    setSceneTuning(defaultSceneTuning);
    setSelectedModelId(null);
  }

  function handleToggleEditMode() {
    setEditMode((enabled) => {
      const next = !enabled;
      if (!next) {
        setSelectedModelId(null);
      }
      return next;
    });
  }

  async function handleTuningCopy() {
    await navigator.clipboard.writeText(JSON.stringify(sceneTuning, null, 2));
  }

  function getCharacterOverride(characterId: string): ModelOverride {
    const character = sceneCharacters.find((item) => item.id === characterId);
    const [x, y, z] = character?.config.position ?? [0, 0, 0];
    const [rotX, rotY, rotZ] = character?.config.rotation ?? [0, 0, 0];

    return sceneTuning.characterOverrides[characterId] ?? {
      x,
      y,
      z,
      scale: 1,
      rotX,
      rotY,
      rotZ,
    };
  }

  function getSelectedModelOverride(): ModelOverride | null {
    if (!selectedModelId) return null;
    if (selectedModelId === 'fire') return sceneTuning.fireOverride;
    return getCharacterOverride(selectedModelId);
  }

  function updateCharacterOverride(characterId: string, nextOverride: ModelOverride) {
    setSceneTuning((current) => ({
      ...current,
      characterOverrides: {
        ...current.characterOverrides,
        [characterId]: nextOverride,
      },
    }));
  }

  function updateFireOverride(nextOverride: ModelOverride) {
    setSceneTuning((current) => ({
      ...current,
      fireOverride: nextOverride,
    }));
  }

  function handleSelectedModelFieldChange(key: keyof ModelOverride, value: number) {
    if (!selectedModelId) return;

    const current = getSelectedModelOverride();
    if (!current) return;
    const next = { ...current, [key]: value };

    if (selectedModelId === 'fire') {
      updateFireOverride(next);
    } else {
      updateCharacterOverride(selectedModelId, next);
    }
  }

  return (
    <main className="main">
      {mode === 'home' && !scene3DFailed && (
        <LandingScene3D
          characters={sceneCharacters}
          movementBehavior={modeMovementBehavior[mode]}
          onRuntimeError={handleSceneRuntimeError}
          tuning={sceneTuning}
          editMode={editMode}
          selectedModelId={selectedModelId}
          onSelectModel={(id) => setSelectedModelId(id as EditableModelId)}
          onCharacterOverrideChange={updateCharacterOverride}
          onFireOverrideChange={updateFireOverride}
        />
      )}

      <TopNav mode={mode} onModeChange={handleModeChange} />

      {mode === 'home' && !editMode && (
        <div className="center-copy">
          <h1>Gameful Futures Lab</h1>
          <p>We build futures through games and play!</p>
        </div>
      )}

      {mode === 'home' && (
        <>
          <button className="tuning-toggle" onClick={handleToggleEditMode}>
            {editMode ? 'Close edit mode' : 'Edit mode'}
          </button>

          {editMode && (
            <aside className="tuning-panel">
              <h3>Scene edit mode</h3>
              <p>Drag models in X/Z, then fine tune with sliders. Values auto-save.</p>

              {selectedModelId && (
                <section className="character-editor">
                  <h4>Model: {selectedModelId === 'fire' ? 'fire' : selectedCharacter?.id ?? selectedModelId}</h4>
                  <div className="tuning-fields">
                    {modelFields.map((field) => (
                      <label key={field.key}>
                        <span>{field.key.toUpperCase()}</span>
                        <input
                          type="range"
                          min={field.min}
                          max={field.max}
                          step={field.step}
                          value={getSelectedModelOverride()?.[field.key] ?? 0}
                          onChange={(event) =>
                            handleSelectedModelFieldChange(field.key, Number(event.target.value))
                          }
                        />
                        <strong>{(getSelectedModelOverride()?.[field.key] ?? 0).toFixed(2)}</strong>
                      </label>
                    ))}
                  </div>
                </section>
              )}

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
                <button onClick={handleTuningReset}>Reset all</button>
                <button onClick={handleTuningCopy}>Copy JSON</button>
              </div>
            </aside>
          )}
        </>
      )}

      {(mode !== 'home' || scene3DFailed) && (
        <CharacterLayer
          mode={mode}
          reactionId={reactionId}
          movementBehavior={modeMovementBehavior[mode]}
          onReact={handleCharacterClick}
          onSelectPerson={handleCharacterSelect}
        />
      )}

      {mode === 'people' && <PeoplePanel people={sortedPeople} selectedPerson={selectedPerson} />}

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
