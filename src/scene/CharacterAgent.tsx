import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Group, Vector3 } from 'three';

type CharacterAgentProps = {
  id: string;
  target: [number, number, number];
  color: string;
};

const ARRIVAL_DISTANCE = 0.08;

export function CharacterAgent({ id, target, color }: CharacterAgentProps): JSX.Element {
  const ref = useRef<Group>(null);
  const velocity = useRef(new Vector3());
  const targetVector = new Vector3();

  useFrame((_, delta) => {
    if (!ref.current) {
      return;
    }

    targetVector.set(target[0], target[1], target[2]);
    const toTarget = targetVector.clone().sub(ref.current.position);
    const distance = toTarget.length();

    if (distance < ARRIVAL_DISTANCE) {
      velocity.current.multiplyScalar(0.8);
      ref.current.position.addScaledVector(velocity.current, delta);
      return;
    }

    const desiredSpeed = Math.min(3.5, 1 + distance * 0.8);
    const desiredVelocity = toTarget.normalize().multiplyScalar(desiredSpeed);
    velocity.current.lerp(desiredVelocity, 0.08);

    ref.current.position.addScaledVector(velocity.current, delta);

    if (velocity.current.lengthSq() > 0.001) {
      ref.current.rotation.y = Math.atan2(velocity.current.x, velocity.current.z);
    }
  });

  const randomOffset = [...id].reduce((acc, char) => acc + char.charCodeAt(0), 0) % 10;

  return (
    <group ref={ref} position={[0.2 * randomOffset - 1, 0, randomOffset % 2 === 0 ? 1 : -1]}>
      <mesh position={[0, 0.45, 0]} castShadow>
        <capsuleGeometry args={[0.22, 0.8, 6, 12]} />
        <meshStandardMaterial color={color} roughness={0.55} />
      </mesh>
      <mesh position={[0, 1.12, 0]} castShadow>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#fff8eb" roughness={0.7} />
      </mesh>
    </group>
  );
}
