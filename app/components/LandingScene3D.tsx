'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Group } from 'three';
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
};

export const defaultSceneTuning: SceneTuning = {
  cameraX: 7.5,
  cameraY: 7.2,
  cameraZ: 7.2,
  fov: 29,
  fogNear: 12,
  fogFar: 31,
  characterScale: 0.78,
  sceneOffsetX: -8.5,
  sceneOffsetY: 3,
  sceneCanvasScale: 1.4,
  sceneRadius: 40,
  characterOverrides: {},
  fireOverride: {
    x: -1.2,
    y: -0.3,
    z: -2.7,
    scale: 1,
    rotX: 0,
    rotY: 0,
    rotZ: 0,
  },
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
        const hit = event.ray.intersectPlane(dragPlane, dragPoint);
        if (!hit) return;

        const nextX = Math.max(-80, Math.min(80, dragPoint.x + dragOffset.current.x));
        const nextZ = Math.max(-80, Math.min(80, dragPoint.z + dragOffset.current.z));
        targetPosition.current = { x: nextX, z: nextZ };
      }}
      onPointerUp={(event) => {
        if (!editMode) return;
        event.stopPropagation();
        isDragging.current = false;
        onOverrideChange(id, {
          ...override,
          x: targetPosition.current.x,
          z: targetPosition.current.z,
        });
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
        const hit = event.ray.intersectPlane(dragPlane, dragPoint);
        if (!hit) return;
        targetPosition.current = {
          x: Math.max(-80, Math.min(80, dragPoint.x + dragOffset.current.x)),
          z: Math.max(-80, Math.min(80, dragPoint.z + dragOffset.current.z)),
        };
      }}
      onPointerUp={(event) => {
        if (!editMode) return;
        event.stopPropagation();
        isDragging.current = false;
        onOverrideChange({
          ...override,
          x: targetPosition.current.x,
          z: targetPosition.current.z,
        });
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
      <mesh position={[0, 0.14, 0]} castShadow>
        <coneGeometry args={[0.13, 0.25, 6]} />
        <meshStandardMaterial color="#fca75f" emissive="#f57f45" emissiveIntensity={0.5} flatShading />
      </mesh>
      <pointLight position={[0, 0.25, 0]} intensity={0.5} distance={2.4} color="#ffb566" />
      {selected && editMode && (
        <mesh position={[0, 0.45, 0]}>
          <sphereGeometry args={[0.06, 10, 10]} />
          <meshBasicMaterial color="#ffde8f" />
        </mesh>
      )}
    </group>
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
