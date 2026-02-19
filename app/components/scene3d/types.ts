export type MovementBehavior = 'idle' | 'run';
export type PeopleLayoutPreset = 'regular' | 'custom';

export type ModelOverride = {
  x: number;
  y: number;
  z: number;
  scale: number;
  rotX: number;
  rotY: number;
  rotZ: number;
};

export type PeopleViewTuning = {
  cameraX: number;
  cameraY: number;
  cameraZ: number;
  fov: number;
  fogNear: number;
  fogFar: number;
  characterScale: number;
  sceneOffsetX: number;
  sceneOffsetY: number;
  sceneRadius: number;
  ambientLightIntensity: number;
  directionalLightIntensity: number;
  directionalLightX: number;
  directionalLightY: number;
  directionalLightZ: number;
};

export type SceneTuning = {
  cameraX: number;
  cameraY: number;
  cameraZ: number;
  fov: number;
  fogNear: number;
  fogFar: number;
  characterScale: number;
  sceneOffsetX: number;
  sceneOffsetY: number;
  sceneWorldWidthPx: number;
  sceneWorldHeightPx: number;
  sceneViewportHeightVh: number;
  sceneRadius: number;
  ambientLightIntensity: number;
  directionalLightIntensity: number;
  directionalLightX: number;
  directionalLightY: number;
  directionalLightZ: number;
  preRunTurnSeconds: number;
  runDurationSeconds: number;
  peopleRunAnimationSpeed: number;
  peopleLineupSpacing: number;
  characterOverrides: Record<string, ModelOverride>;
  peopleCharacterOverrides: Record<string, ModelOverride>;
  peopleViewTuning: PeopleViewTuning;
  peopleHueColor: string;
  peopleLayoutPreset: PeopleLayoutPreset;
  peopleLayoutPresetNarrow: PeopleLayoutPreset;
  peopleLayoutColumns: number;
  peopleLayoutColumnsNarrow: number;
  fireOverride: ModelOverride;
  environmentOverrides: Record<string, ModelOverride>;
};
