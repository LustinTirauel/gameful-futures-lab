import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import type { Group, Mesh } from 'three';
import { Plane, Vector3 } from 'three';
import { defaultSceneTuning } from './defaults';
import type { ModelOverride } from './types';

export default function EnvironmentProps({
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
