'use client';

import { Canvas } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Color } from 'three';
import type { CharacterConfig } from '../lib/characterOptions';
import type { Mode } from '../types/app';
import CameraController from './scene3d/CameraController';
import { defaultSceneTuning } from './scene3d/defaults';
import DraggableCharacter from './scene3d/DraggableCharacter';
import DraggableFire from './scene3d/DraggableFire';
import EnvironmentProps from './scene3d/EnvironmentProps';
import {
  getPeopleLayoutNdc,
  getSceneLayerRect,
  getScreenSouthYaw,
  ndcToSceneLayerPixels,
  projectGroundToNdc,
  projectNdcToGround,
} from './scene3d/math';
import NamePlate3D from './scene3d/NamePlate3D';
import type { ModelOverride, MovementBehavior, PeopleViewTuning, SceneTuning } from './scene3d/types';

export type { ModelOverride, MovementBehavior, PeopleViewTuning, SceneTuning } from './scene3d/types';
export { defaultSceneTuning } from './scene3d/defaults';

function lerpNumber(from: number, to: number, progress: number): number {
  return from + (to - from) * progress;
}

export type SceneDebugNameplateInfo = {
  id: string;
  name: string;
  worldX: number;
  worldY: number;
  worldZ: number;
  ndcX: number;
  ndcY: number;
  screenX: number;
  screenY: number;
  bottomNdcY: number;
  screenBottomY: number;
};

export type SceneDebugInfo = {
  viewportWidthPx: number;
  viewportHeightPx: number;
  sceneLayerTopPx: number;
  sceneLayerBottomPx: number;
  triggerBottomPx: number;
  stopBottomPx: number;
  nameplates: SceneDebugNameplateInfo[];
};

type LandingScene3DProps = {
  characters: Array<{ id: string; name: string; config: CharacterConfig }>;
  movementBehavior?: MovementBehavior;
  mode?: Mode;
  onRuntimeError?: () => void;
  tuning?: SceneTuning;
  editMode?: boolean;
  selectedModelId?: string | null;
  onSelectModel?: (modelId: string) => void;
  onCharacterOverrideChange?: (characterId: string, override: ModelOverride) => void;
  onEnvironmentOverrideChange?: (modelId: string, override: ModelOverride) => void;
  onFireOverrideChange?: (override: ModelOverride) => void;
  onCharacterActivate?: (characterId: string) => void;
  peopleScrollProgress?: number;
  peopleScrollAnimated?: boolean;
  onPeopleScrollEnabledChange?: (enabled: boolean) => void;
  onDebugInfoChange?: (info: SceneDebugInfo) => void;
};

