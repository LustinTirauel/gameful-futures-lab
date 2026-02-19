import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import type { Mesh, PointLight } from 'three';
import { Plane, Vector3 } from 'three';
import type { ModelOverride } from './types';

export default function DraggableFire({
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
