import { defaultSceneTuning } from './defaults';
import type { ModelOverride, PeopleViewTuning, SceneTuning } from './types';

export const SCENE_TUNING_STORAGE_VERSION = 2;
const LEGACY_SCENE_TUNING_STORAGE_KEY = 'gfl-scene-tuning-v1';
const SCENE_TUNING_STORAGE_KEY = `gfl-scene-tuning-v${SCENE_TUNING_STORAGE_VERSION}`;

type NonNumericSceneTuningKey =
  | 'characterOverrides'
  | 'peopleCharacterOverrides'
  | 'peopleViewTuning'
  | 'peopleHueColor'
  | 'peopleLayoutPreset'
  | 'peopleLayoutPresetNarrow'
  | 'peopleLayoutColumns'
  | 'peopleLayoutColumnsNarrow'
  | 'fireOverride'
  | 'environmentOverrides';

export type NumericSceneTuningKey = Exclude<keyof SceneTuning, NonNumericSceneTuningKey>;

export type TuningSliderField = {
  key: NumericSceneTuningKey;
  label: string;
  min: number;
  max: number;
  step: number;
  appliesTo: 'shared' | 'home' | 'people';
};

export const peopleViewTuningKeys: Array<keyof PeopleViewTuning> = [
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

export const sceneTuningSliderFields: TuningSliderField[] = [
  { key: 'cameraX', label: 'Camera X', min: 2, max: 14, step: 0.1, appliesTo: 'shared' },
  { key: 'cameraY', label: 'Camera Y', min: 1.5, max: 12, step: 0.1, appliesTo: 'shared' },
  { key: 'cameraZ', label: 'Camera Z (distance)', min: 2, max: 14, step: 0.1, appliesTo: 'shared' },
  { key: 'fov', label: 'FOV', min: 18, max: 60, step: 1, appliesTo: 'shared' },
  { key: 'fogNear', label: 'Fog Near', min: 1, max: 28, step: 0.5, appliesTo: 'shared' },
  { key: 'fogFar', label: 'Fog Far', min: 8, max: 60, step: 0.5, appliesTo: 'shared' },
  { key: 'characterScale', label: 'Character Scale', min: 0.4, max: 1.4, step: 0.01, appliesTo: 'shared' },
  { key: 'sceneOffsetX', label: 'Scene Offset X (%)', min: -40, max: 20, step: 0.5, appliesTo: 'shared' },
  { key: 'sceneOffsetY', label: 'Scene Offset Y (%)', min: -30, max: 25, step: 0.5, appliesTo: 'shared' },
  { key: 'sceneRadius', label: 'Scene Size / Radius', min: 6, max: 120, step: 1, appliesTo: 'shared' },
  { key: 'ambientLightIntensity', label: 'Ambient Light Intensity', min: 0, max: 2.5, step: 0.05, appliesTo: 'shared' },
  { key: 'directionalLightIntensity', label: 'Directional Light Intensity', min: 0, max: 3, step: 0.05, appliesTo: 'shared' },
  { key: 'directionalLightX', label: 'Light Direction X', min: -20, max: 20, step: 0.1, appliesTo: 'shared' },
  { key: 'directionalLightY', label: 'Light Direction Y', min: -20, max: 20, step: 0.1, appliesTo: 'shared' },
  { key: 'directionalLightZ', label: 'Light Direction Z', min: -20, max: 20, step: 0.1, appliesTo: 'shared' },
  { key: 'preRunTurnSeconds', label: 'People pre-run turn (s)', min: 0, max: 4, step: 0.05, appliesTo: 'people' },
  { key: 'runDurationSeconds', label: 'People run duration (s)', min: 0.5, max: 10, step: 0.1, appliesTo: 'people' },
  { key: 'peopleRunAnimationSpeed', label: 'People run animation speed', min: 0.6, max: 3, step: 0.05, appliesTo: 'people' },
  { key: 'peopleLineupSpacing', label: 'People lineup spacing', min: 0.2, max: 0.7, step: 0.01, appliesTo: 'people' },
];

export const canonicalSceneTuningDefaults: SceneTuning = defaultSceneTuning;

export function resolveTuningFieldValue(tuning: SceneTuning, key: NumericSceneTuningKey, mode: 'home' | 'people'): number {
  if (mode === 'people' && peopleViewTuningKeys.includes(key as keyof PeopleViewTuning)) {
    return tuning.peopleViewTuning[key as keyof PeopleViewTuning];
  }
  return tuning[key];
}

function mergeSceneTuning(base: SceneTuning, parsed: Partial<SceneTuning>): SceneTuning {
  return {
    ...base,
    ...parsed,
    characterOverrides: {
      ...base.characterOverrides,
      ...(parsed.characterOverrides ?? {}),
    },
    peopleCharacterOverrides: {
      ...base.peopleCharacterOverrides,
      ...(parsed.peopleCharacterOverrides ?? {}),
    },
    peopleViewTuning: {
      ...base.peopleViewTuning,
      ...(parsed.peopleViewTuning ?? {}),
    },
    peopleHueColor: parsed.peopleHueColor ?? base.peopleHueColor,
    fireOverride: {
      ...base.fireOverride,
      ...(parsed.fireOverride ?? {}),
    },
    environmentOverrides: {
      ...base.environmentOverrides,
      ...(parsed.environmentOverrides ?? {}),
    },
  };
}

type SceneTuningStorageEnvelope = {
  version: number;
  tuning: Partial<SceneTuning>;
};

function migrateLegacySceneTuningPayload(payload: unknown): Partial<SceneTuning> | null {
  if (!payload || typeof payload !== 'object') return null;
  return payload as Partial<SceneTuning>;
}

export function loadStoredSceneTuning(storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>): SceneTuning {
  const v2Raw = storage.getItem(SCENE_TUNING_STORAGE_KEY);
  if (v2Raw) {
    try {
      const envelope = JSON.parse(v2Raw) as SceneTuningStorageEnvelope;
      if (envelope?.version === SCENE_TUNING_STORAGE_VERSION && envelope.tuning) {
        return mergeSceneTuning(canonicalSceneTuningDefaults, envelope.tuning);
      }
    } catch {
      // Keep trying older payloads.
    }
  }

  const v1Raw = storage.getItem(LEGACY_SCENE_TUNING_STORAGE_KEY);
  if (!v1Raw) return canonicalSceneTuningDefaults;

  try {
    const legacyPayload = migrateLegacySceneTuningPayload(JSON.parse(v1Raw));
    if (!legacyPayload) return canonicalSceneTuningDefaults;
    const migrated = mergeSceneTuning(canonicalSceneTuningDefaults, legacyPayload);
    persistSceneTuning(storage, migrated);
    storage.removeItem(LEGACY_SCENE_TUNING_STORAGE_KEY);
    return migrated;
  } catch {
    return canonicalSceneTuningDefaults;
  }
}

export function persistSceneTuning(storage: Pick<Storage, 'setItem'>, tuning: SceneTuning): void {
  const envelope: SceneTuningStorageEnvelope = {
    version: SCENE_TUNING_STORAGE_VERSION,
    tuning,
  };
  storage.setItem(SCENE_TUNING_STORAGE_KEY, JSON.stringify(envelope));
}

export function buildCompleteOverrides<T extends string>(
  ids: T[],
  baseById: Record<T, ModelOverride>,
  editsById: Record<string, ModelOverride>,
): Record<T, ModelOverride> {
  return Object.fromEntries(ids.map((id) => [id, editsById[id] ?? baseById[id]])) as Record<T, ModelOverride>;
}
