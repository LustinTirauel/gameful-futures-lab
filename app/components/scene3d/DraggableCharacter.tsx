import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Group } from 'three';
import { Plane, Vector3 } from 'three';
import type { CharacterConfig } from '../../lib/characterOptions';
import PrimitiveCharacter from '../PrimitiveCharacter';
import type { ModelOverride, MovementBehavior } from './types';

export default function DraggableCharacter({
  id,
  name,
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
  peopleScrollAnimated,
  onWorldPositionChange,
  onArrivalChange,
  onActivate,
}: {
  id: string;
  name: string;
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
  peopleScrollAnimated: boolean;
  onWorldPositionChange?: (characterId: string, position: { x: number; y: number; z: number }) => void;
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
  const visibleScale = (isPeopleMode ? peopleFinalScale : override.scale) * globalCharacterScale;
  const lastReportedWorldPosition = useRef<{ x: number; y: number; z: number } | null>(null);

  useEffect(() => {
    targetPosition.current = { x: override.x, z: override.z };
  }, [override.x, override.z]);

  useEffect(() => {
    // Only restart the enter-people transition when mode changes, not on every scroll-driven lineup target update.
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
  }, [id, isPeopleMode, override.x, override.z, totalTransitionSeconds]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    if (isPeopleMode && !peopleScrollAnimated && !editMode) {
      groupRef.current.position.x += (lineupTarget.x - groupRef.current.position.x) * 0.24;
      groupRef.current.position.z += (lineupTarget.z - groupRef.current.position.z) * 0.24;
      groupRef.current.position.y = peopleFinalY;

      if (isRunningInPeople) {
        setIsRunningInPeople(false);
      }

      if (isPeopleMode && onWorldPositionChange) {
        const currentPosition = {
          x: groupRef.current.position.x,
          y: groupRef.current.position.y,
          z: groupRef.current.position.z,
        };
        const previousPosition = lastReportedWorldPosition.current;
        const changedEnough =
          !previousPosition ||
          Math.abs(previousPosition.x - currentPosition.x) > 0.01 ||
          Math.abs(previousPosition.y - currentPosition.y) > 0.01 ||
          Math.abs(previousPosition.z - currentPosition.z) > 0.01;

        if (changedEnough) {
          lastReportedWorldPosition.current = currentPosition;
          onWorldPositionChange(id, currentPosition);
        }
      }
      return;
    }

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

      const idleRotY = isPeopleMode ? peopleFinalRotY : override.rotY;
      const idleRotX = isPeopleMode ? peopleFinalRotX : override.rotX;
      const idleRotZ = isPeopleMode ? peopleFinalRotZ : override.rotZ;
      groupRef.current.rotation.y += (idleRotY - groupRef.current.rotation.y) * 0.12;
      groupRef.current.rotation.x += (idleRotX - groupRef.current.rotation.x) * 0.12;
      groupRef.current.rotation.z += (idleRotZ - groupRef.current.rotation.z) * 0.12;
    }

    if (isPeopleMode && onWorldPositionChange) {
      const currentPosition = {
        x: groupRef.current.position.x,
        y: groupRef.current.position.y,
        z: groupRef.current.position.z,
      };
      const previousPosition = lastReportedWorldPosition.current;
      const changedEnough =
        !previousPosition ||
        Math.abs(previousPosition.x - currentPosition.x) > 0.01 ||
        Math.abs(previousPosition.y - currentPosition.y) > 0.01 ||
        Math.abs(previousPosition.z - currentPosition.z) > 0.01;

      if (changedEnough) {
        lastReportedWorldPosition.current = currentPosition;
        onWorldPositionChange(id, currentPosition);
      }
    }
  });

  const isSceneTransitionActive = peopleTransitionProgress > 0.001 && peopleTransitionProgress < 0.999;
  const shouldUseStandingPose = isPeopleMode || isSceneTransitionActive;
  const effectiveLocomotion = isSceneTransitionActive
    ? 'run'
    : isRunningInPeople
      ? 'run'
      : isPeopleMode
        ? 'idle'
        : movementBehavior;
  const locomotion = isPeopleMode && !peopleScrollAnimated ? 'idle' : effectiveLocomotion;

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
        locomotion={locomotion}
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
