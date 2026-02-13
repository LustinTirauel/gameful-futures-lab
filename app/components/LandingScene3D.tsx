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
  preRunTurnSeconds: number;
  runDurationSeconds: number;
  characterOverrides: Record<string, ModelOverride>;
  peopleCharacterOverrides: Record<string, ModelOverride>;
  peopleViewTuning: PeopleViewTuning;
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
  preRunTurnSeconds: 0,
  runDurationSeconds: 0.5,
  characterOverrides: {
    alex: {
      x: -2.4920371576490377,
      y: -0.15,
      z: -3.4155691273894115,
      scale: 1,
      rotX: 0.2,
      rotY: 0.52,
      rotZ: 0,
    },
    bea: {
      x: -2.6581781584628095,
      y: -0.25,
      z: -1.6065556425529488,
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
      x: 1.6397357610384382,
      y: -0.1,
      z: -1.281345498231088,
      scale: 0.67,
      rotX: 0.1,
      rotY: 2.36,
      rotZ: 0.13,
    },
  },
  peopleCharacterOverrides: {},
  peopleViewTuning: {
    cameraX: 6.1,
    cameraY: 7.4,
    cameraZ: 5.8,
    fov: 39,
    fogNear: 12,
    fogFar: 31,
    characterScale: 0.78,
    sceneOffsetX: 0,
    sceneOffsetY: 7.5,
    sceneCanvasScale: 1.4,
    sceneRadius: 40,
  },
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
    pond: { x: -0.3093536754628978, y: -0.42, z: -5.7419247298717035, scale: 1.8, rotX: 0, rotY: 0, rotZ: 0 },
    'tree-1': { x: 1.0425239028110678, y: -0.45, z: 1.7631247913384325, scale: 1, rotX: 0, rotY: 0, rotZ: 0 },
    'tree-2': { x: -3.5846999193099407, y: -0.45, z: -5.139617451584957, scale: 1, rotX: 0, rotY: 0, rotZ: 0 },
    'tree-3': { x: 1.8330481574847899, y: -0.45, z: -2.423364785436882, scale: 1, rotX: 0, rotY: 0, rotZ: 0 },
    'tree-4': { x: 6.1, y: -0.45, z: -2, scale: 1, rotX: 0, rotY: 0, rotZ: 0 },
    'tree-5': { x: -3.556605830775676, y: -0.45, z: -1.1678224883057526, scale: 1, rotX: 0, rotY: 0, rotZ: 0 },
    sauna: { x: 2.811093596624368, y: -0.45, z: -7.3274724780907965, scale: 0.98, rotX: 0.02, rotY: -1.07, rotZ: 0 },
    logs: { x: -3.956337458753273, y: 0, z: 0.6318717588212657, scale: 1, rotX: 0, rotY: 0, rotZ: 0 },
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
  onFireOverrideChange?: (override: ModelOverride) => void;
  onCharacterActivate?: (characterId: string) => void;
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
  isPreRunTurning,
  peopleTransitionProgress,
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
  isPreRunTurning: boolean;
  peopleTransitionProgress: number;
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

  useEffect(() => {
    targetPosition.current = { x: override.x, z: override.z };
  }, [override.x, override.z]);

  useEffect(() => {
    if (editMode) return;

    const currentX = groupRef.current?.position.x ?? override.x;
    const currentZ = groupRef.current?.position.z ?? override.z;
    peopleStartPosition.current = { x: currentX, z: currentZ };
    hasArrivedRef.current = false;
    onArrivalChange?.(id, false);
    setIsRunningInPeople(false);
  }, [id, isPeopleMode, editMode, override.x, override.z]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    const inPeopleTransition = !editMode && (isPeopleMode || peopleTransitionProgress > 0.001);

    if (inPeopleTransition) {
      const desiredX = override.x + (lineupTarget.x - override.x) * peopleTransitionProgress;
      const desiredZ = override.z + (lineupTarget.z - override.z) * peopleTransitionProgress;

      groupRef.current.position.x = desiredX;
      groupRef.current.position.z = desiredZ;

      const hasArrived = isPeopleMode && !isPreRunTurning && peopleTransitionProgress >= 0.999;
      if (hasArrived !== hasArrivedRef.current) {
        hasArrivedRef.current = hasArrived;
        onArrivalChange?.(id, hasArrived);
      }

      const isRunningNow = !isPreRunTurning && peopleTransitionProgress > 0.001 && peopleTransitionProgress < 0.999;
      if (isRunningNow !== isRunningInPeople) {
        setIsRunningInPeople(isRunningNow);
      }

      const bob = isRunningNow ? Math.abs(Math.sin(clock.elapsedTime * 5.4 + id.charCodeAt(0) * 0.18)) * 0.045 : 0;
      groupRef.current.position.y = override.y + bob;

      const runTargetX = isPeopleMode ? lineupTarget.x : override.x;
      const runTargetZ = isPeopleMode ? lineupTarget.z : override.z;
      const preTurnY = Math.atan2(lineupTarget.x - desiredX, lineupTarget.z - desiredZ);
      const runDirectionY = Math.atan2(runTargetX - desiredX, runTargetZ - desiredZ);
      const desiredRotY = isPreRunTurning ? preTurnY : isRunningNow ? runDirectionY : isPeopleMode ? southFacingY : override.rotY;

      groupRef.current.rotation.y += (desiredRotY - groupRef.current.rotation.y) * 0.12;
      groupRef.current.rotation.x += (0 - groupRef.current.rotation.x) * 0.12;
      groupRef.current.rotation.z += (0 - groupRef.current.rotation.z) * 0.12;
    } else {
      const smooth = isDragging.current ? 0.42 : 0.12;
      groupRef.current.position.x += (targetPosition.current.x - groupRef.current.position.x) * smooth;
      groupRef.current.position.z += (targetPosition.current.z - groupRef.current.position.z) * smooth;

      const bob = movementBehavior === 'run' && !editMode
        ? Math.abs(Math.sin(clock.elapsedTime * 5.4 + id.charCodeAt(0) * 0.18)) * 0.045
        : 0;
      groupRef.current.position.y = override.y + bob;

      groupRef.current.rotation.y += (override.rotY - groupRef.current.rotation.y) * 0.12;
      groupRef.current.rotation.x += (override.rotX - groupRef.current.rotation.x) * 0.12;
      groupRef.current.rotation.z += (override.rotZ - groupRef.current.rotation.z) * 0.12;
    }
  });

  return (
    <group
      ref={groupRef}
      position={[override.x, override.y, override.z]}
      rotation={[override.rotX, override.rotY, override.rotZ]}
      scale={[
        override.scale * globalCharacterScale,
        override.scale * globalCharacterScale,
        override.scale * globalCharacterScale,
      ]}
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
        pose={isPeopleMode ? 'standing' : config.pose}
        locomotion={isPeopleMode ? (isRunningInPeople ? 'run' : 'idle') : movementBehavior}
        rotation={config.rotation}
        headShape={config.headShape}
        bodyShape={config.bodyShape}
        legShape={config.legShape}
        accessories={config.accessories}
        colors={config.colors}
        hoverBehavior={isPeopleMode ? 'wave' : 'none'}
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

function EnvironmentProps({ alpha = 1 }: { alpha?: number }) {
  const pondRef = useRef<Mesh>(null);
  const treeTopRefs = useRef<Array<Group | null>>([]);
  const smokeRefs = useRef<Array<Mesh | null>>([]);

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
      smoke.position.y = 1.9 + index * 0.23 + (offset % 1.8) * 0.42;
      smoke.position.x = 3.48 + Math.sin(offset * 1.7) * 0.08;
      smoke.position.z = -2.2 + Math.cos(offset * 1.35) * 0.08;
      const puffScale = 1 + ((offset % 1.8) / 1.8) * 0.5;
      smoke.scale.setScalar(puffScale);
    });
  });

  const treePositions: Array<[number, number, number]> = [
    [-4.8, -0.45, -4.2],
    [-6, -0.45, -1.5],
    [4.3, -0.45, -4.8],
    [6.1, -0.45, -2],
    [5.2, -0.45, 1.2],
  ];

  const logPositions: Array<[number, number, number]> = [
    [2.2, -0.35, 0.2],
    [2.85, -0.35, 0.45],
    [2.45, -0.35, 0.85],
    [3.15, -0.35, 0.95],
  ];

  return (
    <>
      <group position={[-3.8, -0.42, 2.35]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[1.65, 36]} />
          <meshStandardMaterial color="#2d6d71" flatShading transparent opacity={alpha} />
        </mesh>
        <mesh ref={pondRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <circleGeometry args={[1.45, 36]} />
          <meshStandardMaterial color="#70bec8" transparent opacity={0.78 * alpha} roughness={0.3} />
        </mesh>
      </group>

      {treePositions.map((position, index) => (
        <group key={`tree-${index}`} position={position}>
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

      <group position={[3.6, -0.45, -2.3]}>
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
            position={[3.48, 1.9 + index * 0.23, -2.2]}
          >
            <sphereGeometry args={[0.13 + index * 0.015, 10, 10]} />
            <meshStandardMaterial color="#d2d6dc" transparent opacity={0.35 * alpha} />
          </mesh>
        ))}
      </group>

      <group>
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
    </>
  );
}


