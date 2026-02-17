'use client';

import { Text } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Group } from 'three';
import type { Mesh, PointLight } from 'three';
import { Color, PerspectiveCamera, Plane, Vector3 } from 'three';
import type { CharacterConfig } from '../lib/characterOptions';
import PrimitiveCharacter from './PrimitiveCharacter';

type MovementBehavior = 'idle' | 'run';
type PeopleLayoutPreset = 'regular' | 'custom';

export type ModelOverride = {
  x: number;
  y: number;
  z: number;
  scale: number;
  rotX: number;
  rotY: number;
  rotZ: number;
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
  sceneCanvasScale: number;
  sceneRadius: number;
  ambientLightIntensity: number;
  directionalLightIntensity: number;
  directionalLightX: number;
  directionalLightY: number;
  directionalLightZ: number;
  preRunTurnSeconds: number;
  runDurationSeconds: number;
  peopleRunAnimationSpeed: number;
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

export type PeopleViewTuning = Pick<
  SceneTuning,
  | 'cameraX'
  | 'cameraY'
  | 'cameraZ'
  | 'fov'
  | 'fogNear'
  | 'fogFar'
  | 'characterScale'
  | 'sceneOffsetX'
  | 'sceneOffsetY'
  | 'sceneCanvasScale'
  | 'sceneRadius'
  | 'ambientLightIntensity'
  | 'directionalLightIntensity'
  | 'directionalLightX'
  | 'directionalLightY'
  | 'directionalLightZ'
>;

export const defaultSceneTuning: SceneTuning = {
  cameraX: 7.5,
  cameraY: 7.2,
  cameraZ: 7.2,
  fov: 37,
  fogNear: 12,
  fogFar: 31,
  characterScale: 0.78,
  sceneOffsetX: -10,
  sceneOffsetY: 6,
  sceneCanvasScale: 1.4,
  sceneRadius: 40,
  ambientLightIntensity: 1.45,
  directionalLightIntensity: 0.8,
  directionalLightX: -0.1,
  directionalLightY: 20,
  directionalLightZ: 11.8,
  preRunTurnSeconds: 0,
  runDurationSeconds: 0.5,
  peopleRunAnimationSpeed: 1.8,
  characterOverrides: {
    alex: {
      x: -3.1122954462698234,
      y: -0.15,
      z: -3.3427100339320726,
      scale: 1,
      rotX: 0.2,
      rotY: 0.52,
      rotZ: 0,
    },
    bea: {
      x: -3.2145019891733897,
      y: -0.25,
      z: -1.2391295954400698,
      scale: 1,
      rotX: 0,
      rotY: -0.13,
      rotZ: 0.17,
    },
    chen: {
      x: 0.11073186200803387,
      y: -0.2,
      z: -0.07749770444642179,
      scale: 1,
      rotX: 0,
      rotY: -2.62,
      rotZ: 0,
    },
    dina: {
      x: -0.057315008065114637,
      y: -0.1,
      z: -1.0442324775568745,
      scale: 0.9,
      rotX: -0.19,
      rotY: 1,
      rotZ: 0.13,
    },
    eli: {
      x: 1.7881414864814607,
      y: -0.1,
      z: -0.23296968787807204,
      scale: 0.67,
      rotX: 0.1,
      rotY: 2.36,
      rotZ: 0.13,
    },
  },
  peopleCharacterOverrides: {
    alex: {
      x: -2.9520258605149046,
      y: -0.15,
      z: 0.6706447102776663,
      scale: 1,
      rotX: 0.03,
      rotY: 0.51,
      rotZ: 0,
    },
    bea: {
      x: -1.2322009641221456,
      y: -0.15,
      z: -1.1582955109442352,
      scale: 1,
      rotX: 0,
      rotY: 0.8106029087243866,
      rotZ: 0,
    },
    chen: {
      x: 0.41819874662061185,
      y: -0.15,
      z: -2.942649624067866,
      scale: 1,
      rotX: 0,
      rotY: 0.8106029087243866,
      rotZ: 0,
    },
    dina: {
      x: -0.8627984955872954,
      y: -0.15,
      z: 0.6996398730637239,
      scale: 0.9,
      rotX: 0,
      rotY: 1.46,
      rotZ: 0,
    },
    eli: {
      x: 0.7004637469002306,
      y: -0.25,
      z: -0.9602475346833428,
      scale: 0.67,
      rotX: 0,
      rotY: 0.8106029087243866,
      rotZ: 0,
    },
  },
  peopleViewTuning: {
    cameraX: 6.1,
    cameraY: 7.4,
    cameraZ: 5.8,
    fov: 39,
    fogNear: 12,
    fogFar: 31,
    characterScale: 0.78,
    sceneOffsetX: 0,
    sceneOffsetY: -4.5,
    sceneCanvasScale: 1.4,
    sceneRadius: 40,
    ambientLightIntensity: 1.55,
    directionalLightIntensity: 3,
    directionalLightX: 2.6,
    directionalLightY: 7.7,
    directionalLightZ: 3.5,
  },
  peopleHueColor: '#6c527a',
  peopleLayoutPreset: 'regular',
  peopleLayoutPresetNarrow: 'regular',
  peopleLayoutColumns: 3,
  peopleLayoutColumnsNarrow: 2,
  fireOverride: {
    x: -0.000407912779931463,
    y: -0.3,
    z: -0.5893181362014639,
    scale: 1,
    rotX: 0,
    rotY: 0,
    rotZ: 0,
  },
  environmentOverrides: {
    pond: { x: -0.17114555377747376, y: -0.42, z: -7.562215471467024, scale: 3, rotX: 0, rotY: 0, rotZ: 0 },
    'tree-1': { x: -6.487830093617572, y: -0.45, z: -0.16194185467417022, scale: 1, rotX: 0, rotY: 0, rotZ: 0 },
    'tree-2': { x: -4.013044993582884, y: -0.45, z: -4.121256646007296, scale: 1, rotX: 0, rotY: 0, rotZ: 0 },
    'tree-3': { x: 0.9703599180581204, y: -0.45, z: 2.066643086549372, scale: 1, rotX: 0, rotY: 0, rotZ: 0 },
    'tree-4': { x: 1.3835422089303613, y: -0.45, z: -2.238627927351077, scale: 1, rotX: 0, rotY: 0, rotZ: 0 },
    'tree-5': { x: -4.265002239085487, y: -0.45, z: -1.0353432942222807, scale: 1, rotX: 0, rotY: 0, rotZ: 0 },
    sauna: { x: 3.32394602031734, y: -0.45, z: -3.0912259625868606, scale: 0.76, rotX: 0.02, rotY: 0.82, rotZ: 0 },
    logs: { x: -4.710761635476089, y: 0, z: 2.1765379563757516, scale: 1, rotX: 0, rotY: 0.79, rotZ: 0 },
  },
};


function lerpNumber(from: number, to: number, progress: number): number {
  return from + (to - from) * progress;
}

type LandingScene3DProps = {
  characters: Array<{ id: string; name: string; config: CharacterConfig }>;
  movementBehavior?: MovementBehavior;
  mode?: 'home' | 'people' | 'projects';
  onRuntimeError?: () => void;
  tuning?: SceneTuning;
  editMode?: boolean;
  selectedModelId?: string | null;
  onSelectModel?: (modelId: string) => void;
  onCharacterOverrideChange?: (characterId: string, override: ModelOverride) => void;
  onEnvironmentOverrideChange?: (modelId: string, override: ModelOverride) => void;
  onFireOverrideChange?: (override: ModelOverride) => void;
  onCharacterActivate?: (characterId: string) => void;
  peopleExtraCanvasHeightPx?: number;
  onPeopleOverflowPxChange?: (overflowPx: number) => void;
  onCanvasDebugSizeChange?: (size: { widthPx: number; heightPx: number }) => void;
  peopleScrollProgress?: number;
  peopleCutoffBufferPx?: number;
};

function CameraController({ cameraX, cameraY, cameraZ, fov }: { cameraX: number; cameraY: number; cameraZ: number; fov: number }) {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(cameraX, cameraY, cameraZ);
    if ('fov' in camera) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
    camera.lookAt(0, 0, 0);
  }, [camera, cameraX, cameraY, cameraZ, fov]);

  return null;
}

