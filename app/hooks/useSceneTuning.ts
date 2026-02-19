import { useCallback, useEffect, useState } from 'react';
import {
  type ModelOverride,
  type PeopleViewTuning,
  type SceneTuning,
} from '../components/LandingScene3D';
import {
  buildCompleteOverrides,
  canonicalSceneTuningDefaults,
  loadStoredSceneTuning,
  persistSceneTuning,
  peopleViewTuningKeys,
  type NumericSceneTuningKey,
} from '../components/scene3d/tuningSchema';
import type { PeopleLayoutPreset } from '../components/scene3d/types';
import type { Mode } from '../types/app';
export type { NumericSceneTuningKey } from '../components/scene3d/tuningSchema';
export type EditableModelId = string | 'fire';

export const peopleLayoutOptions: Array<{ value: PeopleLayoutPreset; label: string }> = [
  { value: 'regular', label: 'Regular' },
  { value: 'custom', label: 'Custom (manual)' },
];

export const modelFields: Array<{ key: keyof ModelOverride; min: number; max: number; step: number }> = [
  { key: 'scale', min: 0.4, max: 1.8, step: 0.01 },
  { key: 'x', min: -20, max: 20, step: 0.05 },
  { key: 'y', min: -3, max: 3, step: 0.05 },
  { key: 'z', min: -20, max: 20, step: 0.05 },
  { key: 'rotX', min: -3.14, max: 3.14, step: 0.01 },
  { key: 'rotY', min: -3.14, max: 3.14, step: 0.01 },
  { key: 'rotZ', min: -3.14, max: 3.14, step: 0.01 },
];

type UseSceneTuningParams = {
  mode: Mode;
  sceneCharacters: Array<{ id: string; config: { position: [number, number, number]; rotation: [number, number, number] } }>;
};

export function useSceneTuning({ mode, sceneCharacters }: UseSceneTuningParams) {
  const [sceneTuning, setSceneTuning] = useState<SceneTuning>(canonicalSceneTuningDefaults);

  useEffect(() => {
    setSceneTuning(loadStoredSceneTuning(localStorage));
  }, []);

  useEffect(() => {
    persistSceneTuning(localStorage, sceneTuning);
  }, [sceneTuning]);

  const getDefaultCharacterOverride = useCallback(
    (characterId: string): ModelOverride => {
      const character = sceneCharacters.find((item) => item.id === characterId);
      const [x, y, z] = character?.config.position ?? [0, 0, 0];
      const [rotX, rotY, rotZ] = character?.config.rotation ?? [0, 0, 0];

      return { x, y, z, scale: 1, rotX, rotY, rotZ };
    },
    [sceneCharacters],
  );

  const getCharacterOverride = useCallback(
    (characterId: string, sceneMode: Mode = mode): ModelOverride => {
      const fallback = getDefaultCharacterOverride(characterId);
      if (sceneMode === 'people') return sceneTuning.peopleCharacterOverrides[characterId] ?? fallback;
      return sceneTuning.characterOverrides[characterId] ?? fallback;
    },
    [getDefaultCharacterOverride, mode, sceneTuning.characterOverrides, sceneTuning.peopleCharacterOverrides],
  );

  const handleTuningChange = useCallback((key: NumericSceneTuningKey, value: number) => {
    setSceneTuning((current) => {
      if (mode === 'people' && peopleViewTuningKeys.includes(key as keyof PeopleViewTuning)) {
        const peopleKey = key as keyof PeopleViewTuning;
        return {
          ...current,
          peopleViewTuning: { ...current.peopleViewTuning, [peopleKey]: value },
        };
      }
      return { ...current, [key]: value };
    });
  }, [mode]);

  const getTuningFieldValue = useCallback((key: NumericSceneTuningKey): number => {
    if (mode === 'people' && peopleViewTuningKeys.includes(key as keyof PeopleViewTuning)) {
      return sceneTuning.peopleViewTuning[key as keyof PeopleViewTuning];
    }
    return sceneTuning[key];
  }, [mode, sceneTuning]);

  const handlePeopleHueColorChange = useCallback((value: string) => {
    setSceneTuning((current) => ({ ...current, peopleHueColor: value }));
  }, []);

  const handlePeopleLayoutPresetChange = useCallback((key: 'peopleLayoutPreset' | 'peopleLayoutPresetNarrow', value: PeopleLayoutPreset) => {
    setSceneTuning((current) => ({ ...current, [key]: value }));
  }, []);

  const handlePeopleLayoutColumnsChange = useCallback((key: 'peopleLayoutColumns' | 'peopleLayoutColumnsNarrow', value: number) => {
    const next = Math.max(1, Math.min(6, Math.round(value)));
    setSceneTuning((current) => ({ ...current, [key]: next }));
  }, []);

  const updateCharacterOverride = useCallback((characterId: string, nextOverride: ModelOverride) => {
    setSceneTuning((current) => {
      if (mode === 'people') {
        return {
          ...current,
          peopleCharacterOverrides: { ...current.peopleCharacterOverrides, [characterId]: nextOverride },
        };
      }

      return {
        ...current,
        characterOverrides: { ...current.characterOverrides, [characterId]: nextOverride },
      };
    });
  }, [mode]);

  const updateEnvironmentOverride = useCallback((modelId: string, nextOverride: ModelOverride) => {
    setSceneTuning((current) => ({
      ...current,
      environmentOverrides: { ...current.environmentOverrides, [modelId]: nextOverride },
    }));
  }, []);

  const updateFireOverride = useCallback((nextOverride: ModelOverride) => {
    setSceneTuning((current) => ({ ...current, fireOverride: nextOverride }));
  }, []);

  const buildCompleteCharacterOverrides = useCallback(
    (sceneMode: 'home' | 'people') => {
      const ids = sceneCharacters.map((character) => character.id);
      const baseById = Object.fromEntries(
        sceneCharacters.map((character) => [character.id, getDefaultCharacterOverride(character.id)]),
      );
      const editsById = sceneMode === 'people' ? sceneTuning.peopleCharacterOverrides : sceneTuning.characterOverrides;
      return buildCompleteOverrides(ids, baseById, editsById);
    },
    [getDefaultCharacterOverride, sceneCharacters, sceneTuning.characterOverrides, sceneTuning.peopleCharacterOverrides],
  );

  const buildCompleteEnvironmentOverrides = useCallback(() => {
    const environmentIds = Object.keys(canonicalSceneTuningDefaults.environmentOverrides);
    return buildCompleteOverrides(
      environmentIds,
      canonicalSceneTuningDefaults.environmentOverrides,
      sceneTuning.environmentOverrides,
    );
  }, [sceneTuning.environmentOverrides]);

  const resetTuning = useCallback(() => {
    setSceneTuning(canonicalSceneTuningDefaults);
  }, []);

  const copyTuningJson = useCallback(async () => {
    const exportPayload: SceneTuning = {
      ...sceneTuning,
      characterOverrides: buildCompleteCharacterOverrides('home'),
      peopleCharacterOverrides: buildCompleteCharacterOverrides('people'),
      environmentOverrides: buildCompleteEnvironmentOverrides(),
    };
    await navigator.clipboard.writeText(JSON.stringify(exportPayload, null, 2));
  }, [buildCompleteCharacterOverrides, buildCompleteEnvironmentOverrides, sceneTuning]);

  return {
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
  };
}
