'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Group } from 'three';
import type { Mesh, PointLight } from 'three';
import { Plane, Vector3 } from 'three';
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

export const environmentModelIds = [
  'pond',
  'tree-1',
  'tree-2',
  'tree-3',
  'tree-4',
  'tree-5',
  'sauna',
  'logs',
] as const;

export type EnvironmentModelId = (typeof environmentModelIds)[number];

const defaultEnvironmentOverrides: Record<EnvironmentModelId, ModelOverride> = {
  pond: { x: -0.3093536754628978, y: -0.42, z: -5.7419247298717035, scale: 1.8, rotX: 0, rotY: 0, rotZ: 0 },
  'tree-1': { x: 1.0425239028110678, y: -0.45, z: 1.7631247913384325, scale: 1, rotX: 0, rotY: 0, rotZ: 0 },
  'tree-2': { x: -3.5846999193099407, y: -0.45, z: -5.139617451584957, scale: 1, rotX: 0, rotY: 0, rotZ: 0 },
  'tree-3': { x: 1.8330481574847899, y: -0.45, z: -2.423364785436882, scale: 1, rotX: 0, rotY: 0, rotZ: 0 },
  'tree-4': { x: 6.1, y: -0.45, z: -2, scale: 1, rotX: 0, rotY: 0, rotZ: 0 },
  'tree-5': { x: -3.556605830775676, y: -0.45, z: -1.1678224883057526, scale: 1, rotX: 0, rotY: 0, rotZ: 0 },
  sauna: { x: 2.811093596624368, y: -0.45, z: -7.3274724780907965, scale: 0.98, rotX: 0.02, rotY: -1.07, rotZ: 0 },
  logs: { x: -3.956337458753273, y: 0, z: 0.6318717588212657, scale: 1, rotX: 0, rotY: 0, rotZ: 0 },
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
  characterOverrides: Record<string, ModelOverride>;
  fireOverride: ModelOverride;
  environmentOverrides: Record<EnvironmentModelId, ModelOverride>;
};

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
  fireOverride: {
    x: -0.000407912779931463,
    y: -0.3,
    z: -0.5893181362014639,
    scale: 1,
    rotX: 0,
    rotY: 0,
    rotZ: 0,
  },
  environmentOverrides: defaultEnvironmentOverrides,
};

type LandingScene3DProps = {
  characters: Array<{ id: string; config: CharacterConfig }>;
  movementBehavior?: MovementBehavior;
  onRuntimeError?: () => void;
  tuning?: SceneTuning;
  editMode?: boolean;
  selectedModelId?: string | null;
  onSelectModel?: (modelId: string) => void;
  onCharacterOverrideChange?: (characterId: string, override: ModelOverride) => void;
  onFireOverrideChange?: (override: ModelOverride) => void;
  onEnvironmentOverrideChange?: (modelId: EnvironmentModelId, override: ModelOverride) => void;
};

