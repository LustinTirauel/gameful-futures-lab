'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, useState } from 'react';
import type { GroupProps } from '@react-three/fiber';
import type { Group } from 'three';

type HeadShape = 'sphere' | 'box' | 'cone';
type BodyShape = 'box' | 'cylinder' | 'cone';
type LegShape = 'box' | 'cylinder';
type Accessory = 'hat' | 'backpack' | 'fishingRod' | 'pillow' | 'speechBubble' | 'mug';
type CharacterPose = 'fishing' | 'sleeping' | 'chatting' | 'campfire-sit' | 'standing';

type CharacterColors = {
  skin: string;
  body: string;
  legs: string;
  feet: string;
  accessory: string;
};

type PrimitiveCharacterProps = GroupProps & {
  headShape?: HeadShape;
  bodyShape?: BodyShape;
  legShape?: LegShape;
  accessories?: Accessory[];
  colors?: Partial<CharacterColors>;
  pose?: CharacterPose;
  locomotion?: 'idle' | 'run';
  hoverBehavior?: 'none' | 'wave';
  runMotionSpeed?: number;
  onActivate?: () => void;
};

const defaultColors: CharacterColors = {
  skin: '#ffd7b0',
  body: '#6bb7c5',
  legs: '#4f6f8f',
  feet: '#2c3a4a',
  accessory: '#f6cf68',
};

const poseConfig: Record<CharacterPose, { bodyRotation: [number, number, number]; bodyOffset: [number, number, number]; legSpread: number; headOffset: [number, number, number] }> = {
  fishing: {
    bodyRotation: [0, 0.2, -0.1],
    bodyOffset: [0, 0.04, 0],
    legSpread: 0.22,
    headOffset: [0.02, 0, 0],
  },
  sleeping: {
    bodyRotation: [0, 0, Math.PI / 2.4],
    bodyOffset: [0, -0.03, 0],
    legSpread: 0.16,
    headOffset: [0.22, -0.04, 0],
  },
  chatting: {
    bodyRotation: [0, -0.2, 0.1],
    bodyOffset: [0, 0.05, 0],
    legSpread: 0.24,
    headOffset: [0.02, 0.02, 0],
  },
  'campfire-sit': {
    bodyRotation: [0.25, 0.15, -0.15],
    bodyOffset: [0, -0.04, 0],
    legSpread: 0.31,
    headOffset: [0, 0.01, 0],
  },
  standing: {
    bodyRotation: [0, 0, 0],
    bodyOffset: [0, 0, 0],
    legSpread: 0.2,
    headOffset: [0, 0, 0],
  },
};