function DraggableCharacter({
  id,
  config,
  movementBehavior,
  override,
  editMode,
  selected,
  onSelect,
  onOverrideChange,
  globalCharacterScale,
  lineupTarget,
  isPeopleMode,
  southFacingY,
  peopleTransitionProgress,
  totalTransitionSeconds,
  peopleFinalRotX,
  peopleFinalRotY,
  peopleFinalRotZ,
  peopleFinalY,
  peopleFinalScale,
  peopleRunAnimationSpeed,
  onArrivalChange,
  onActivate,
}: {
  id: string;
  config: CharacterConfig;
  movementBehavior: MovementBehavior;
  override: ModelOverride;
  editMode: boolean;
  selected: boolean;
  onSelect: (modelId: string) => void;
  onOverrideChange: (characterId: string, next: ModelOverride) => void;
  globalCharacterScale: number;
  lineupTarget: { x: number; z: number };
  isPeopleMode: boolean;
  southFacingY: number;
  peopleTransitionProgress: number;
  totalTransitionSeconds: number;
  peopleFinalRotX: number;
  peopleFinalRotY: number;
  peopleFinalRotZ: number;
  peopleFinalY: number;
  peopleFinalScale: number;
  peopleRunAnimationSpeed: number;
  onArrivalChange?: (characterId: string, arrived: boolean) => void;
  onActivate?: (characterId: string) => void;
}) {
  const groupRef = useRef<Group>(null);
  const dragPlane = useMemo(() => new Plane(new Vector3(0, 1, 0), -override.y), [override.y]);
  const dragPoint = useMemo(() => new Vector3(), []);
  const targetPosition = useRef({ x: override.x, z: override.z });
  const peopleStartPosition = useRef({ x: override.x, z: override.z });
  const dragOffset = useRef({ x: 0, z: 0 });
  const isDragging = useRef(false);
  const hasArrivedRef = useRef(false);
  const [isRunningInPeople, setIsRunningInPeople] = useState(false);
  const [layoutTransitionProgress, setLayoutTransitionProgress] = useState(1);
  const [isLayoutTransitioning, setIsLayoutTransitioning] = useState(false);

  useEffect(() => {
    targetPosition.current = { x: override.x, z: override.z };
  }, [override.x, override.z]);

  useEffect(() => {
    if (!isPeopleMode) {
      setLayoutTransitionProgress(1);
      setIsLayoutTransitioning(false);
      return;
    }

    const currentX = groupRef.current?.position.x ?? override.x;
    const currentZ = groupRef.current?.position.z ?? override.z;
    peopleStartPosition.current = { x: currentX, z: currentZ };
    hasArrivedRef.current = false;
    onArrivalChange?.(id, false);
    setIsRunningInPeople(false);
    setLayoutTransitionProgress(0);
    setIsLayoutTransitioning(true);

    const durationMs = Math.max(10, totalTransitionSeconds * 1000);
    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const progress = Math.max(0, Math.min(1, (now - start) / durationMs));
      setLayoutTransitionProgress(progress);
      if (progress < 1) {
        raf = window.requestAnimationFrame(tick);
      } else {
        setIsLayoutTransitioning(false);
      }
    };

    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [id, isPeopleMode, lineupTarget.x, lineupTarget.z, override.x, override.z, totalTransitionSeconds]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    const useLayoutTransition = isPeopleMode && peopleTransitionProgress >= 0.999 && isLayoutTransitioning;
    const transitionProgress = useLayoutTransition ? layoutTransitionProgress : peopleTransitionProgress;
    const transitionStart = useLayoutTransition ? peopleStartPosition.current : { x: override.x, z: override.z };
    const inPeopleTransition = (!editMode && (isPeopleMode || transitionProgress > 0.001)) || useLayoutTransition;

    if (inPeopleTransition) {
      const desiredX = transitionStart.x + (lineupTarget.x - transitionStart.x) * transitionProgress;
      const desiredZ = transitionStart.z + (lineupTarget.z - transitionStart.z) * transitionProgress;

      groupRef.current.position.x = desiredX;
      groupRef.current.position.z = desiredZ;

      const hasArrived = isPeopleMode && transitionProgress >= 0.999;
      if (hasArrived !== hasArrivedRef.current) {
        hasArrivedRef.current = hasArrived;
        onArrivalChange?.(id, hasArrived);
      }

      const isRunningNow = transitionProgress > 0.001 && transitionProgress < 0.999;
      if (isRunningNow !== isRunningInPeople) {
        setIsRunningInPeople(isRunningNow);
      }

      const bob = isRunningNow ? Math.abs(Math.sin(clock.elapsedTime * 5.4 + id.charCodeAt(0) * 0.18)) * 0.045 : 0;
      const baseY = isPeopleMode ? peopleFinalY : override.y;
      groupRef.current.position.y = baseY + bob;

      const runTargetX = isPeopleMode ? lineupTarget.x : override.x;
      const runTargetZ = isPeopleMode ? lineupTarget.z : override.z;
      const runDirectionY = Math.atan2(runTargetX - desiredX, runTargetZ - desiredZ);
      const desiredRotY = isRunningNow ? runDirectionY : isPeopleMode ? peopleFinalRotY : override.rotY;
      const desiredRotX = isPeopleMode ? peopleFinalRotX : 0;
      const desiredRotZ = isPeopleMode ? peopleFinalRotZ : 0;

      groupRef.current.rotation.y += (desiredRotY - groupRef.current.rotation.y) * 0.12;
      groupRef.current.rotation.x += (desiredRotX - groupRef.current.rotation.x) * 0.12;
      groupRef.current.rotation.z += (desiredRotZ - groupRef.current.rotation.z) * 0.12;
    } else {
      if (isRunningInPeople) {
        setIsRunningInPeople(false);
      }

      const smooth = isDragging.current ? 0.42 : 0.12;
      const idleTargetX = isPeopleMode ? lineupTarget.x : targetPosition.current.x;
      const idleTargetZ = isPeopleMode ? lineupTarget.z : targetPosition.current.z;
      groupRef.current.position.x += (idleTargetX - groupRef.current.position.x) * smooth;
      groupRef.current.position.z += (idleTargetZ - groupRef.current.position.z) * smooth;

      const bob = movementBehavior === 'run' && !editMode
        ? Math.abs(Math.sin(clock.elapsedTime * 5.4 + id.charCodeAt(0) * 0.18)) * 0.045
        : 0;
      const baseY = isPeopleMode ? peopleFinalY : override.y;
      groupRef.current.position.y = baseY + bob;

      groupRef.current.rotation.y += (override.rotY - groupRef.current.rotation.y) * 0.12;
      groupRef.current.rotation.x += (override.rotX - groupRef.current.rotation.x) * 0.12;
      groupRef.current.rotation.z += (override.rotZ - groupRef.current.rotation.z) * 0.12;
    }
  });

  const visibleScale = (isPeopleMode ? peopleFinalScale : override.scale) * globalCharacterScale;
  const isSceneTransitionActive = peopleTransitionProgress > 0.001 && peopleTransitionProgress < 0.999;
  const shouldUseStandingPose = isPeopleMode || isSceneTransitionActive;
  const effectiveLocomotion = isSceneTransitionActive
    ? 'run'
    : isRunningInPeople
      ? 'run'
      : isPeopleMode
        ? 'idle'
        : movementBehavior;

  return (
    <group
      ref={groupRef}
      position={[override.x, override.y, override.z]}
      rotation={[override.rotX, override.rotY, override.rotZ]}
      scale={[visibleScale, visibleScale, visibleScale]}
      onPointerDown={(event) => {
        if (!editMode) return;
        event.stopPropagation();
        onSelect(id);
        isDragging.current = true;
        (event.target as { setPointerCapture?: (pointerId: number) => void } | null)?.setPointerCapture?.(
          event.pointerId,
        );
        event.ray.intersectPlane(dragPlane, dragPoint);
        dragOffset.current = {
          x: override.x - dragPoint.x,
          z: override.z - dragPoint.z,
        };
      }}
      onPointerMove={(event) => {
        if (!editMode || !isDragging.current) return;
        event.stopPropagation();
        event.ray.intersectPlane(dragPlane, dragPoint);
        const nextX = dragPoint.x + dragOffset.current.x;
        const nextZ = dragPoint.z + dragOffset.current.z;

        const next = {
          ...override,
          x: Math.max(-80, Math.min(80, nextX)),
          z: Math.max(-80, Math.min(80, nextZ)),
        };
        targetPosition.current = { x: next.x, z: next.z };
        onOverrideChange(id, next);
      }}
      onPointerUp={(event) => {
        if (!editMode) return;
        event.stopPropagation();
        isDragging.current = false;
        (event.target as { releasePointerCapture?: (pointerId: number) => void } | null)?.releasePointerCapture?.(
          event.pointerId,
        );
      }}
      onPointerCancel={() => {
        isDragging.current = false;
      }}
      onPointerMissed={() => {
        isDragging.current = false;
      }}
      onClick={(event) => {
        if (!editMode) return;
        event.stopPropagation();
        onSelect(id);
      }}
    >
      <PrimitiveCharacter
        pose={shouldUseStandingPose ? 'standing' : config.pose}
        locomotion={effectiveLocomotion}
        rotation={config.rotation}
        headShape={config.headShape}
        bodyShape={config.bodyShape}
        legShape={config.legShape}
        accessories={config.accessories}
        colors={config.colors}
        hoverBehavior={isPeopleMode ? 'wave' : 'none'}
        runMotionSpeed={isPeopleMode ? peopleRunAnimationSpeed : 1}
        onActivate={() => {
          if (!editMode && isPeopleMode) {
            onActivate?.(id);
          }
        }}
      />
      {selected && editMode && (
        <mesh position={[0, 1.05, 0]}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshBasicMaterial color="#9de6a4" />
        </mesh>
      )}
    </group>
  );
}

