'use client';

import { useEffect, useMemo, useState } from 'react';
import CharacterLayer from './components/CharacterLayer';
import LandingScene3D, {
  defaultSceneTuning,
  type ModelOverride,
  type PeopleViewTuning,
  type SceneTuning,
} from './components/LandingScene3D';
import PeopleModal from './components/PeopleModal';
import ProjectsLayer from './components/ProjectsLayer';
import TopNav from './components/TopNav';
import { characterConfigs, people, projects } from './data/content';

type Mode = 'home' | 'people' | 'projects';
type PeopleLayoutPreset = 'regular' | 'custom';
type EditableModelId = string | 'fire';
type NumericSceneTuningKey = Exclude<keyof SceneTuning, 'characterOverrides' | 'peopleCharacterOverrides' | 'peopleViewTuning' | 'peopleHueColor' | 'peopleLayoutPreset' | 'peopleLayoutPresetNarrow' | 'fireOverride' | 'environmentOverrides'>;

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
  { key: 'sceneViewportHeightVh', label: 'Scene Reveal Height (vh)', min: 35, max: 300, step: 1 },
  { key: 'sceneOffsetX', label: 'Scene Offset X (%)', min: -40, max: 20, step: 0.5 },
  { key: 'sceneOffsetY', label: 'Scene Offset Y (%)', min: -30, max: 25, step: 0.5 },
  { key: 'sceneRadius', label: 'Scene Size / Radius', min: 6, max: 120, step: 1 },
  { key: 'ambientLightIntensity', label: 'Ambient Light Intensity', min: 0, max: 2.5, step: 0.05 },
  { key: 'directionalLightIntensity', label: 'Directional Light Intensity', min: 0, max: 3, step: 0.05 },
  { key: 'directionalLightX', label: 'Light Direction X', min: -20, max: 20, step: 0.1 },
  { key: 'directionalLightY', label: 'Light Direction Y', min: -20, max: 20, step: 0.1 },
  { key: 'directionalLightZ', label: 'Light Direction Z', min: -20, max: 20, step: 0.1 },
  { key: 'preRunTurnSeconds', label: 'People pre-run turn (s)', min: 0, max: 4, step: 0.05 },
  { key: 'runDurationSeconds', label: 'People run duration (s)', min: 0.5, max: 10, step: 0.1 },
  { key: 'peopleRunAnimationSpeed', label: 'People run animation speed', min: 0.6, max: 3, step: 0.05 },
  { key: 'peopleLineupSpacing', label: 'People lineup spacing', min: 0.2, max: 0.7, step: 0.01 },
];


const peopleViewKeys: Array<keyof PeopleViewTuning> = [
  'cameraX',
  'cameraY',
  'cameraZ',
  'fov',
  'fogNear',
  'fogFar',
  'characterScale',
  'sceneOffsetX',
  'sceneOffsetY',
  'sceneRadius',
  'ambientLightIntensity',
  'directionalLightIntensity',
  'directionalLightX',
  'directionalLightY',
  'directionalLightZ',
];


const peopleLayoutOptions: Array<{ value: PeopleLayoutPreset; label: string }> = [
  { value: 'regular', label: 'Regular' },
  { value: 'custom', label: 'Custom (manual)' },
];


