'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Group } from 'three';
import type { CharacterConfig } from '../lib/characterOptions';
import PrimitiveCharacter from './PrimitiveCharacter';

type MovementBehavior = 'idle' | 'run';

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
  campfireX: number;
  campfireY: number;
  campfireZ: number;
};

export const defaultSceneTuning: SceneTuning = {
  cameraX: 6.3,
  cameraY: 5.2,
  cameraZ: 6.3,
  fov: 29,
  fogNear: 8,
  fogFar: 20,
  characterScale: 0.9,
  sceneOffsetX: -8,
  sceneOffsetY: 6,
  campfireX: -0.9,
  campfireY: -0.36,
  campfireZ: -2.8,
};

type LandingScene3DProps = {
  characters: Array<{ id: string; config: CharacterConfig }>;
  movementBehavior?: MovementBehavior;
  onRuntimeError?: () => void;
  tuning?: SceneTuning;
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
  characterScale,
}: {
  id: string;
  config: CharacterConfig;
  movementBehavior: MovementBehavior;
  characterScale: number;
}) {
  const groupRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    const [baseX, baseY, baseZ] = config.position;

    if (movementBehavior === 'run') {
      const t = clock.elapsedTime;
      const phaseOffset = id.charCodeAt(0) * 0.18;
      const stride = Math.sin(t * 2.7 + phaseOffset) * 0.18;
      const bob = Math.abs(Math.sin(t * 5.4 + phaseOffset)) * 0.045;
      groupRef.current.position.x = baseX + stride;
      groupRef.current.position.y = baseY + bob;
      groupRef.current.position.z = baseZ;
    } else {
      groupRef.current.position.x = baseX;
      groupRef.current.position.y = baseY;
      groupRef.current.position.z = baseZ;
    }
  });

  return (
    <group ref={groupRef} scale={[characterScale, characterScale, characterScale]}>
      <PrimitiveCharacter
        pose={config.pose}
        rotation={config.rotation}
        headShape={config.headShape}
        bodyShape={config.bodyShape}
        legShape={config.legShape}
        accessories={config.accessories}
        colors={config.colors}
      />
    </group>
  );
}

export default function LandingScene3D({
  characters,
  movementBehavior = 'idle',
  onRuntimeError,
  tuning = defaultSceneTuning,
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
          <circleGeometry args={[4.2, 20]} />
          <meshStandardMaterial color="#2e4a42" flatShading />
        </mesh>

        <group position={[tuning.campfireX, tuning.campfireY, tuning.campfireZ]}>
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

        {orderedCharacters.map((character) => (
          <CharacterGroup
            key={character.id}
            id={character.id}
            config={character.config}
            movementBehavior={movementBehavior}
            characterScale={tuning.characterScale}
          />
        ))}
      </Canvas>
    </div>
  );
}