function NamePlate3D({
  name,
  position,
  rotationY,
  opacity,
}: {
  name: string;
  position: [number, number, number];
  rotationY: number;
  opacity: number;
}) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh receiveShadow>
        <boxGeometry args={[0.74, 0.05, 0.58]} />
        <meshStandardMaterial color="#d8dbe0" transparent opacity={opacity} />
      </mesh>
      <mesh position={[0, 0.03, 0]}>
        <boxGeometry args={[0.64, 0.016, 0.46]} />
        <meshStandardMaterial color="#f1f2f4" transparent opacity={opacity} />
      </mesh>
      <Text
        position={[0, 0.039, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.1}
        color="#2f3033"
        fillOpacity={opacity}
        anchorX="center"
        anchorY="middle"
      >
        {name}
      </Text>
    </group>
  );
}

function DraggableFire({
  override,
  selected,
  editMode,
  onSelect,
  onOverrideChange,
  alpha = 1,
}: {
  override: ModelOverride;
  selected: boolean;
  editMode: boolean;
  onSelect: (modelId: string) => void;
  onOverrideChange: (next: ModelOverride) => void;
  alpha?: number;
}) {
  const flameRef = useRef<Mesh>(null);
  const lightRef = useRef<PointLight>(null);

  const dragPlane = useMemo(() => new Plane(new Vector3(0, 1, 0), -override.y), [override.y]);
  const dragPoint = useMemo(() => new Vector3(), []);
  const targetPosition = useRef({ x: override.x, z: override.z });
  const dragOffset = useRef({ x: 0, z: 0 });
  const isDragging = useRef(false);

  useEffect(() => {
    targetPosition.current = { x: override.x, z: override.z };
  }, [override.x, override.z]);

  useFrame(({ clock }) => {
    const pulse = 0.92 + Math.sin(clock.elapsedTime * 7.3) * 0.08;
    const sway = Math.sin(clock.elapsedTime * 5.1) * 0.03;

    if (flameRef.current) {
      flameRef.current.scale.y = pulse;
      flameRef.current.position.x = sway;
    }

    if (lightRef.current) {
      lightRef.current.intensity = 0.42 + Math.sin(clock.elapsedTime * 8.2) * 0.12;
    }
  });

  return (
    <group
      position={[targetPosition.current.x, override.y, targetPosition.current.z]}
      rotation={[override.rotX, override.rotY, override.rotZ]}
      scale={[override.scale, override.scale, override.scale]}
      onPointerDown={(event) => {
        if (!editMode) return;
        event.stopPropagation();
        onSelect('fire');
        isDragging.current = true;
        (event.target as { setPointerCapture?: (pointerId: number) => void } | null)?.setPointerCapture?.(
          event.pointerId,
        );
        event.ray.intersectPlane(dragPlane, dragPoint);
        dragOffset.current = {
          x: override.x - dragPoint.x,
          z: override.z - dragPoint.z,
        };
      }}
      onPointerMove={(event) => {
        if (!editMode || !isDragging.current) return;
        event.stopPropagation();
        event.ray.intersectPlane(dragPlane, dragPoint);
        const next = {
          ...override,
          x: Math.max(-80, Math.min(80, dragPoint.x + dragOffset.current.x)),
          z: Math.max(-80, Math.min(80, dragPoint.z + dragOffset.current.z)),
        };
        targetPosition.current = { x: next.x, z: next.z };
        onOverrideChange(next);
      }}
      onPointerUp={(event) => {
        if (!editMode) return;
        event.stopPropagation();
        isDragging.current = false;
        (event.target as { releasePointerCapture?: (pointerId: number) => void } | null)?.releasePointerCapture?.(
          event.pointerId,
        );
      }}
      onPointerCancel={() => {
        isDragging.current = false;
      }}
      onPointerMissed={() => {
        isDragging.current = false;
      }}
      onClick={(event) => {
        if (!editMode) return;
        event.stopPropagation();
        onSelect('fire');
      }}
    >
      <mesh castShadow>
        <cylinderGeometry args={[0.18, 0.22, 0.12, 6]} />
        <meshStandardMaterial color="#6b4b37" flatShading transparent opacity={alpha} />
      </mesh>
      <mesh ref={flameRef} position={[0, 0.14, 0]} castShadow>
        <coneGeometry args={[0.13, 0.25, 6]} />
        <meshStandardMaterial color="#fca75f" emissive="#f57f45" emissiveIntensity={0.5 * alpha} flatShading transparent opacity={alpha} />
      </mesh>
      <pointLight ref={lightRef} position={[0, 0.25, 0]} intensity={0.5 * alpha} distance={2.4} color="#ffb566" />
      {selected && editMode && (
        <mesh position={[0, 0.45, 0]}>
          <sphereGeometry args={[0.06, 10, 10]} />
          <meshBasicMaterial color="#ffde8f" transparent opacity={alpha} />
        </mesh>
      )}
    </group>
  );
}

