import { useCallback, useEffect, useState } from 'react';
import {
  defaultSceneTuning,
  type ModelOverride,
  type PeopleViewTuning,
  type SceneTuning,
} from '../components/LandingScene3D';
import type { Mode } from '../types/navigation';

export type PeopleLayoutPreset = 'regular' | 'custom';
export type EditableModelId = string | 'fire';
export type NumericSceneTuningKey = Exclude<
  keyof SceneTuning,
  | 'characterOverrides'
  | 'peopleCharacterOverrides'
  | 'peopleViewTuning'
  | 'peopleHueColor'
  | 'peopleLayoutPreset'
  | 'peopleLayoutPresetNarrow'
  | 'fireOverride'
  | 'environmentOverrides'
>;

const sceneTuningStorageKey = 'gfl-scene-tuning-v1';

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

export const tuningFields: Array<{ key: NumericSceneTuningKey; label: string; min: number; max: number; step: number }> = [
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
  const [sceneTuning, setSceneTuning] = useState<SceneTuning>(defaultSceneTuning);

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
      if (mode === 'people' && peopleViewKeys.includes(key as keyof PeopleViewTuning)) {
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
    if (mode === 'people' && peopleViewKeys.includes(key as keyof PeopleViewTuning)) {
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

  const buildCompleteCharacterOverrides = useCallback((sceneMode: 'home' | 'people') => {
    return Object.fromEntries(sceneCharacters.map((character) => [character.id, getCharacterOverride(character.id, sceneMode)]));
  }, [getCharacterOverride, sceneCharacters]);

  const resetTuning = useCallback(() => {
    setSceneTuning(defaultSceneTuning);
  }, []);

  const copyTuningJson = useCallback(async () => {
    const exportPayload: SceneTuning = {
      ...sceneTuning,
      characterOverrides: buildCompleteCharacterOverrides('home'),
      peopleCharacterOverrides: buildCompleteCharacterOverrides('people'),
    };
    await navigator.clipboard.writeText(JSON.stringify(exportPayload, null, 2));
  }, [buildCompleteCharacterOverrides, sceneTuning]);

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
