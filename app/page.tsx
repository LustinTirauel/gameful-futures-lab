'use client';

import { useMemo, useState } from 'react';
import SceneTuningPanel from './components/SceneTuningPanel';
import { sceneTuningSliderFields } from './components/scene3d/tuningSchema';
import TopNav from './components/TopNav';
import HomeModeContent from './components/modes/HomeModeContent';
import PeopleModeContent from './components/modes/PeopleModeContent';
import ProjectsModeContent from './components/modes/ProjectsModeContent';
import SceneViewport from './components/modes/SceneViewport';
import { characterConfigs, people } from './data/content';
import { usePeopleScrollControls } from './hooks/usePeopleScrollControls';
import {
  type EditableModelId,
  modelFields,
  peopleLayoutOptions,
  useSceneTuning,
} from './hooks/useSceneTuning';
import type { Mode } from './types/app';
import type { ModelOverride } from './components/LandingScene3D';

const modeMovementBehavior: Record<Mode, 'idle' | 'run'> = {
  home: 'idle',
  people: 'run',
  projects: 'run',
};

const environmentModelIds = ['pond', 'tree-1', 'tree-2', 'tree-3', 'tree-4', 'tree-5', 'sauna', 'logs'] as const;

export default function Home() {
  // This is the top-level UI mode switch for the app (what major panel is currently active).
  const [mode, setMode] = useState<Mode>('home');
  // Stores which person's detail card/modal is open.
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  // Stores which project detail panel is open.
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  // Temporary "reaction" marker used for short bounce/feedback animations.
  const [reactionId, setReactionId] = useState<string | null>(null);
  // Safety flag: if the 3D runtime throws an error we can hide the scene cleanly.
  const [scene3DFailed, setScene3DFailed] = useState(false);
  // Enables/disables scene editing controls and drag interactions.
  const [editMode, setEditMode] = useState(false);
  // Which editable model is selected in edit mode (character, environment model, or fire).
  const [selectedModelId, setSelectedModelId] = useState<EditableModelId | null>(null);
  // Normalized progress value for people-mode scroll choreography (0 = start, 1 = end).
  const [peopleScrollProgress, setPeopleScrollProgress] = useState(0);
  // Lets users disable animation interpolation while still using manual scroll progression.
  const [peopleScrollAnimated, setPeopleScrollAnimated] = useState(true);
  // True when people mode has enabled custom wheel/touch handling.
  const [peopleScrollEnabled, setPeopleScrollEnabled] = useState(false);

  const sceneCharacters = useMemo(
    // Convert content data into the exact structure expected by the 3D scene component.
    () => people.map((person) => ({ id: person.id, name: person.name, config: characterConfigs[person.id] })),
    [],
  );
  const tuningFields = useMemo(
    // Show shared sliders + only the sliders relevant to the current mode.
    () => sceneTuningSliderFields.filter((field) => field.appliesTo === 'shared' || field.appliesTo === mode),
    [mode],
  );

  const {
    sceneTuning,
    getCharacterOverride,
    handleTuningChange,
    handlePeopleHueColorChange,
    handlePeopleLayoutPresetChange,
    handlePeopleLayoutColumnsChange,
    getTuningFieldValue,
    updateCharacterOverride,
    updateEnvironmentOverride,
    updateFireOverride,
    resetTuning,
    copyTuningJson,
  } = useSceneTuning({ mode, sceneCharacters });

  const selectedCharacter =
    // "fire" and environment models are not people, so only resolve character metadata for actual people IDs.
    selectedModelId && selectedModelId !== 'fire'
      ? sceneCharacters.find((character) => character.id === selectedModelId)
      : null;

  function handleModeChange(nextMode: Mode) {
    // Whenever mode changes, clear mode-specific selections to avoid stale UI state.
    setMode(nextMode);
    setSelectedPerson(null);
    setSelectedProject(null);
    // Custom people scrolling should reset when leaving people mode.
    if (nextMode !== 'people') {
      setPeopleScrollProgress(0);
      setPeopleScrollEnabled(false);
    }
  }

  function handleCharacterClick(personId: string) {
    // Trigger a short-lived reaction animation marker.
    setReactionId(personId);
    setTimeout(() => setReactionId(null), 500);
  }

  function handleToggleEditMode() {
    setEditMode((enabled) => {
      const next = !enabled;
      // Leaving edit mode clears selection so we don't keep stale model controls visible.
      if (!next) setSelectedModelId(null);
      return next;
    });
  }

  function getSelectedModelOverride(): ModelOverride | null {
    // No selection means no model-specific override to edit.
    if (!selectedModelId) return null;
    if (selectedModelId === 'fire') return sceneTuning.fireOverride;
    // Environment objects are stored separately from character overrides.
    if (environmentModelIds.includes(selectedModelId as (typeof environmentModelIds)[number])) {
      return sceneTuning.environmentOverrides[selectedModelId] ?? null;
    }
    return getCharacterOverride(selectedModelId);
  }

  function handleSelectedModelFieldChange(key: keyof ModelOverride, value: number) {
    // Guard clauses keep us from writing invalid/partial state.
    if (!selectedModelId) return;
    const current = getSelectedModelOverride();
    if (!current) return;
    // Create a copy with one changed field (immutable React state update pattern).
    const next = { ...current, [key]: value };

    if (selectedModelId === 'fire') {
      updateFireOverride(next);
    } else if (environmentModelIds.includes(selectedModelId as (typeof environmentModelIds)[number])) {
      updateEnvironmentOverride(selectedModelId, next);
    } else {
      updateCharacterOverride(selectedModelId, next);
    }
  }

  function nudgePeopleScrollProgress(delta: number) {
    // Clamp to [0, 1] so math in scene components always receives a safe normalized value.
    setPeopleScrollProgress((current) => Math.max(0, Math.min(1, current + delta)));
  }

  const peopleScrollActive = mode === 'people' && peopleScrollEnabled;
  const { onWheel, onTouchStart, onTouchMove } = usePeopleScrollControls({
    enabled: peopleScrollActive,
    onProgressDelta: nudgePeopleScrollProgress,
  });

  return (
    <main className="main" style={{ minHeight: '100vh' }}>
      <SceneViewport
        mode={mode}
        scene3DFailed={scene3DFailed}
        peopleScrollActive={peopleScrollActive}
        onWheel={onWheel}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        sceneCharacters={sceneCharacters}
        movementBehavior={modeMovementBehavior[mode]}
        onSceneRuntimeError={() => setScene3DFailed(true)}
        tuning={sceneTuning}
        editMode={editMode}
        selectedModelId={selectedModelId}
        onSelectModel={setSelectedModelId}
        onCharacterOverrideChange={updateCharacterOverride}
        onFireOverrideChange={updateFireOverride}
        onEnvironmentOverrideChange={updateEnvironmentOverride}
        onCharacterActivate={setSelectedPerson}
        peopleScrollProgress={peopleScrollProgress}
        peopleScrollAnimated={peopleScrollAnimated}
        onPeopleScrollEnabledChange={setPeopleScrollEnabled}
      />

      <TopNav mode={mode} onModeChange={handleModeChange} />
      <HomeModeContent mode={mode} editMode={editMode} />

      <SceneTuningPanel
        mode={mode}
        editMode={editMode}
        onToggleEditMode={handleToggleEditMode}
        sceneTuning={sceneTuning}
        peopleScrollAnimated={peopleScrollAnimated}
        onPeopleScrollAnimatedChange={setPeopleScrollAnimated}
        selectedModelId={selectedModelId}
        selectedModelLabel={selectedModelId === 'fire' ? 'fire' : selectedCharacter?.id ?? selectedModelId}
        selectedModelOverride={getSelectedModelOverride()}
        modelFields={modelFields}
        tuningFields={tuningFields}
        peopleLayoutOptions={peopleLayoutOptions}
        onPeopleHueColorChange={handlePeopleHueColorChange}
        onPeopleLayoutPresetChange={handlePeopleLayoutPresetChange}
        onPeopleLayoutColumnsChange={handlePeopleLayoutColumnsChange}
        onSelectedModelFieldChange={handleSelectedModelFieldChange}
        getTuningFieldValue={getTuningFieldValue}
        onTuningChange={handleTuningChange}
        onResetTuning={() => {
          resetTuning();
          setSelectedModelId(null);
        }}
        onCopyTuning={copyTuningJson}
      />

      <PeopleModeContent
        mode={mode}
        selectedPerson={selectedPerson}
        onClosePerson={() => setSelectedPerson(null)}
      />

      <ProjectsModeContent
        mode={mode}
        scene3DFailed={scene3DFailed}
        reactionId={reactionId}
        isRunning={modeMovementBehavior[mode] === 'run'}
        onReact={handleCharacterClick}
        onSelectPerson={setSelectedPerson}
        selectedProject={selectedProject}
        onProjectSelect={setSelectedProject}
      />

      <section className="future">
        <strong>Prepared for next versions:</strong>
        <ul>
          <li>Blog/news page with editable posts</li>
          <li>User-submitted project form with HTML sanitization</li>
          <li>BibTeX-driven publications page</li>
          <li>People tag filters with &quot;run away&quot; behavior</li>
        </ul>
      </section>
      <div className="vignette" />
    </main>
  );
}