function EnvironmentProps({
  alpha = 1,
  overrides,
  selectedModelId,
  editMode,
  onSelect,
  onOverrideChange,
}: {
  alpha?: number;
  overrides: Record<string, ModelOverride>;
  selectedModelId: string | null;
  editMode: boolean;
  onSelect: (modelId: string) => void;
  onOverrideChange: (modelId: string, next: ModelOverride) => void;
}) {
  const pondRef = useRef<Mesh>(null);
  const treeTopRefs = useRef<Array<Group | null>>([]);
  const smokeRefs = useRef<Array<Mesh | null>>([]);

  const dragPoint = useMemo(() => new Vector3(), []);
  const draggingIdRef = useRef<string | null>(null);
  const dragOffsetRef = useRef({ x: 0, z: 0 });

  const baselineOverrides = defaultSceneTuning.environmentOverrides;

  const environmentLayout = [
    { id: 'pond', basePosition: [-3.8, -0.42, 2.35] as [number, number, number], baseRotation: [0, 0, 0] as [number, number, number], baseScale: 1 },
    { id: 'tree-1', basePosition: [-4.8, -0.45, -4.2] as [number, number, number], baseRotation: [0, 0, 0] as [number, number, number], baseScale: 1 },
    { id: 'tree-2', basePosition: [-6, -0.45, -1.5] as [number, number, number], baseRotation: [0, 0, 0] as [number, number, number], baseScale: 1 },
    { id: 'tree-3', basePosition: [4.3, -0.45, -4.8] as [number, number, number], baseRotation: [0, 0, 0] as [number, number, number], baseScale: 1 },
    { id: 'tree-4', basePosition: [6.1, -0.45, -2] as [number, number, number], baseRotation: [0, 0, 0] as [number, number, number], baseScale: 1 },
    { id: 'tree-5', basePosition: [5.2, -0.45, 1.2] as [number, number, number], baseRotation: [0, 0, 0] as [number, number, number], baseScale: 1 },
    { id: 'sauna', basePosition: [3.6, -0.45, -2.3] as [number, number, number], baseRotation: [0, 0, 0] as [number, number, number], baseScale: 1 },
    { id: 'logs', basePosition: [0, 0, 0] as [number, number, number], baseRotation: [0, 0, 0] as [number, number, number], baseScale: 1 },
  ] as const;

  const resolved = Object.fromEntries(
    environmentLayout.map((item) => {
      const baseline = baselineOverrides[item.id];
      const override = overrides[item.id] ?? baseline;
      const pos: [number, number, number] = [override.x, override.y, override.z];
      const rot: [number, number, number] = [override.rotX, override.rotY, override.rotZ];
      const scale = override.scale;
      return [item.id, { pos, rot, scale, override }];
    }),
  ) as Record<string, { pos: [number, number, number]; rot: [number, number, number]; scale: number; override: ModelOverride }>;

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;

    if (pondRef.current) {
      const ripple = 1 + Math.sin(t * 1.8) * 0.035;
      pondRef.current.scale.set(ripple, 1, ripple * 0.98);
    }

    treeTopRefs.current.forEach((treeTop, index) => {
      if (!treeTop) return;
      treeTop.rotation.z = Math.sin(t * 0.8 + index * 0.85) * 0.045;
      treeTop.rotation.x = Math.cos(t * 0.55 + index * 0.7) * 0.03;
    });

    smokeRefs.current.forEach((smoke, index) => {
      if (!smoke) return;
      const offset = t * 0.9 + index * 0.55;
      smoke.position.y = 2.35 + index * 0.23 + (offset % 1.8) * 0.42;
      smoke.position.x = -0.12 + Math.sin(offset * 1.7) * 0.08;
      smoke.position.z = 0.1 + Math.cos(offset * 1.35) * 0.08;
      const puffScale = 1 + ((offset % 1.8) / 1.8) * 0.5;
      smoke.scale.setScalar(puffScale);
    });
  });

  function bindDrag(modelId: string, override: ModelOverride) {
    const dragPlane = new Plane(new Vector3(0, 1, 0), -override.y);

    return {
      onPointerDown: (event: { stopPropagation: () => void; pointerId: number; ray: { intersectPlane: (plane: Plane, point: Vector3) => void }; target: unknown }) => {
        if (!editMode) return;
        event.stopPropagation();
        onSelect(modelId);
        draggingIdRef.current = modelId;
        (event.target as { setPointerCapture?: (pointerId: number) => void } | null)?.setPointerCapture?.(event.pointerId);
        event.ray.intersectPlane(dragPlane, dragPoint);
        dragOffsetRef.current = { x: override.x - dragPoint.x, z: override.z - dragPoint.z };
      },
      onPointerMove: (event: { stopPropagation: () => void; ray: { intersectPlane: (plane: Plane, point: Vector3) => void } }) => {
        if (!editMode || draggingIdRef.current !== modelId) return;
        event.stopPropagation();
        event.ray.intersectPlane(dragPlane, dragPoint);
        onOverrideChange(modelId, {
          ...override,
          x: Math.max(-80, Math.min(80, dragPoint.x + dragOffsetRef.current.x)),
          z: Math.max(-80, Math.min(80, dragPoint.z + dragOffsetRef.current.z)),
        });
      },
      onPointerUp: (event: { stopPropagation: () => void; pointerId: number; target: unknown }) => {
        if (!editMode || draggingIdRef.current !== modelId) return;
        event.stopPropagation();
        draggingIdRef.current = null;
        (event.target as { releasePointerCapture?: (pointerId: number) => void } | null)?.releasePointerCapture?.(event.pointerId);
      },
      onPointerCancel: () => {
        if (draggingIdRef.current === modelId) draggingIdRef.current = null;
      },
    };
  }

  const logPositions: Array<[number, number, number]> = [
    [2.2, -0.35, 0.2],
    [2.85, -0.35, 0.45],
    [2.45, -0.35, 0.85],
    [3.15, -0.35, 0.95],
  ];

  return (
    <>
      <group position={resolved.pond.pos} rotation={resolved.pond.rot} scale={[resolved.pond.scale, resolved.pond.scale, resolved.pond.scale]} {...bindDrag('pond', resolved.pond.override)}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[1.65, 36]} />
          <meshStandardMaterial color="#2d6d71" flatShading transparent opacity={alpha} />
        </mesh>
        <mesh ref={pondRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <circleGeometry args={[1.45, 36]} />
          <meshStandardMaterial color="#70bec8" transparent opacity={0.78 * alpha} roughness={0.3} />
        </mesh>
      </group>

      {(['tree-1', 'tree-2', 'tree-3', 'tree-4', 'tree-5'] as const).map((treeId, index) => (
        <group key={treeId} position={resolved[treeId].pos} rotation={resolved[treeId].rot} scale={[resolved[treeId].scale, resolved[treeId].scale, resolved[treeId].scale]} {...bindDrag(treeId, resolved[treeId].override)}>
          <mesh castShadow position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.1, 0.14, 1.1, 8]} />
            <meshStandardMaterial color="#6d4a35" flatShading transparent opacity={alpha} />
          </mesh>
          <group ref={(node) => {
              treeTopRefs.current[index] = node;
            }} position={[0, 1.2, 0]}>
            <mesh castShadow>
              <coneGeometry args={[0.62, 1.1, 10]} />
              <meshStandardMaterial color="#4f8d53" flatShading transparent opacity={alpha} />
            </mesh>
            <mesh castShadow position={[0, 0.42, 0]}>
              <coneGeometry args={[0.45, 0.85, 10]} />
              <meshStandardMaterial color="#5aa25d" flatShading transparent opacity={alpha} />
            </mesh>
          </group>
        </group>
      ))}

      <group position={resolved.sauna.pos} rotation={resolved.sauna.rot} scale={[resolved.sauna.scale, resolved.sauna.scale, resolved.sauna.scale]} {...bindDrag('sauna', resolved.sauna.override)}>
        <mesh castShadow position={[0, 0.4, 0]}>
          <boxGeometry args={[1.8, 0.8, 1.4]} />
          <meshStandardMaterial color="#7a5a3f" flatShading transparent opacity={alpha} />
        </mesh>
        <mesh castShadow position={[0, 1, 0]}>
          <coneGeometry args={[1.25, 0.85, 4]} />
          <meshStandardMaterial color="#5b3f2e" flatShading transparent opacity={alpha} />
        </mesh>
        <mesh castShadow position={[0.6, 1.65, 0.15]}>
          <boxGeometry args={[0.24, 0.55, 0.24]} />
          <meshStandardMaterial color="#4b4e52" flatShading transparent opacity={alpha} />
        </mesh>
        {Array.from({ length: 4 }).map((_, index) => (
          <mesh
            key={`smoke-${index}`}
            ref={(node) => {
              smokeRefs.current[index] = node;
            }}
            position={[-0.12, 2.35 + index * 0.23, 0.1]}
          >
            <sphereGeometry args={[0.13 + index * 0.015, 10, 10]} />
            <meshStandardMaterial color="#d2d6dc" transparent opacity={0.35 * alpha} />
          </mesh>
        ))}
      </group>

      <group position={resolved.logs.pos} rotation={resolved.logs.rot} scale={[resolved.logs.scale, resolved.logs.scale, resolved.logs.scale]} {...bindDrag('logs', resolved.logs.override)}>
        {logPositions.map((position, index) => (
          <mesh
            key={`log-${index}`}
            castShadow
            position={position}
            rotation={[Math.PI / 2, index % 2 === 0 ? 0.35 : -0.45, 0]}
          >
            <cylinderGeometry args={[0.1, 0.1, 0.95, 10]} />
            <meshStandardMaterial color="#8a6446" flatShading transparent opacity={alpha} />
          </mesh>
        ))}
      </group>

      {editMode && environmentLayout.map((item) => (
        <mesh
          key={`${item.id}-handle`}
          position={resolved[item.id].pos}
          visible={false}
          {...bindDrag(item.id, resolved[item.id].override)}
          onClick={(event) => {
            event.stopPropagation();
            onSelect(item.id);
          }}
        >
          <sphereGeometry args={[0.9, 12, 12]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      ))}

      {editMode && selectedModelId && selectedModelId in resolved && (
        <mesh position={[resolved[selectedModelId].pos[0], resolved[selectedModelId].pos[1] + 1.2, resolved[selectedModelId].pos[2]]}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshBasicMaterial color="#9de6a4" />
        </mesh>
      )}
    </>
  );
}