export default function LandingScene3D({
  characters,
  movementBehavior = 'idle',
  mode = 'home',
  onRuntimeError,
  tuning = defaultSceneTuning,
  editMode = false,
  selectedModelId = null,
  onSelectModel,
  onCharacterOverrideChange,
  onFireOverrideChange,
  onEnvironmentOverrideChange,
  onCharacterActivate,
  peopleScrollProgress = 0,
  peopleScrollAnimated = true,
  onPeopleScrollEnabledChange,
  onDebugInfoChange,
}: LandingScene3DProps) {
  const [isWebGLAvailable, setIsWebGLAvailable] = useState<boolean | null>(null);
  const runtimeErrorHandlerRef = useRef(onRuntimeError);

  useEffect(() => {
    runtimeErrorHandlerRef.current = onRuntimeError;
  }, [onRuntimeError]);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
      const available = Boolean(context);
      setIsWebGLAvailable(available);

      if (!available) {
        runtimeErrorHandlerRef.current?.();
      }
    } catch {
      setIsWebGLAvailable(false);
      runtimeErrorHandlerRef.current?.();
    }
  }, []);

  const orderedCharacters = useMemo(
    () => [...characters].sort((a, b) => a.id.localeCompare(b.id)),
    [characters],
  );

  const isPeopleMode = mode === 'people';
  const [isNarrowViewport, setIsNarrowViewport] = useState(false);
  const [viewportWidthPx, setViewportWidthPx] = useState(1400);
  const [viewportHeightPx, setViewportHeightPx] = useState(900);

  useEffect(() => {
    const update = () => {
      setIsNarrowViewport(window.innerWidth < 920);
      setViewportWidthPx(window.innerWidth);
      setViewportHeightPx(window.innerHeight);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  const preRunTurnSeconds = tuning.preRunTurnSeconds;
  const runDurationSeconds = tuning.runDurationSeconds;
  const totalTransitionSeconds = Math.max(0.01, preRunTurnSeconds + runDurationSeconds);
  const [peopleTransitionProgress, setPeopleTransitionProgress] = useState(0);

  const peopleTargetTuning = tuning.peopleViewTuning;

  const effectiveTuning = {
    cameraX: lerpNumber(tuning.cameraX, peopleTargetTuning.cameraX, peopleTransitionProgress),
    cameraY: lerpNumber(tuning.cameraY, peopleTargetTuning.cameraY, peopleTransitionProgress),
    cameraZ: lerpNumber(tuning.cameraZ, peopleTargetTuning.cameraZ, peopleTransitionProgress),
    fov: lerpNumber(tuning.fov, peopleTargetTuning.fov, peopleTransitionProgress),
    fogNear: lerpNumber(tuning.fogNear, peopleTargetTuning.fogNear, peopleTransitionProgress),
    fogFar: lerpNumber(tuning.fogFar, peopleTargetTuning.fogFar, peopleTransitionProgress),
    characterScale: lerpNumber(tuning.characterScale, peopleTargetTuning.characterScale, peopleTransitionProgress),
    sceneOffsetX: lerpNumber(tuning.sceneOffsetX, peopleTargetTuning.sceneOffsetX, peopleTransitionProgress),
    sceneOffsetY: lerpNumber(tuning.sceneOffsetY, peopleTargetTuning.sceneOffsetY, peopleTransitionProgress),
    sceneRadius: lerpNumber(tuning.sceneRadius, peopleTargetTuning.sceneRadius, peopleTransitionProgress),
    ambientLightIntensity: lerpNumber(
      tuning.ambientLightIntensity,
      peopleTargetTuning.ambientLightIntensity,
      peopleTransitionProgress,
    ),
    directionalLightIntensity: lerpNumber(
      tuning.directionalLightIntensity,
      peopleTargetTuning.directionalLightIntensity,
      peopleTransitionProgress,
    ),
    directionalLightX: lerpNumber(tuning.directionalLightX, peopleTargetTuning.directionalLightX, peopleTransitionProgress),
    directionalLightY: lerpNumber(tuning.directionalLightY, peopleTargetTuning.directionalLightY, peopleTransitionProgress),
    directionalLightZ: lerpNumber(tuning.directionalLightZ, peopleTargetTuning.directionalLightZ, peopleTransitionProgress),
  };
  const activeLayoutPreset = isNarrowViewport ? tuning.peopleLayoutPresetNarrow : tuning.peopleLayoutPreset;
  const activeLayoutColumns = isNarrowViewport ? tuning.peopleLayoutColumnsNarrow : tuning.peopleLayoutColumns;
  const totalRows = Math.max(1, Math.ceil(orderedCharacters.length / Math.max(1, activeLayoutColumns)));
  const maxPeopleRowOffset = Math.max(0, totalRows - 1);
  const triggerBottomMarginPx = 10;
  const stopAtScreenYpx = 600;
  const nameplateForwardOffset = 0.62;
  const nameplateBottomOffsetY = -0.025;
  const sceneLayerRect = getSceneLayerRect(
    viewportWidthPx,
    viewportHeightPx,
    tuning.sceneWorldWidthPx,
    tuning.sceneWorldHeightPx,
    effectiveTuning.sceneOffsetX,
    effectiveTuning.sceneOffsetY,
  );
  const viewportBottomPx = viewportHeightPx;
  const triggerBottomPx = viewportBottomPx - triggerBottomMarginPx;
  const stopBottomPx = stopAtScreenYpx;
  const sceneNdcPerPixelY = 2 / Math.max(1, sceneLayerRect.height);
  const peopleSouthFacingY = getScreenSouthYaw(
    peopleTargetTuning.cameraX,
    peopleTargetTuning.cameraY,
    peopleTargetTuning.cameraZ,
    peopleTargetTuning.fov,
  );

  const getRegularLayoutBottommostScreenY = (rowOffset: number): number => {
    let maxBottomPx = Number.NEGATIVE_INFINITY;

    for (let index = 0; index < orderedCharacters.length; index += 1) {
      const character = orderedCharacters[index];
      const [baseX, baseY, baseZ] = character.config.position;
      const homeOverride = tuning.characterOverrides[character.id] ?? {
        x: baseX,
        y: baseY,
        z: baseZ,
        scale: 1,
      };
      const layoutNdc = getPeopleLayoutNdc(
        index,
        orderedCharacters.length,
        activeLayoutPreset,
        activeLayoutColumns,
        tuning.peopleLineupSpacing,
        rowOffset,
      );
      const projectedLineupTarget = projectNdcToGround(
        layoutNdc.x,
        layoutNdc.y,
        peopleTargetTuning.cameraX,
        peopleTargetTuning.cameraY,
        peopleTargetTuning.cameraZ,
        peopleTargetTuning.fov,
        homeOverride.y,
      );
      const plateX = projectedLineupTarget.x + Math.sin(peopleSouthFacingY) * nameplateForwardOffset;
      const plateZ = projectedLineupTarget.z + Math.cos(peopleSouthFacingY) * nameplateForwardOffset;
      const plateBottomNdc = projectGroundToNdc(
        plateX,
        -0.42 + nameplateBottomOffsetY,
        plateZ,
        peopleTargetTuning.cameraX,
        peopleTargetTuning.cameraY,
        peopleTargetTuning.cameraZ,
        peopleTargetTuning.fov,
      ).y;
      const plateBottomPx = ndcToSceneLayerPixels(0, plateBottomNdc, sceneLayerRect).y;
      maxBottomPx = Math.max(maxBottomPx, plateBottomPx);
    }

    return maxBottomPx;
  };

  const peopleLayoutBottommostPxAtRest =
    activeLayoutPreset !== 'custom' ? getRegularLayoutBottommostScreenY(0) : Number.NEGATIVE_INFINITY;

  let maxPeopleRowOffsetForStop = maxPeopleRowOffset;
  if (activeLayoutPreset !== 'custom' && Number.isFinite(peopleLayoutBottommostPxAtRest) && peopleLayoutBottommostPxAtRest > stopBottomPx) {
    let low = 0;
    let high = maxPeopleRowOffset;
    for (let iteration = 0; iteration < 16; iteration += 1) {
      const mid = (low + high) * 0.5;
      const midBottomPx = getRegularLayoutBottommostScreenY(mid);
      if (midBottomPx > stopBottomPx) {
        low = mid;
      } else {
        high = mid;
      }
    }
    maxPeopleRowOffsetForStop = high;
  }

  const peopleRowOffset = peopleScrollProgress * maxPeopleRowOffsetForStop;

  const peopleLayoutOverflowsViewport =
    activeLayoutPreset !== 'custom' &&
    Number.isFinite(peopleLayoutBottommostPxAtRest) &&
    peopleLayoutBottommostPxAtRest > triggerBottomPx;

  let customLayoutMinBottomY = Number.POSITIVE_INFINITY;
  let customLayoutMaxBottomPx = Number.NEGATIVE_INFINITY;
  if (activeLayoutPreset === 'custom') {
    for (const character of orderedCharacters) {
      const [baseX, baseY, baseZ] = character.config.position;
      const override = tuning.peopleCharacterOverrides[character.id] ?? { x: baseX, y: baseY, z: baseZ, scale: 1 };
      const plateX = override.x + Math.sin(peopleSouthFacingY) * nameplateForwardOffset;
      const plateZ = override.z + Math.cos(peopleSouthFacingY) * nameplateForwardOffset;
      const plateBottomNdc = projectGroundToNdc(
        plateX,
        -0.42 + nameplateBottomOffsetY,
        plateZ,
        peopleTargetTuning.cameraX,
        peopleTargetTuning.cameraY,
        peopleTargetTuning.cameraZ,
        peopleTargetTuning.fov,
      ).y;
      customLayoutMinBottomY = Math.min(customLayoutMinBottomY, plateBottomNdc);
      const plateBottomPx = ndcToSceneLayerPixels(0, plateBottomNdc, sceneLayerRect).y;
      customLayoutMaxBottomPx = Math.max(customLayoutMaxBottomPx, plateBottomPx);
    }
  }

  const customBottomTriggerOverflowPx =
    activeLayoutPreset === 'custom' && Number.isFinite(customLayoutMaxBottomPx)
      ? Math.max(0, customLayoutMaxBottomPx - triggerBottomPx)
      : 0;
  const customBottomStopOverflowPx =
    activeLayoutPreset === 'custom' && Number.isFinite(customLayoutMaxBottomPx)
      ? Math.max(0, customLayoutMaxBottomPx - stopBottomPx)
      : 0;
  const customScrollRangeNdc = customBottomStopOverflowPx * sceneNdcPerPixelY;
  const customPeopleScrollEnabled =
    isPeopleMode &&
    activeLayoutPreset === 'custom' &&
    customBottomTriggerOverflowPx > 0.5;

  const peopleScrollEnabled =
    isPeopleMode &&
    (activeLayoutPreset !== 'custom'
      ? peopleLayoutOverflowsViewport
      : customPeopleScrollEnabled);

  const homeBg = useMemo(() => new Color('#112126'), []);
  const neutralPeopleBase = useMemo(() => new Color('#1d1d1f'), []);
  const peopleHueBase = useMemo(() => new Color(tuning.peopleHueColor), [tuning.peopleHueColor]);
  const peopleBg = useMemo(() => neutralPeopleBase.clone().lerp(peopleHueBase, 0.78), [neutralPeopleBase, peopleHueBase]);
  const homeGround = useMemo(() => new Color('#2e4a42'), []);
  const peopleGround = useMemo(() => neutralPeopleBase.clone().lerp(peopleHueBase, 0.92), [neutralPeopleBase, peopleHueBase]);
  const homeLight = useMemo(() => new Color('#d4f7dc'), []);
  const peopleLight = useMemo(() => neutralPeopleBase.clone().lerp(peopleHueBase, 0.55).lerp(new Color('#ffffff'), 0.2), [neutralPeopleBase, peopleHueBase]);

  const backgroundColor = homeBg.clone().lerp(peopleBg, peopleTransitionProgress).getStyle();
  const fogColor = backgroundColor;
  const groundColor = homeGround.clone().lerp(peopleGround, peopleTransitionProgress).getStyle();
  const directionalColor = homeLight.clone().lerp(peopleLight, peopleTransitionProgress).getStyle();
  const southFacingY = getScreenSouthYaw(effectiveTuning.cameraX, effectiveTuning.cameraY, effectiveTuning.cameraZ, effectiveTuning.fov);
  const decorAlpha = 1 - peopleTransitionProgress;
  const [arrivedIds, setArrivedIds] = useState<Record<string, boolean>>({});
  const [characterWorldPositions, setCharacterWorldPositions] = useState<
    Record<string, { x: number; y: number; z: number }>
  >({});


  useEffect(() => {
    const target = isPeopleMode ? 1 : 0;
    const startProgress = peopleTransitionProgress;
    const delta = target - startProgress;

    if (Math.abs(delta) < 0.0001) {
      if (!isPeopleMode) setArrivedIds({});
      return;
    }

    const start = performance.now();
    let raf = 0;

    const tick = (time: number) => {
      const elapsed = (time - start) / 1000;
      const t = Math.max(0, Math.min(1, elapsed / totalTransitionSeconds));
      const nextProgress = startProgress + delta * t;
      setPeopleTransitionProgress(nextProgress);

      if (t < 1) {
        raf = window.requestAnimationFrame(tick);
      } else if (!isPeopleMode) {
        setArrivedIds({});
      }
    };

    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [isPeopleMode, totalTransitionSeconds]);

  useEffect(() => {
    onPeopleScrollEnabledChange?.(peopleScrollEnabled);
  }, [onPeopleScrollEnabledChange, peopleScrollEnabled]);

  useEffect(() => {
    if (!onDebugInfoChange) return;

    const nameplates = orderedCharacters.map((character, index) => {
      const [baseX, baseY, baseZ] = character.config.position;
      const [baseRotX, baseRotY, baseRotZ] = character.config.rotation;
      const homeOverride = tuning.characterOverrides[character.id] ?? {
        x: baseX,
        y: baseY,
        z: baseZ,
        scale: 1,
        rotX: baseRotX,
        rotY: baseRotY,
        rotZ: baseRotZ,
      };
      const layoutNdc = getPeopleLayoutNdc(
        index,
        orderedCharacters.length,
        activeLayoutPreset,
        activeLayoutColumns,
        tuning.peopleLineupSpacing,
        peopleRowOffset,
      );
      const projectedLineupTarget = projectNdcToGround(
        layoutNdc.x,
        layoutNdc.y,
        peopleTargetTuning.cameraX,
        peopleTargetTuning.cameraY,
        peopleTargetTuning.cameraZ,
        peopleTargetTuning.fov,
      );
      const peopleOverride = tuning.peopleCharacterOverrides[character.id] ?? {
        x: projectedLineupTarget.x,
        y: homeOverride.y,
        z: projectedLineupTarget.z,
        scale: homeOverride.scale,
        rotX: 0,
        rotY: southFacingY,
        rotZ: 0,
      };

      const isCustomLayout = activeLayoutPreset === 'custom';
      const useCustomLineupTarget = isCustomLayout && (isPeopleMode || peopleTransitionProgress > 0.001);
      const customNdc = projectGroundToNdc(
        peopleOverride.x,
        peopleOverride.y,
        peopleOverride.z,
        peopleTargetTuning.cameraX,
        peopleTargetTuning.cameraY,
        peopleTargetTuning.cameraZ,
        peopleTargetTuning.fov,
      );
      const customScrollOffsetNdc = isCustomLayout ? peopleScrollProgress * customScrollRangeNdc : 0;
      const customLineupTarget = projectNdcToGround(
        customNdc.x,
        customNdc.y + customScrollOffsetNdc,
        peopleTargetTuning.cameraX,
        peopleTargetTuning.cameraY,
        peopleTargetTuning.cameraZ,
        peopleTargetTuning.fov,
        peopleOverride.y,
      );
      const lineupTarget = useCustomLineupTarget ? customLineupTarget : projectedLineupTarget;
      const nameplateBasePosition = characterWorldPositions[character.id] ?? {
        x: lineupTarget.x,
        y: peopleOverride.y,
        z: lineupTarget.z,
      };
      const plateWorldX = nameplateBasePosition.x + Math.sin(southFacingY) * 0.62;
      const plateWorldY = -0.42;
      const plateBottomWorldY = -0.42 - 0.025;
      const plateWorldZ = nameplateBasePosition.z + Math.cos(southFacingY) * 0.62;
      const plateNdc = projectGroundToNdc(
        plateWorldX,
        plateWorldY,
        plateWorldZ,
        effectiveTuning.cameraX,
        effectiveTuning.cameraY,
        effectiveTuning.cameraZ,
        effectiveTuning.fov,
      );
      const plateBottomNdc = projectGroundToNdc(
        plateWorldX,
        plateBottomWorldY,
        plateWorldZ,
        effectiveTuning.cameraX,
        effectiveTuning.cameraY,
        effectiveTuning.cameraZ,
        effectiveTuning.fov,
      );
      const plateScreen = ndcToSceneLayerPixels(plateNdc.x, plateNdc.y, sceneLayerRect);
      const plateBottomScreen = ndcToSceneLayerPixels(plateNdc.x, plateBottomNdc.y, sceneLayerRect);

      return {
        id: character.id,
        name: character.name,
        worldX: plateWorldX,
        worldY: plateWorldY,
        worldZ: plateWorldZ,
        ndcX: plateNdc.x,
        ndcY: plateNdc.y,
        screenX: plateScreen.x,
        screenY: plateScreen.y,
        bottomNdcY: plateBottomNdc.y,
        screenBottomY: plateBottomScreen.y,
      };
    });

    onDebugInfoChange({
      viewportWidthPx,
      viewportHeightPx,
      sceneLayerTopPx: sceneLayerRect.top,
      sceneLayerBottomPx: sceneLayerRect.bottom,
      triggerBottomPx,
      stopBottomPx,
      nameplates,
    });
  }, [
    onDebugInfoChange,
    orderedCharacters,
    tuning,
    activeLayoutPreset,
    activeLayoutColumns,
    peopleRowOffset,
    peopleTargetTuning,
    southFacingY,
    isPeopleMode,
    peopleTransitionProgress,
    peopleScrollProgress,
    customScrollRangeNdc,
    characterWorldPositions,
    effectiveTuning,
    viewportWidthPx,
    viewportHeightPx,
    sceneLayerRect,
    triggerBottomPx,
    stopBottomPx,
  ]);

  const [, setRelayoutProgress] = useState(1);
  const previousLayoutKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const layoutKey = `${activeLayoutPreset}:${activeLayoutColumns}`;

    if (!isPeopleMode || activeLayoutPreset === 'custom') {
      previousLayoutKeyRef.current = layoutKey;
      setRelayoutProgress(1);
      return;
    }

    const previousLayoutKey = previousLayoutKeyRef.current;
    previousLayoutKeyRef.current = layoutKey;

    // Do not rerun when entering People mode; only rerun when layout settings change while already in People.
    if (previousLayoutKey === null || peopleTransitionProgress < 0.999 || previousLayoutKey === layoutKey) {
      setRelayoutProgress(1);
      return;
    }

    const start = performance.now();
    const duration = Math.max(0.01, tuning.runDurationSeconds);
    let raf = 0;
    setRelayoutProgress(0);

    const tick = (time: number) => {
      const t = Math.max(0, Math.min(1, (time - start) / (duration * 1000)));
      setRelayoutProgress(t);
      if (t < 1) {
        raf = window.requestAnimationFrame(tick);
      }
    };

    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [isPeopleMode, activeLayoutPreset, activeLayoutColumns, peopleTransitionProgress, tuning.runDurationSeconds]);


  if (!isWebGLAvailable) {
    return null;
  }

  return (
    <div className="scene-layer" style={{
      width: `${tuning.sceneWorldWidthPx}px`,
      height: `${tuning.sceneWorldHeightPx}px`,
      transform: `translate(calc(-50% + ${effectiveTuning.sceneOffsetX}%), calc(-50% + ${effectiveTuning.sceneOffsetY}%))`,
    }} aria-hidden="true">
      <Canvas
        camera={{ position: [effectiveTuning.cameraX, effectiveTuning.cameraY, effectiveTuning.cameraZ], fov: effectiveTuning.fov }}
        shadows
      >
        <CameraController
          cameraX={effectiveTuning.cameraX}
          cameraY={effectiveTuning.cameraY}
          cameraZ={effectiveTuning.cameraZ}
          fov={effectiveTuning.fov}
        />
        <color attach="background" args={[backgroundColor]} />
        <fog attach="fog" args={[fogColor, effectiveTuning.fogNear, effectiveTuning.fogFar]} />
        <ambientLight intensity={effectiveTuning.ambientLightIntensity} />
        <directionalLight
          position={[effectiveTuning.directionalLightX, effectiveTuning.directionalLightY, effectiveTuning.directionalLightZ]}
          intensity={effectiveTuning.directionalLightIntensity}
          color={directionalColor}
          castShadow
        />

        <mesh position={[0, -0.45, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[effectiveTuning.sceneRadius, 72]} />
          <meshStandardMaterial color={groundColor} flatShading />
        </mesh>

        {decorAlpha > 0.01 && <EnvironmentProps
          alpha={decorAlpha}
          overrides={tuning.environmentOverrides}
          selectedModelId={selectedModelId}
          editMode={editMode}
          onSelect={(id) => onSelectModel?.(id)}
          onOverrideChange={(id, next) => onEnvironmentOverrideChange?.(id, next)}
        />}

        {decorAlpha > 0.01 && <DraggableFire
          override={tuning.fireOverride}
          selected={selectedModelId === 'fire'}
          editMode={editMode}
          onSelect={(id) => onSelectModel?.(id)}
          onOverrideChange={(next) => onFireOverrideChange?.(next)}
          alpha={decorAlpha}
        />}

        {orderedCharacters.map((character, index) => {
          const [baseX, baseY, baseZ] = character.config.position;
          const [baseRotX, baseRotY, baseRotZ] = character.config.rotation;
          const homeOverride = tuning.characterOverrides[character.id] ?? {
            x: baseX,
            y: baseY,
            z: baseZ,
            scale: 1,
            rotX: baseRotX,
            rotY: baseRotY,
            rotZ: baseRotZ,
          };

          const layoutNdc = getPeopleLayoutNdc(
            index,
            orderedCharacters.length,
            activeLayoutPreset,
            activeLayoutColumns,
            tuning.peopleLineupSpacing,
            peopleRowOffset,
          );
          const ndcX = layoutNdc.x;
          const ndcY = layoutNdc.y;
          const projectedLineupTarget = projectNdcToGround(
            ndcX,
            ndcY,
            peopleTargetTuning.cameraX,
            peopleTargetTuning.cameraY,
            peopleTargetTuning.cameraZ,
            peopleTargetTuning.fov,
          );
          const rawPeopleOverride = tuning.peopleCharacterOverrides[character.id] ?? {
            x: projectedLineupTarget.x,
            y: homeOverride.y,
            z: projectedLineupTarget.z,
            scale: homeOverride.scale,
            rotX: 0,
            rotY: southFacingY,
            rotZ: 0,
          };
          const peopleOverride = rawPeopleOverride;
          const isCustomLayout = activeLayoutPreset === 'custom';
          const useCustomLineupTarget = isCustomLayout && (isPeopleMode || peopleTransitionProgress > 0.001);
          const customScrollOffsetNdc = isCustomLayout ? peopleScrollProgress * customScrollRangeNdc : 0;
          const customLineupTarget = (() => {
            const customNdc = projectGroundToNdc(
              peopleOverride.x,
              peopleOverride.y,
              peopleOverride.z,
              peopleTargetTuning.cameraX,
              peopleTargetTuning.cameraY,
              peopleTargetTuning.cameraZ,
              peopleTargetTuning.fov,
            );
            return projectNdcToGround(
              customNdc.x,
              customNdc.y + customScrollOffsetNdc,
              peopleTargetTuning.cameraX,
              peopleTargetTuning.cameraY,
              peopleTargetTuning.cameraZ,
              peopleTargetTuning.fov,
              peopleOverride.y,
            );
          })();
          const lineupTarget = useCustomLineupTarget
            ? customLineupTarget
            : projectedLineupTarget;
          const useCustomOverride = isCustomLayout && isPeopleMode && peopleTransitionProgress >= 0.999;
          const activeOverride = useCustomOverride ? peopleOverride : homeOverride;
          const nameplateBasePosition = characterWorldPositions[character.id] ?? {
            x: lineupTarget.x,
            y: peopleOverride.y,
            z: lineupTarget.z,
          };
          const nameplateForwardOffset = 0.62;
          const nameplatePosition: [number, number, number] = [
            nameplateBasePosition.x + Math.sin(southFacingY) * nameplateForwardOffset,
            -0.42,
            nameplateBasePosition.z + Math.cos(southFacingY) * nameplateForwardOffset,
          ];
          const nameplateFadeStart = 0.72;
          const nameplateFadeProgress = Math.max(0, Math.min(1, (peopleTransitionProgress - nameplateFadeStart) / (1 - nameplateFadeStart)));
          const nameplateOpacity = editMode ? 0 : nameplateFadeProgress;

          return (
            <group key={character.id}>
              {isPeopleMode && (
                <NamePlate3D
                  name={character.name}
                  position={nameplatePosition}
                  rotationY={southFacingY}
                  opacity={nameplateOpacity}
                />
              )}
              <DraggableCharacter
                id={character.id}
                name={character.name}
                config={character.config}
                movementBehavior={movementBehavior}
                editMode={editMode}
                selected={selectedModelId === character.id}
                onSelect={(id) => onSelectModel?.(id)}
                onOverrideChange={(id, next) => onCharacterOverrideChange?.(id, next)}
                override={activeOverride}
                globalCharacterScale={effectiveTuning.characterScale}
                lineupTarget={lineupTarget}
                isPeopleMode={isPeopleMode}
                southFacingY={southFacingY}
                peopleTransitionProgress={peopleTransitionProgress}
                totalTransitionSeconds={totalTransitionSeconds}
                peopleFinalRotX={peopleOverride.rotX}
                peopleFinalRotY={peopleOverride.rotY}
                peopleFinalRotZ={peopleOverride.rotZ}
                peopleFinalY={peopleOverride.y}
                peopleFinalScale={peopleOverride.scale}
                peopleRunAnimationSpeed={tuning.peopleRunAnimationSpeed}
                peopleScrollAnimated={peopleScrollAnimated}
                onWorldPositionChange={(characterId, nextPosition) =>
                  setCharacterWorldPositions((current) => {
                    const previous = current[characterId];
                    if (
                      previous &&
                      Math.abs(previous.x - nextPosition.x) < 0.001 &&
                      Math.abs(previous.y - nextPosition.y) < 0.001 &&
                      Math.abs(previous.z - nextPosition.z) < 0.001
                    ) {
                      return current;
                    }
                    return { ...current, [characterId]: nextPosition };
                  })
                }
                onArrivalChange={(characterId, arrived) =>
                  setArrivedIds((current) => ({ ...current, [characterId]: arrived }))
                }
                onActivate={onCharacterActivate}
              />
            </group>
          );
        })}
      </Canvas>
    </div>
  );
}
