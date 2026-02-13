'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Group } from 'three';
import { Plane, Vector3 } from 'three';
import type { CharacterConfig } from '../lib/characterOptions';
import PrimitiveCharacter from './PrimitiveCharacter';

type MovementBehavior = 'idle' | 'run';

export type CharacterOverride = {
  x: number;
  y: number;
  z: number;
  scale: number;
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
  sceneRadius: number;
  characterOverrides: Record<string, CharacterOverride>;
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
  sceneRadius: 8,
  characterOverrides: {},
};

const campfirePosition: [number, number, number] = [-1.2, -0.3, -2.7];

type LandingScene3DProps = {
  characters: Array<{ id: string; config: CharacterConfig }>;
  movementBehavior?: MovementBehavior;
  onRuntimeError?: () => void;
  tuning?: SceneTuning;
  editMode?: boolean;
  selectedCharacterId?: string | null;
  onSelectCharacter?: (characterId: string) => void;
  onCharacterOverrideChange?: (characterId: string, override: CharacterOverride) => void;
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

function CharacterGroup({
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
  override: CharacterOverride;
  editMode: boolean;
  selected: boolean;
  onSelect: (characterId: string) => void;
  onOverrideChange: (characterId: string, next: CharacterOverride) => void;
  globalCharacterScale: number;
}) {
  const groupRef = useRef<Group>(null);
  const dragPlane = useMemo(() => new Plane(new Vector3(0, 1, 0), -override.y), [override.y]);
  const dragPoint = useMemo(() => new Vector3(), []);
  const dragOffset = useRef({ x: 0, z: 0 });
  const isDragging = useRef(false);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    const bob =
      movementBehavior === 'run' && !editMode
        ? Math.abs(Math.sin(clock.elapsedTime * 5.4 + id.charCodeAt(0) * 0.18)) * 0.045
        : 0;

    groupRef.current.position.set(override.x, override.y + bob, override.z);
  });

  return (
    <group
      ref={groupRef}
      scale={[override.scale * globalCharacterScale, override.scale * globalCharacterScale, override.scale * globalCharacterScale]}
      onPointerDown={(event) => {
        if (!editMode) return;
        event.stopPropagation();
        onSelect(id);
        isDragging.current = true;
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
        onOverrideChange(id, {
          ...override,
          x: dragPoint.x + dragOffset.current.x,
          z: dragPoint.z + dragOffset.current.z,
        });
      }}
      onPointerUp={(event) => {
        if (!editMode) return;
        event.stopPropagation();
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
        <mesh position={[0, 0.98, 0]}>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshBasicMaterial color="#9de6a4" />
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
  selectedCharacterId = null,
  onSelectCharacter,
  onCharacterOverrideChange,
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

  return (
    <div
      className="scene-layer"
      style={{ transform: `translate(${tuning.sceneOffsetX}%, ${tuning.sceneOffsetY}%)` }}
      aria-hidden="true"
    >
      <Canvas camera={{ position: [tuning.cameraX, tuning.cameraY, tuning.cameraZ], fov: tuning.fov }} shadows>
        <CameraController tuning={tuning} />
        <color attach="background" args={['#112126']} />
        <fog attach="fog" args={['#112126', tuning.fogNear, tuning.fogFar]} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[2.5, 4, 2.5]} intensity={1} color="#d4f7dc" castShadow />

        <mesh position={[0, -0.45, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[tuning.sceneRadius, 36]} />
          <meshStandardMaterial color="#2e4a42" flatShading />
        </mesh>

        <group position={campfirePosition}>
          <mesh castShadow>
            <cylinderGeometry args={[0.18, 0.22, 0.12, 6]} />
            <meshStandardMaterial color="#6b4b37" flatShading />
          </mesh>
          <mesh position={[0, 0.14, 0]} castShadow>
            <coneGeometry args={[0.13, 0.25, 6]} />
            <meshStandardMaterial color="#fca75f" emissive="#f57f45" emissiveIntensity={0.5} flatShading />
          </mesh>
          <pointLight position={[0, 0.25, 0]} intensity={0.5} distance={2.4} color="#ffb566" />
        </group>

        {orderedCharacters.map((character) => {
          const [baseX, baseY, baseZ] = character.config.position;
          const override = tuning.characterOverrides[character.id] ?? {
            x: baseX,
            y: baseY,
            z: baseZ,
            scale: 1,
          };

          return (
            <CharacterGroup
              key={character.id}
              id={character.id}
              config={character.config}
              movementBehavior={movementBehavior}
              editMode={editMode}
              selected={selectedCharacterId === character.id}
              onSelect={(id) => onSelectCharacter?.(id)}
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