function CameraController({ tuning }: { tuning: SceneTuning }) {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(tuning.cameraX, tuning.cameraY, tuning.cameraZ);
    if ('fov' in camera) {
      camera.fov = tuning.fov;
      camera.updateProjectionMatrix();
    }
    camera.lookAt(0, 0, 0);
  }, [camera, tuning.cameraX, tuning.cameraY, tuning.cameraZ, tuning.fov]);

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
}) {
  const groupRef = useRef<Group>(null);
  const dragPlane = useMemo(() => new Plane(new Vector3(0, 1, 0), -override.y), [override.y]);
  const dragPoint = useMemo(() => new Vector3(), []);
  const targetPosition = useRef({ x: override.x, z: override.z });
  const dragOffset = useRef({ x: 0, z: 0 });
  const isDragging = useRef(false);

  useEffect(() => {
    targetPosition.current = { x: override.x, z: override.z };
  }, [override.x, override.z]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    const smooth = isDragging.current ? 0.42 : 0.22;
    groupRef.current.position.x += (targetPosition.current.x - groupRef.current.position.x) * smooth;
    groupRef.current.position.z += (targetPosition.current.z - groupRef.current.position.z) * smooth;

    const bob =
      movementBehavior === 'run' && !editMode
        ? Math.abs(Math.sin(clock.elapsedTime * 5.4 + id.charCodeAt(0) * 0.18)) * 0.045
        : 0;
    groupRef.current.position.y = override.y + bob;
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
        pose={config.pose}
        rotation={config.rotation}
        headShape={config.headShape}
        bodyShape={config.bodyShape}
        legShape={config.legShape}
        accessories={config.accessories}
        colors={config.colors}
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

function DraggableFire({
  override,
  selected,
  editMode,
  onSelect,
  onOverrideChange,
}: {
  override: ModelOverride;
  selected: boolean;
  editMode: boolean;
  onSelect: (modelId: string) => void;
  onOverrideChange: (next: ModelOverride) => void;
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
        <meshStandardMaterial color="#6b4b37" flatShading />
      </mesh>
      <mesh ref={flameRef} position={[0, 0.14, 0]} castShadow>
        <coneGeometry args={[0.13, 0.25, 6]} />
        <meshStandardMaterial color="#fca75f" emissive="#f57f45" emissiveIntensity={0.5} flatShading />
      </mesh>
      <pointLight ref={lightRef} position={[0, 0.25, 0]} intensity={0.5} distance={2.4} color="#ffb566" />
      {selected && editMode && (
        <mesh position={[0, 0.45, 0]}>
          <sphereGeometry args={[0.06, 10, 10]} />
          <meshBasicMaterial color="#ffde8f" />
        </mesh>
      )}
    </group>
  );
}

function DraggableEnvironmentProp({
  id,
  override,
  selected,
  editMode,
  onSelect,
  onOverrideChange,
  indicatorHeight,
  children,
}: {
  id: EnvironmentModelId;
  override: ModelOverride;
  selected: boolean;
  editMode: boolean;
  onSelect: (modelId: string) => void;
  onOverrideChange: (modelId: EnvironmentModelId, next: ModelOverride) => void;
  indicatorHeight?: number;
  children: ReactNode;
}) {
  const dragPlane = useMemo(() => new Plane(new Vector3(0, 1, 0), -override.y), [override.y]);
  const dragPoint = useMemo(() => new Vector3(), []);
  const targetPosition = useRef({ x: override.x, z: override.z });
  const dragOffset = useRef({ x: 0, z: 0 });
  const isDragging = useRef(false);

  useEffect(() => {
    targetPosition.current = { x: override.x, z: override.z };
  }, [override.x, override.z]);

  return (
    <group
      position={[targetPosition.current.x, override.y, targetPosition.current.z]}
      rotation={[override.rotX, override.rotY, override.rotZ]}
      scale={[override.scale, override.scale, override.scale]}
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
        const next = {
          ...override,
          x: Math.max(-80, Math.min(80, dragPoint.x + dragOffset.current.x)),
          z: Math.max(-80, Math.min(80, dragPoint.z + dragOffset.current.z)),
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
      {children}
      {selected && editMode && (
        <mesh position={[0, indicatorHeight ?? 0.8, 0]}>
          <sphereGeometry args={[0.06, 10, 10]} />
          <meshBasicMaterial color="#9ec5ff" />
        </mesh>
      )}
    </group>
  );
}

function EnvironmentProps({
  editMode,
  selectedModelId,
  onSelectModel,
  overrides,
  onOverrideChange,
}: {
  editMode: boolean;
  selectedModelId: string | null;
  onSelectModel: (modelId: string) => void;
  overrides: Record<EnvironmentModelId, ModelOverride>;
  onOverrideChange: (modelId: EnvironmentModelId, override: ModelOverride) => void;
}) {
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
      smoke.position.x = 0.12 + Math.sin(offset * 1.7) * 0.08;
      smoke.position.z = 0.1 + Math.cos(offset * 1.35) * 0.08;
      const puffScale = 1 + ((offset % 1.8) / 1.8) * 0.5;
      smoke.scale.setScalar(puffScale);
    });
  });

  const treeIds: EnvironmentModelId[] = ['tree-1', 'tree-2', 'tree-3', 'tree-4', 'tree-5'];
  const logPositions: Array<[number, number, number]> = [
    [2.2, -0.35, 0.2],
    [2.85, -0.35, 0.45],
    [2.45, -0.35, 0.85],
    [3.15, -0.35, 0.95],
  ];

  return (
    <>
      <DraggableEnvironmentProp
        id="pond"
        override={overrides.pond}
        selected={selectedModelId === 'pond'}
        editMode={editMode}
        onSelect={onSelectModel}
        onOverrideChange={onOverrideChange}
        indicatorHeight={0.2}
      >
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[1.65, 36]} />
          <meshStandardMaterial color="#2d6d71" flatShading />
        </mesh>
        <mesh ref={pondRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <circleGeometry args={[1.45, 36]} />
          <meshStandardMaterial color="#70bec8" transparent opacity={0.78} roughness={0.3} />
        </mesh>
      </DraggableEnvironmentProp>

      {treeIds.map((treeId, index) => (
        <DraggableEnvironmentProp
          key={treeId}
          id={treeId}
          override={overrides[treeId]}
          selected={selectedModelId === treeId}
          editMode={editMode}
          onSelect={onSelectModel}
          onOverrideChange={onOverrideChange}
          indicatorHeight={2}
        >
          <mesh castShadow position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.1, 0.14, 1.1, 8]} />
            <meshStandardMaterial color="#6d4a35" flatShading />
          </mesh>
          <group
            ref={(node) => {
              treeTopRefs.current[index] = node;
            }}
            position={[0, 1.2, 0]}
          >
            <mesh castShadow>
              <coneGeometry args={[0.62, 1.1, 10]} />
              <meshStandardMaterial color="#4f8d53" flatShading />
            </mesh>
            <mesh castShadow position={[0, 0.42, 0]}>
              <coneGeometry args={[0.45, 0.85, 10]} />
              <meshStandardMaterial color="#5aa25d" flatShading />
            </mesh>
          </group>
        </DraggableEnvironmentProp>
      ))}

      <DraggableEnvironmentProp
        id="sauna"
        override={overrides.sauna}
        selected={selectedModelId === 'sauna'}
        editMode={editMode}
        onSelect={onSelectModel}
        onOverrideChange={onOverrideChange}
        indicatorHeight={2.2}
      >
        <mesh castShadow position={[0, 0.4, 0]}>
          <boxGeometry args={[1.8, 0.8, 1.4]} />
          <meshStandardMaterial color="#7a5a3f" flatShading />
        </mesh>
        <mesh castShadow position={[0, 1, 0]}>
          <coneGeometry args={[1.25, 0.85, 4]} />
          <meshStandardMaterial color="#5b3f2e" flatShading />
        </mesh>
        <mesh castShadow position={[0.6, 1.65, 0.15]}>
          <boxGeometry args={[0.24, 0.55, 0.24]} />
          <meshStandardMaterial color="#4b4e52" flatShading />
        </mesh>
        {Array.from({ length: 4 }).map((_, index) => (
          <mesh
            key={`smoke-${index}`}
            ref={(node) => {
              smokeRefs.current[index] = node;
            }}
            position={[0.12, 1.9 + index * 0.23, 0.1]}
          >
            <sphereGeometry args={[0.13 + index * 0.015, 10, 10]} />
            <meshStandardMaterial color="#d2d6dc" transparent opacity={0.35} />
          </mesh>
        ))}
      </DraggableEnvironmentProp>

      <DraggableEnvironmentProp
        id="logs"
        override={overrides.logs}
        selected={selectedModelId === 'logs'}
        editMode={editMode}
        onSelect={onSelectModel}
        onOverrideChange={onOverrideChange}
        indicatorHeight={0.7}
      >
        {logPositions.map((position, index) => (
          <mesh
            key={`log-${index}`}
            castShadow
            position={[position[0], position[1], position[2]]}
            rotation={[Math.PI / 2, index % 2 === 0 ? 0.35 : -0.45, 0]}
          >
            <cylinderGeometry args={[0.1, 0.1, 0.95, 10]} />
            <meshStandardMaterial color="#8a6446" flatShading />
          </mesh>
        ))}
      </DraggableEnvironmentProp>
    </>
  );
}