function getLineupTarget(index: number, total: number, columns = 3): { xIndex: number; row: number; itemsInRow: number } {
  const row = Math.floor(index / columns);
  const rowStart = row * columns;
  const remaining = Math.max(0, total - rowStart);
  const itemsInRow = Math.min(columns, remaining);
  const xIndex = index - rowStart;
  return { xIndex, row, itemsInRow };
}

function getPeopleLayoutNdc(index: number, total: number, preset: PeopleLayoutPreset, columns: number): { x: number; y: number } {
  if (preset === 'custom') {
    return { x: 0, y: 0 };
  }

  const safeColumns = Math.max(1, Math.round(columns));
  const slot = getLineupTarget(index, total, safeColumns);
  const rowCenter = (slot.itemsInRow - 1) / 2;
  const xSpacing = 0.52;
  const yStep = 0.4;
  const x = (slot.xIndex - rowCenter) * xSpacing;
  const yStart = 0.24;
  const y = yStart - slot.row * yStep;

  return { x, y };
}



function projectNdcToGround(
  ndcX: number,
  ndcY: number,
  cameraX: number,
  cameraY: number,
  cameraZ: number,
  fov: number,
  groundY = -0.1,
): { x: number; z: number } {
  const camera = new PerspectiveCamera(fov, 1, 0.1, 1000);
  camera.position.set(cameraX, cameraY, cameraZ);
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();

  const point = new Vector3(ndcX, ndcY, 0.5).unproject(camera);
  const direction = point.sub(camera.position).normalize();
  const distance = (groundY - camera.position.y) / direction.y;

  return {
    x: camera.position.x + direction.x * distance,
    z: camera.position.z + direction.z * distance,
  };
}