const environmentModelIds = ['pond', 'tree-1', 'tree-2', 'tree-3', 'tree-4', 'tree-5', 'sauna', 'logs'] as const;

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
        peopleCharacterOverrides: {
          ...current.peopleCharacterOverrides,
          ...(parsed.peopleCharacterOverrides ?? {}),
        },
        peopleViewTuning: {
          ...current.peopleViewTuning,
          ...(parsed.peopleViewTuning ?? {}),
        },
        peopleHueColor: parsed.peopleHueColor ?? current.peopleHueColor,
        fireOverride: {
          ...current.fireOverride,
          ...(parsed.fireOverride ?? {}),
        },
        environmentOverrides: {
          ...current.environmentOverrides,
          ...(parsed.environmentOverrides ?? {}),
        },
      }));
    } catch {
      // Keep defaults when saved JSON is invalid.
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(sceneTuningStorageKey, JSON.stringify(sceneTuning));
  }, [sceneTuning]);


  const sceneCharacters = useMemo(
    () => people.map((person) => ({ id: person.id, name: person.name, config: characterConfigs[person.id] })),
    [],
  );

  const selectedCharacter =
    selectedModelId && selectedModelId !== 'fire'
      ? sceneCharacters.find((character) => character.id === selectedModelId)
      : null;


  const selectedPersonData = selectedPerson ? people.find((person) => person.id === selectedPerson) ?? null : null;
  const selectedPersonProjects = selectedPerson
    ? projects.filter((project) => project.memberIds.includes(selectedPerson))
    : [];

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
    setSceneTuning((current) => {
      if (mode === 'people' && peopleViewKeys.includes(key as keyof PeopleViewTuning)) {
        const peopleKey = key as keyof PeopleViewTuning;
        return {
          ...current,
          peopleViewTuning: {
            ...current.peopleViewTuning,
            [peopleKey]: value,
          },
        };
      }

      return { ...current, [key]: value };
    });
  }


  function handlePeopleHueColorChange(value: string) {
    setSceneTuning((current) => ({ ...current, peopleHueColor: value }));
  }

  function handlePeopleLayoutPresetChange(key: 'peopleLayoutPreset' | 'peopleLayoutPresetNarrow', value: PeopleLayoutPreset) {
    setSceneTuning((current) => ({ ...current, [key]: value }));
  }

  function handlePeopleLayoutColumnsChange(key: 'peopleLayoutColumns' | 'peopleLayoutColumnsNarrow', value: number) {
    const next = Math.max(1, Math.min(6, Math.round(value)));
    setSceneTuning((current) => ({ ...current, [key]: next }));
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


  function getDefaultCharacterOverride(characterId: string): ModelOverride {
    const character = sceneCharacters.find((item) => item.id === characterId);
    const [x, y, z] = character?.config.position ?? [0, 0, 0];
    const [rotX, rotY, rotZ] = character?.config.rotation ?? [0, 0, 0];

    return {
      x,
      y,
      z,
      scale: 1,
      rotX,
      rotY,
      rotZ,
    };
  }

  function getCharacterOverride(characterId: string, sceneMode: Mode = mode): ModelOverride {
    const fallback = getDefaultCharacterOverride(characterId);
    if (sceneMode === 'people') {
      return sceneTuning.peopleCharacterOverrides[characterId] ?? fallback;
    }
    return sceneTuning.characterOverrides[characterId] ?? fallback;
  }

  function buildCompleteCharacterOverrides(sceneMode: 'home' | 'people'): Record<string, ModelOverride> {
    return Object.fromEntries(
      sceneCharacters.map((character) => [character.id, getCharacterOverride(character.id, sceneMode)]),
    );
  }

  async function handleTuningCopy() {
    const exportPayload: SceneTuning = {
      ...sceneTuning,
      characterOverrides: buildCompleteCharacterOverrides('home'),
      peopleCharacterOverrides: buildCompleteCharacterOverrides('people'),
    };
    await navigator.clipboard.writeText(JSON.stringify(exportPayload, null, 2));
  }


  function getTuningFieldValue(key: NumericSceneTuningKey): number {
    if (mode === 'people' && peopleViewKeys.includes(key as keyof PeopleViewTuning)) {
      return sceneTuning.peopleViewTuning[key as keyof PeopleViewTuning];
    }
    return sceneTuning[key];
  }

  function getSelectedModelOverride(): ModelOverride | null {
    if (!selectedModelId) return null;
    if (selectedModelId === 'fire') return sceneTuning.fireOverride;
    if (environmentModelIds.includes(selectedModelId as (typeof environmentModelIds)[number])) {
      return sceneTuning.environmentOverrides[selectedModelId] ?? null;
    }
    return getCharacterOverride(selectedModelId);
  }

  function updateCharacterOverride(characterId: string, nextOverride: ModelOverride) {
    setSceneTuning((current) => {
      if (mode === 'people') {
        return {
          ...current,
          peopleCharacterOverrides: {
            ...current.peopleCharacterOverrides,
            [characterId]: nextOverride,
          },
        };
      }

      return {
        ...current,
        characterOverrides: {
          ...current.characterOverrides,
          [characterId]: nextOverride,
        },
      };
    });
  }

  function updateEnvironmentOverride(modelId: string, nextOverride: ModelOverride) {
    setSceneTuning((current) => ({
      ...current,
      environmentOverrides: {
        ...current.environmentOverrides,
        [modelId]: nextOverride,
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
    } else if (environmentModelIds.includes(selectedModelId as (typeof environmentModelIds)[number])) {
      updateEnvironmentOverride(selectedModelId, next);
    } else {
      updateCharacterOverride(selectedModelId, next);
    }
  }

  return (
    <main className="main" style={{ minHeight: `${Math.max(100, sceneTuning.sceneViewportHeightVh)}vh` }}>
      {(mode === 'home' || mode === 'people') && !scene3DFailed && (
        <div className="scene-viewport" style={{ height: `${sceneTuning.sceneViewportHeightVh}vh` }}>
          <LandingScene3D
            characters={sceneCharacters}
            movementBehavior={modeMovementBehavior[mode]}
            mode={mode}
            onRuntimeError={handleSceneRuntimeError}
            tuning={sceneTuning}
            editMode={editMode}
            selectedModelId={selectedModelId}
            onSelectModel={(id) => setSelectedModelId(id as EditableModelId)}
            onCharacterOverrideChange={updateCharacterOverride}
            onFireOverrideChange={updateFireOverride}
            onEnvironmentOverrideChange={updateEnvironmentOverride}
            onCharacterActivate={handleCharacterSelect}
          />
        </div>
      )}

      <TopNav mode={mode} onModeChange={handleModeChange} />

      {mode === 'home' && !editMode && (
        <div className="center-copy">
          <h1>Gameful Futures Lab</h1>
          <p>We build futures through games and play!</p>
        </div>
      )}

      {(mode === 'home' || mode === 'people') && (
        <>
          <button className="tuning-toggle" onClick={handleToggleEditMode}>
            {editMode ? 'Close edit mode' : `Edit ${mode === 'people' ? 'people' : 'home'} scene`}
          </button>

          {editMode && (
            <aside className="tuning-panel">
              <h3>{mode === 'people' ? 'People scene edit mode' : 'Scene edit mode'}</h3>
              <p>Drag models in X/Z, then fine tune with sliders. Values auto-save.</p>

              {mode === 'people' && (
                <>
                  <label>
                    <span>People hue color</span>
                    <input
                      type="color"
                      value={sceneTuning.peopleHueColor}
                      onChange={(event) => handlePeopleHueColorChange(event.target.value)}
                    />
                  </label>

                  <label>
                    <span>People layout (desktop/wide)</span>
                    <select
                      value={sceneTuning.peopleLayoutPreset}
                      onChange={(event) =>
                        handlePeopleLayoutPresetChange('peopleLayoutPreset', event.target.value as PeopleLayoutPreset)
                      }
                    >
                      {peopleLayoutOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  {sceneTuning.peopleLayoutPreset !== 'custom' && (
                    <label>
                      <span>People columns (desktop/wide)</span>
                      <input
                        type="number"
                        min={1}
                        max={6}
                        step={1}
                        value={sceneTuning.peopleLayoutColumns}
                        onChange={(event) =>
                          handlePeopleLayoutColumnsChange('peopleLayoutColumns', Number(event.target.value))
                        }
                      />
                    </label>
                  )}

                  <label>
                    <span>People layout (mobile/narrow)</span>
                    <select
                      value={sceneTuning.peopleLayoutPresetNarrow}
                      onChange={(event) =>
                        handlePeopleLayoutPresetChange('peopleLayoutPresetNarrow', event.target.value as PeopleLayoutPreset)
                      }
                    >
                      {peopleLayoutOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  {sceneTuning.peopleLayoutPresetNarrow !== 'custom' && (
                    <label>
                      <span>People columns (mobile/narrow)</span>
                      <input
                        type="number"
                        min={1}
                        max={6}
                        step={1}
                        value={sceneTuning.peopleLayoutColumnsNarrow}
                        onChange={(event) =>
                          handlePeopleLayoutColumnsChange('peopleLayoutColumnsNarrow', Number(event.target.value))
                        }
                      />
                    </label>
                  )}
                </>
              )}


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
                      value={getTuningFieldValue(field.key)}
                      onChange={(event) => handleTuningChange(field.key, Number(event.target.value))}
                    />
                    <strong>{getTuningFieldValue(field.key).toFixed(2)}</strong>
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

      {(mode === 'projects' || scene3DFailed) && (
        <CharacterLayer
          mode={mode}
          reactionId={reactionId}
          isRunning={modeMovementBehavior[mode] === 'run'}
          onReact={handleCharacterClick}
          onSelectPerson={handleCharacterSelect}
        />
      )}

      {mode === 'people' && selectedPersonData && (
        <PeopleModal
          person={selectedPersonData}
          projects={selectedPersonProjects}
          onClose={() => setSelectedPerson(null)}
        />
      )}

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
