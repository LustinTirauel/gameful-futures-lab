'use client';

import { Canvas } from '@react-three/fiber';
import { useEffect, useMemo, useState } from 'react';
import PrimitiveCharacter from './PrimitiveCharacter';

type LandingScene3DProps = {
  onRuntimeError?: () => void;
};

type CharacterSetup = {
  id: string;
  pose: 'fishing' | 'sleeping' | 'chatting' | 'campfire-sit' | 'standing';
  position: [number, number, number];
  rotation: [number, number, number];
  headShape: 'sphere' | 'box' | 'cone';
  bodyShape: 'box' | 'cylinder' | 'cone';
  legShape: 'box' | 'cylinder';
  accessories: ('hat' | 'backpack' | 'fishingRod' | 'pillow' | 'speechBubble' | 'mug')[];
  colors: {
    skin: string;
    body: string;
    legs: string;
    feet: string;
    accessory: string;
  };
};

export default function LandingScene3D({ onRuntimeError }: LandingScene3DProps) {
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

  const characters = useMemo<CharacterSetup[]>(
    () => [
      {
        id: 'fishing',
        pose: 'fishing',
        position: [-1.65, -0.2, 0.45],
        rotation: [0, 0.45, 0],
        headShape: 'sphere',
        bodyShape: 'cylinder',
        legShape: 'box',
        accessories: ['fishingRod', 'hat'],
        colors: {
          skin: '#ffd4aa',
          body: '#5ca5d8',
          legs: '#385a79',
          feet: '#233448',
          accessory: '#f2b96a',
        },
      },
      {
        id: 'sleeping',
        pose: 'sleeping',
        position: [-0.65, -0.22, 0.7],
        rotation: [0, -0.15, 0],
        headShape: 'box',
        bodyShape: 'box',
        legShape: 'box',
        accessories: ['pillow'],
        colors: {
          skin: '#f7d2b1',
          body: '#8bb17f',
          legs: '#566a50',
          feet: '#374630',
          accessory: '#d9f2ff',
        },
      },
      {
        id: 'chatting',
        pose: 'chatting',
        position: [0.35, -0.2, 0.35],
        rotation: [0, -0.25, 0],
        headShape: 'cone',
        bodyShape: 'cone',
        legShape: 'cylinder',
        accessories: ['speechBubble', 'backpack'],
        colors: {
          skin: '#f7d4c0',
          body: '#cb8bb8',
          legs: '#755282',
          feet: '#4f3657',
          accessory: '#f7f0cb',
        },
      },
      {
        id: 'campfire-sit',
        pose: 'campfire-sit',
        position: [1.2, -0.23, 0.5],
        rotation: [0, -0.8, 0],
        headShape: 'sphere',
        bodyShape: 'box',
        legShape: 'cylinder',
        accessories: ['mug'],
        colors: {
          skin: '#ffd0b8',
          body: '#cb7b65',
          legs: '#7c4a4f',
          feet: '#50333a',
          accessory: '#f6c36f',
        },
      },
      {
        id: 'standing',
        pose: 'standing',
        position: [1.95, -0.2, 0.2],
        rotation: [0, -0.3, 0],
        headShape: 'box',
        bodyShape: 'cylinder',
        legShape: 'box',
        accessories: ['hat', 'backpack'],
        colors: {
          skin: '#ffd8b5',
          body: '#6fb790',
          legs: '#3f6c57',
          feet: '#2f4d3f',
          accessory: '#ffde8f',
        },
      },
    ],
    [],
  );

  if (!isWebGLAvailable) {
    return null;
  }

  return (
    <div className="scene-layer" aria-hidden="true">
      <Canvas camera={{ position: [0, 0.8, 4.6], fov: 44 }} shadows>
        <color attach="background" args={['#112126']} />
        <fog attach="fog" args={['#112126', 4, 10]} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[2.5, 4, 2.5]} intensity={1} color="#d4f7dc" castShadow />

        <mesh position={[0, -0.45, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[4.2, 20]} />
          <meshStandardMaterial color="#2e4a42" flatShading />
        </mesh>

        <group position={[0.7, -0.28, 0.6]}>
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

        {characters.map((character) => (
          <PrimitiveCharacter
            key={character.id}
            pose={character.pose}
            position={character.position}
            rotation={character.rotation}
            headShape={character.headShape}
            bodyShape={character.bodyShape}
            legShape={character.legShape}
            accessories={character.accessories}
            colors={character.colors}
          />
        ))}
      </Canvas>
    </div>
  );
}