function getLineupTarget(index: number, total: number): { xIndex: number; row: number; itemsInRow: number } {
  const columns = 3;
  const row = Math.floor(index / columns);
  const rowStart = row * columns;
  const remaining = Math.max(0, total - rowStart);
  const itemsInRow = Math.min(columns, remaining);
  const xIndex = index - rowStart;
  return { xIndex, row, itemsInRow };
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
  onCharacterActivate,
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
  const preRunTurnSeconds = tuning.preRunTurnSeconds;
  const runDurationSeconds = tuning.runDurationSeconds;
  const totalTransitionSeconds = Math.max(0.01, preRunTurnSeconds + runDurationSeconds);
  const [peopleTransitionProgress, setPeopleTransitionProgress] = useState(0);
  const preTurnShare = totalTransitionSeconds <= 0 ? 0 : preRunTurnSeconds / totalTransitionSeconds;
  const isPreRunTurning = isPeopleMode && peopleTransitionProgress < preTurnShare;

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
    sceneCanvasScale: lerpNumber(
      tuning.sceneCanvasScale,
      peopleTargetTuning.sceneCanvasScale,
      peopleTransitionProgress,
    ),
    sceneRadius: lerpNumber(tuning.sceneRadius, peopleTargetTuning.sceneRadius, peopleTransitionProgress),
  };
  const canvasScalePercent = effectiveTuning.sceneCanvasScale * 100;
  const canvasInsetPercent = (100 - canvasScalePercent) / 2;

  const homeBg = useMemo(() => new Color('#112126'), []);
  const peopleBg = useMemo(() => new Color('#300726'), []);
  const homeGround = useMemo(() => new Color('#2e4a42'), []);
  const peopleGround = useMemo(() => new Color('#5a1e4a'), []);
  const homeLight = useMemo(() => new Color('#d4f7dc'), []);
  const peopleLight = useMemo(() => new Color('#f0b3d7'), []);

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


  if (!isWebGLAvailable) {
    return null;
  }

  return (
    <div
      className="scene-layer"
      style={{
        width: `${canvasScalePercent}%`,
        height: `${canvasScalePercent}%`,
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
        <ambientLight intensity={0.6} />
        <directionalLight position={[2.5, 4, 2.5]} intensity={1} color={directionalColor} castShadow />

        <mesh position={[0, -0.45, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[effectiveTuning.sceneRadius, 72]} />
          <meshStandardMaterial color={groundColor} flatShading />
        </mesh>

        {decorAlpha > 0.01 && <EnvironmentProps alpha={decorAlpha} />}

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

          const lineupSlot = getLineupTarget(index, orderedCharacters.length);
          const rowCenter = (lineupSlot.itemsInRow - 1) / 2;
          const slotX = lineupSlot.xIndex - rowCenter;
          const ndcX = slotX * 0.3;
          const ndcY = 0.24 - lineupSlot.row * 0.42;
          const projectedLineupTarget = projectNdcToGround(
            ndcX,
            ndcY,
            effectiveTuning.cameraX,
            effectiveTuning.cameraY,
            effectiveTuning.cameraZ,
            effectiveTuning.fov,
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
          const lineupTarget = isPeopleMode
            ? { x: peopleOverride.x, z: peopleOverride.z }
            : projectedLineupTarget;
          const activeOverride = isPeopleMode && editMode ? peopleOverride : homeOverride;

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
                  opacity={arrivedIds[character.id] ? 1 : 0}
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
                isPreRunTurning={isPreRunTurning}
                peopleTransitionProgress={peopleTransitionProgress}
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