export default function LandingScene3D({
  characters,
  movementBehavior = 'idle',
  onRuntimeError,
  tuning = defaultSceneTuning,
  editMode = false,
  selectedModelId = null,
  onSelectModel,
  onCharacterOverrideChange,
  onFireOverrideChange,
  onEnvironmentOverrideChange,
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

  if (!isWebGLAvailable) {
    return null;
  }

  const canvasScalePercent = tuning.sceneCanvasScale * 100;
  const canvasInsetPercent = (100 - canvasScalePercent) / 2;

  return (
    <div
      className="scene-layer"
      style={{
        width: `${canvasScalePercent}%`,
        height: `${canvasScalePercent}%`,
        left: `${canvasInsetPercent}%`,
        top: `${canvasInsetPercent}%`,
        transform: `translate(${tuning.sceneOffsetX}%, ${tuning.sceneOffsetY}%)`,
      }}
      aria-hidden="true"
    >
      <Canvas camera={{ position: [tuning.cameraX, tuning.cameraY, tuning.cameraZ], fov: tuning.fov }} shadows>
        <CameraController tuning={tuning} />
        <color attach="background" args={['#112126']} />
        <fog attach="fog" args={['#112126', tuning.fogNear, tuning.fogFar]} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[2.5, 4, 2.5]} intensity={1} color="#d4f7dc" castShadow />

        <mesh position={[0, -0.45, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[tuning.sceneRadius, 72]} />
          <meshStandardMaterial color="#2e4a42" flatShading />
        </mesh>

        <EnvironmentProps
          editMode={editMode}
          selectedModelId={selectedModelId}
          onSelectModel={(id) => onSelectModel?.(id)}
          overrides={tuning.environmentOverrides}
          onOverrideChange={(id, next) => onEnvironmentOverrideChange?.(id, next)}
        />

        <DraggableFire
          override={tuning.fireOverride}
          selected={selectedModelId === 'fire'}
          editMode={editMode}
          onSelect={(id) => onSelectModel?.(id)}
          onOverrideChange={(next) => onFireOverrideChange?.(next)}
        />

        {orderedCharacters.map((character) => {
          const [baseX, baseY, baseZ] = character.config.position;
          const [baseRotX, baseRotY, baseRotZ] = character.config.rotation;
          const override = tuning.characterOverrides[character.id] ?? {
            x: baseX,
            y: baseY,
            z: baseZ,
            scale: 1,
            rotX: baseRotX,
            rotY: baseRotY,
            rotZ: baseRotZ,
          };

          return (
            <DraggableCharacter
              key={character.id}
              id={character.id}
              config={character.config}
              movementBehavior={movementBehavior}
              editMode={editMode}
              selected={selectedModelId === character.id}
              onSelect={(id) => onSelectModel?.(id)}
              onOverrideChange={(id, next) => onCharacterOverrideChange?.(id, next)}
              override={override}
              globalCharacterScale={tuning.characterScale}
            />
          );
        })}
      </Canvas>
    </div>
  );
}
