'use client';

import { useMemo, useState } from 'react';
import SceneTuningPanel from './components/SceneTuningPanel';
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
  tuningFields,
  useSceneTuning,
} from './hooks/useSceneTuning';
import type { Mode } from './types/navigation';
import type { ModelOverride } from './components/LandingScene3D';

const modeMovementBehavior: Record<Mode, 'idle' | 'run'> = {
  home: 'idle',
  people: 'run',
  projects: 'run',
};

const environmentModelIds = ['pond', 'tree-1', 'tree-2', 'tree-3', 'tree-4', 'tree-5', 'sauna', 'logs'] as const;

export default function Home() {
  const [mode, setMode] = useState<Mode>('home');
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [reactionId, setReactionId] = useState<string | null>(null);
  const [scene3DFailed, setScene3DFailed] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState<EditableModelId | null>(null);
  const [peopleScrollProgress, setPeopleScrollProgress] = useState(0);
  const [peopleScrollAnimated, setPeopleScrollAnimated] = useState(true);
  const [peopleScrollEnabled, setPeopleScrollEnabled] = useState(false);

  const sceneCharacters = useMemo(
    () => people.map((person) => ({ id: person.id, name: person.name, config: characterConfigs[person.id] })),
    [],
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
    selectedModelId && selectedModelId !== 'fire'
      ? sceneCharacters.find((character) => character.id === selectedModelId)
      : null;

  function handleModeChange(nextMode: Mode) {
    setMode(nextMode);
    setSelectedPerson(null);
    setSelectedProject(null);
    if (nextMode !== 'people') {
      setPeopleScrollProgress(0);
      setPeopleScrollEnabled(false);
    }
  }

  function handleCharacterClick(personId: string) {
    setReactionId(personId);
    setTimeout(() => setReactionId(null), 500);
  }

  function handleToggleEditMode() {
    setEditMode((enabled) => {
      const next = !enabled;
      if (!next) setSelectedModelId(null);
      return next;
    });
  }

  function getSelectedModelOverride(): ModelOverride | null {
    if (!selectedModelId) return null;
    if (selectedModelId === 'fire') return sceneTuning.fireOverride;
    if (environmentModelIds.includes(selectedModelId as (typeof environmentModelIds)[number])) {
      return sceneTuning.environmentOverrides[selectedModelId] ?? null;
    }
    return getCharacterOverride(selectedModelId);
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

  function nudgePeopleScrollProgress(delta: number) {
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
          <li>People tag filters with "run away" behavior</li>
        </ul>
      </section>
      <div className="vignette" />
    </main>
  );
}