export default function PrimitiveCharacter({
  headShape = 'sphere',
  bodyShape = 'box',
  legShape = 'box',
  accessories = [],
  colors,
  pose = 'standing',
  locomotion = 'idle',
  hoverBehavior = 'none',
  runMotionSpeed = 1,
  onActivate,
  ...groupProps
}: PrimitiveCharacterProps) {
  const palette = { ...defaultColors, ...colors };
  const rootRef = useRef<Group>(null);
  const [reaction, setReaction] = useState<{ kind: 'jump' | 'tilt'; progress: number }>({ kind: 'jump', progress: 0 });
  const [hovered, setHovered] = useState(false);

  const config = poseConfig[pose];
  const bodyRef = useRef<Group>(null);
  const headRef = useRef<Group>(null);
  const fishingRodRef = useRef<Group>(null);
  const speechBubbleRef = useRef<Group>(null);
  const pillowRef = useRef<Group>(null);
  const leftArmRef = useRef<Group>(null);
  const rightArmRef = useRef<Group>(null);
  const legRefs = useRef<Array<Group | null>>([]);

  useFrame(({ clock }, delta) => {
    if (!rootRef.current) return;

    const elapsed = clock.elapsedTime;
    const runFrequency = 10 * runMotionSpeed;
    const runCycle = Math.sin(elapsed * runFrequency);
    const nextProgress = Math.max(0, reaction.progress - delta * 1.8);
    if (nextProgress !== reaction.progress) {
      setReaction((prev) => ({ ...prev, progress: nextProgress }));
    }

    const jumpAmount = reaction.kind === 'jump' ? Math.sin(nextProgress * Math.PI) * 0.16 : 0;
    const tiltAmount = reaction.kind === 'tilt' ? Math.sin(nextProgress * Math.PI) * 0.28 : 0;

    const runBob = locomotion === 'run' ? Math.abs(runCycle) * 0.04 : 0;
    rootRef.current.position.y = jumpAmount + runBob;
    rootRef.current.rotation.z = tiltAmount;

    if (headRef.current) {
      const lookAround = pose === 'standing' || pose === 'chatting' || pose === 'fishing';
      headRef.current.rotation.y = lookAround ? Math.sin(elapsed * 0.7) * 0.18 : 0;
      headRef.current.rotation.x = lookAround ? Math.cos(elapsed * 0.5) * 0.06 : 0;
    }

    if (bodyRef.current && pose === 'sleeping') {
      bodyRef.current.position.y = config.bodyOffset[1] + Math.sin(elapsed * 2.2) * 0.018;
    } else if (bodyRef.current) {
      bodyRef.current.position.y = config.bodyOffset[1];
      bodyRef.current.rotation.x = locomotion === 'run' ? runCycle * 0.08 : 0;
    }

    if (fishingRodRef.current && pose === 'fishing') {
      fishingRodRef.current.rotation.z = -0.6 + Math.sin(elapsed * 1.6) * 0.17;
      fishingRodRef.current.rotation.x = Math.cos(elapsed * 1.2) * 0.08;
    }

    if (speechBubbleRef.current && pose === 'chatting') {
      speechBubbleRef.current.position.y = 0.76 + Math.sin(elapsed * 3.1) * 0.04;
      speechBubbleRef.current.rotation.z = Math.sin(elapsed * 3.1) * 0.08;
    }

    if (pillowRef.current && pose === 'sleeping') {
      pillowRef.current.scale.setScalar(1 + Math.sin(elapsed * 2.2) * 0.06);
    }

    if (leftArmRef.current) {
      leftArmRef.current.rotation.x = locomotion === 'run' ? -runCycle * 0.9 : 0;
      leftArmRef.current.rotation.z = locomotion === 'run' ? -0.1 : 0.1;
    }

    if (rightArmRef.current) {
      if (hovered && hoverBehavior === 'wave') {
        rightArmRef.current.rotation.z = -0.5 + Math.sin(elapsed * 7.5) * 0.7;
        rightArmRef.current.rotation.x = 0.15;
      } else {
        rightArmRef.current.rotation.x = locomotion === 'run' ? runCycle * 0.9 : 0;
        rightArmRef.current.rotation.z = locomotion === 'run' ? -0.1 : -0.18;
      }
    }

    legRefs.current.forEach((leg, index) => {
      if (!leg) return;

      if (locomotion === 'run') {
        const phase = index === 0 ? 0 : Math.PI;
        leg.rotation.x = Math.sin(elapsed * 10 + phase) * 0.5;
      } else {
        leg.rotation.x *= 0.82;
      }
    });
  });

  const triggerReaction = () => {
    setReaction((prev) => ({
      kind: prev.kind === 'jump' ? 'tilt' : 'jump',
      progress: 1,
    }));
  };

  const accessoryNodes = useMemo(
    () =>
      accessories.map((accessory) => {
        switch (accessory) {
          case 'hat':
            return (
              <group key="hat" position={[0, 0.66, 0]}>
                <mesh castShadow>
                  <cylinderGeometry args={[0.14, 0.12, 0.16, 5]} />
                  <meshStandardMaterial color={palette.accessory} flatShading />
                </mesh>
                <mesh position={[0, -0.07, 0]} castShadow>
                  <cylinderGeometry args={[0.2, 0.2, 0.03, 6]} />
                  <meshStandardMaterial color={palette.accessory} flatShading />
                </mesh>
              </group>
            );
          case 'backpack':
            return (
              <mesh key="backpack" position={[0, 0.13, -0.2]} castShadow>
                <boxGeometry args={[0.24, 0.3, 0.14]} />
                <meshStandardMaterial color={palette.accessory} flatShading />
              </mesh>
            );
          case 'fishingRod':
            return (
              <group ref={fishingRodRef} key="fishingRod" position={[0.26, 0.1, 0]} rotation={[0, 0.2, -0.6]}>
                <mesh castShadow>
                  <boxGeometry args={[0.05, 0.52, 0.05]} />
                  <meshStandardMaterial color={palette.accessory} flatShading />
                </mesh>
                <mesh position={[0.1, 0.29, 0.01]} castShadow>
                  <boxGeometry args={[0.2, 0.03, 0.03]} />
                  <meshStandardMaterial color="#f0f7ff" flatShading />
                </mesh>
              </group>
            );
          case 'pillow':
            return (
              <group ref={pillowRef} key="pillow" position={[0.25, 0.2, -0.02]} rotation={[0.4, 0.2, 0.2]}>
                <mesh castShadow>
                  <boxGeometry args={[0.28, 0.12, 0.24]} />
                  <meshStandardMaterial color={palette.accessory} flatShading />
                </mesh>
                {pose === 'sleeping' && (
                  <group position={[0.08, 0.18, 0.02]}>
                    <mesh position={[0, 0, 0]} castShadow>
                      <sphereGeometry args={[0.035, 8, 8]} />
                      <meshStandardMaterial color="#d8f1ff" flatShading />
                    </mesh>
                    <mesh position={[0.09, 0.09, 0]} castShadow>
                      <sphereGeometry args={[0.026, 8, 8]} />
                      <meshStandardMaterial color="#d8f1ff" flatShading />
                    </mesh>
                    <mesh position={[0.16, 0.15, 0]} castShadow>
                      <sphereGeometry args={[0.018, 8, 8]} />
                      <meshStandardMaterial color="#d8f1ff" flatShading />
                    </mesh>
                  </group>
                )}
              </group>
            );
          case 'speechBubble':
            return (
              <group ref={speechBubbleRef} key="speechBubble" position={[0.26, 0.76, 0]}>
                <mesh castShadow>
                  <boxGeometry args={[0.28, 0.18, 0.05]} />
                  <meshStandardMaterial color="#f5f5f0" flatShading />
                </mesh>
                <mesh position={[-0.08, -0.14, 0]} rotation={[0, 0, 0.4]} castShadow>
                  <coneGeometry args={[0.05, 0.1, 4]} />
                  <meshStandardMaterial color="#f5f5f0" flatShading />
                </mesh>
              </group>
            );
          case 'mug':
            return (
              <group key="mug" position={[0.22, -0.02, 0.15]}>
                <mesh castShadow>
                  <cylinderGeometry args={[0.06, 0.06, 0.12, 6]} />
                  <meshStandardMaterial color={palette.accessory} flatShading />
                </mesh>
                <mesh position={[0.065, 0.02, 0]} castShadow>
                  <torusGeometry args={[0.03, 0.01, 4, 8, Math.PI]} />
                  <meshStandardMaterial color={palette.accessory} flatShading />
                </mesh>
              </group>
            );
          default:
            return null;
        }
      }),
    [accessories, palette.accessory],
  );

  return (
    <group
      ref={rootRef}
      {...groupProps}
      onClick={(event) => {
        event.stopPropagation();
        triggerReaction();
        onActivate?.();
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      <group ref={bodyRef} rotation={config.bodyRotation} position={config.bodyOffset}>
        <group ref={headRef} position={config.headOffset}>
          {headShape === 'sphere' && (
            <mesh position={[0, 0.52, 0]} castShadow>
              <icosahedronGeometry args={[0.16, 0]} />
              <meshStandardMaterial color={palette.skin} flatShading />
            </mesh>
          )}
          {headShape === 'box' && (
            <mesh position={[0, 0.52, 0]} castShadow>
              <boxGeometry args={[0.28, 0.24, 0.24]} />
              <meshStandardMaterial color={palette.skin} flatShading />
            </mesh>
          )}
          {headShape === 'cone' && (
            <mesh position={[0, 0.5, 0]} castShadow>
              <coneGeometry args={[0.16, 0.3, 5]} />
              <meshStandardMaterial color={palette.skin} flatShading />
            </mesh>
          )}
        </group>

        {bodyShape === 'box' && (
          <mesh position={[0, 0.18, 0]} castShadow>
            <boxGeometry args={[0.38, 0.42, 0.22]} />
            <meshStandardMaterial color={palette.body} flatShading />
          </mesh>
        )}
        {bodyShape === 'cylinder' && (
          <mesh position={[0, 0.18, 0]} castShadow>
            <cylinderGeometry args={[0.16, 0.2, 0.44, 6]} />
            <meshStandardMaterial color={palette.body} flatShading />
          </mesh>
        )}
        {bodyShape === 'cone' && (
          <mesh position={[0, 0.18, 0]} castShadow>
            <coneGeometry args={[0.22, 0.46, 5]} />
            <meshStandardMaterial color={palette.body} flatShading />
          </mesh>
        )}


        <group ref={leftArmRef} position={[-0.23, 0.16, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.08, 0.3, 0.08]} />
            <meshStandardMaterial color={palette.body} flatShading />
          </mesh>
        </group>
        <group ref={rightArmRef} position={[0.23, 0.16, 0]} rotation={[0, 0, -0.18]}>
          <mesh castShadow>
            <boxGeometry args={[0.08, 0.3, 0.08]} />
            <meshStandardMaterial color={palette.body} flatShading />
          </mesh>
        </group>

        {[-config.legSpread / 2, config.legSpread / 2].map((x, index) => (
          <group key={x} ref={(node) => {
              legRefs.current[index] = node;
            }} position={[x, -0.18, 0.02]}>
            {legShape === 'box' ? (
              <mesh castShadow>
                <boxGeometry args={[0.12, 0.32, 0.12]} />
                <meshStandardMaterial color={palette.legs} flatShading />
              </mesh>
            ) : (
              <mesh castShadow>
                <cylinderGeometry args={[0.06, 0.07, 0.32, 6]} />
                <meshStandardMaterial color={palette.legs} flatShading />
              </mesh>
            )}
            <mesh position={[0, -0.18, index === 0 ? 0.03 : 0]} castShadow>
              <boxGeometry args={[0.16, 0.08, 0.2]} />
              <meshStandardMaterial color={hovered ? '#ffffff' : palette.feet} flatShading />
            </mesh>
          </group>
        ))}

        {accessoryNodes}
      </group>
    </group>
  );
}