function getScreenSouthYaw(cameraX: number, cameraY: number, cameraZ: number, fov: number): number {
  const center = projectNdcToGround(0, 0.02, cameraX, cameraY, cameraZ, fov);
  const lower = projectNdcToGround(0, -0.55, cameraX, cameraY, cameraZ, fov);
  return Math.atan2(lower.x - center.x, lower.z - center.z);
}


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
  peopleExtraCanvasHeightPx = 0,
  onPeopleOverflowPxChange,
  onCanvasDebugSizeChange,
  peopleScrollProgress = 0,
  peopleCutoffBufferPx = 100,
}: LandingScene3DProps) {
  const [isWebGLAvailable, setIsWebGLAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
      const available = Boolean(context);
      setIsWebGLAvailable(available);

      if (!available) {
        onRuntimeError?.();
      }
    } catch {
      setIsWebGLAvailable(false);
      onRuntimeError?.();
    }
  }, [onRuntimeError]);

  const orderedCharacters = useMemo(
    () => [...characters].sort((a, b) => a.id.localeCompare(b.id)),
    [characters],
  );

  const isPeopleMode = mode === 'people';
  const [isNarrowViewport, setIsNarrowViewport] = useState(false);
  const [viewportHeightPx, setViewportHeightPx] = useState(900);

  useEffect(() => {
    const update = () => {
      setIsNarrowViewport(window.innerWidth < 920);
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
    sceneOffsetY:
      lerpNumber(tuning.sceneOffsetY, peopleTargetTuning.sceneOffsetY, peopleTransitionProgress) -
      (isPeopleMode ? (peopleScrollProgress * peopleExtraCanvasHeightPx) / Math.max(1, viewportHeightPx) * 100 : 0),
    sceneCanvasScale: lerpNumber(
      tuning.sceneCanvasScale,
      peopleTargetTuning.sceneCanvasScale,
      peopleTransitionProgress,
    ),
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
  const canvasScalePercent = effectiveTuning.sceneCanvasScale * 100;
  const canvasInsetPercent = (100 - canvasScalePercent) / 2;
  const activeLayoutPreset = isNarrowViewport ? tuning.peopleLayoutPresetNarrow : tuning.peopleLayoutPreset;
  const activeLayoutColumns = isNarrowViewport ? tuning.peopleLayoutColumnsNarrow : tuning.peopleLayoutColumns;
  const sceneHeightPercent = canvasScalePercent;

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


  useEffect(() => {
    if (!onPeopleOverflowPxChange) return;

    if (!isPeopleMode || activeLayoutPreset === 'custom') {
      onPeopleOverflowPxChange(0);
      return;
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const sceneWidthPx = (canvasScalePercent / 100) * viewportWidth;
    const sceneHeightPx = (sceneHeightPercent / 100) * viewportHeight;

    const projectionCamera = new PerspectiveCamera(
      effectiveTuning.fov,
      Math.max(0.1, sceneWidthPx / Math.max(1, sceneHeightPx)),
      0.1,
      1000,
    );
    projectionCamera.position.set(effectiveTuning.cameraX, effectiveTuning.cameraY, effectiveTuning.cameraZ);
    projectionCamera.lookAt(0, 0, 0);
    projectionCamera.updateProjectionMatrix();
    projectionCamera.updateMatrixWorld();

    let maxNameplateBottomPx = -Infinity;

    orderedCharacters.forEach((character, index) => {
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

      const layoutNdc = getPeopleLayoutNdc(index, orderedCharacters.length, activeLayoutPreset, activeLayoutColumns);
      const projectedLineupTarget = projectNdcToGround(
        layoutNdc.x,
        layoutNdc.y,
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
      const lineupTarget = projectedLineupTarget;

      const nameplateWorld = new Vector3(
        lineupTarget.x + Math.sin(southFacingY) * 0.56,
        -0.42,
        lineupTarget.z + Math.cos(southFacingY) * 0.56,
      );
      const projected = nameplateWorld.project(projectionCamera);
      const nameplateScreenY = ((-projected.y + 1) / 2) * sceneHeightPx;
      maxNameplateBottomPx = Math.max(maxNameplateBottomPx, nameplateScreenY);
    });

    if (!Number.isFinite(maxNameplateBottomPx)) {
      onPeopleOverflowPxChange(0);
      return;
    }

    const overflowPx = Math.max(0, Math.ceil(maxNameplateBottomPx - sceneHeightPx + peopleCutoffBufferPx));
    onPeopleOverflowPxChange(overflowPx);
  }, [
    onPeopleOverflowPxChange,
    isPeopleMode,
    activeLayoutPreset,
    activeLayoutColumns,
    canvasScalePercent,
    canvasInsetPercent,
    sceneHeightPercent,
    effectiveTuning.sceneOffsetX,
    effectiveTuning.sceneOffsetY,
    effectiveTuning.cameraX,
    effectiveTuning.cameraY,
    effectiveTuning.cameraZ,
    effectiveTuning.fov,
    orderedCharacters,
    tuning.characterOverrides,
    tuning.peopleCharacterOverrides,
    peopleTargetTuning.cameraX,
    peopleTargetTuning.cameraY,
    peopleTargetTuning.cameraZ,
    peopleTargetTuning.fov,
    southFacingY,
    peopleCutoffBufferPx,
  ]);

  useEffect(() => {
    if (!onCanvasDebugSizeChange) return;

    const updateSize = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const widthPx = (canvasScalePercent / 100) * viewportWidth;
      const heightPx = (sceneHeightPercent / 100) * viewportHeight;
      onCanvasDebugSizeChange({ widthPx: Math.round(widthPx), heightPx: Math.round(heightPx) });
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [onCanvasDebugSizeChange, canvasScalePercent, sceneHeightPercent]);

  if (!isWebGLAvailable) {
    return null;
  }

  return (
    <div
      className="scene-layer"
      style={{
        width: `${canvasScalePercent}%`,
        height: `${sceneHeightPercent}%`,
        left: `${canvasInsetPercent}%`,
        top: `${canvasInsetPercent}%`,
        transform: `translate(${effectiveTuning.sceneOffsetX}%, ${effectiveTuning.sceneOffsetY}%)`,
      }}
      aria-hidden="true"
    >
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

          const layoutNdc = getPeopleLayoutNdc(index, orderedCharacters.length, activeLayoutPreset, activeLayoutColumns);
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
          const useCustomLayout = isPeopleMode && activeLayoutPreset === 'custom';
          const lineupTarget = isPeopleMode
            ? useCustomLayout
              ? { x: peopleOverride.x, z: peopleOverride.z }
              : projectedLineupTarget
            : projectedLineupTarget;
          const activeOverride = useCustomLayout ? peopleOverride : homeOverride;

          return (
            <group key={character.id}>
              {isPeopleMode && (
                <NamePlate3D
                  name={character.name}
                  position={[
                    lineupTarget.x + Math.sin(southFacingY) * 0.56,
                    -0.42,
                    lineupTarget.z + Math.cos(southFacingY) * 0.56,
                  ]}
                  rotationY={southFacingY}
                  opacity={editMode ? 0 : arrivedIds[character.id] ? 1 : peopleTransitionProgress >= 0.999 ? 1 : 0}
                />
              )}
              <DraggableCharacter
                id={character.id}
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
