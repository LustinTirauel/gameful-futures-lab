import { Text } from '@react-three/drei';

export default function NamePlate3D({
  name,
  position,
  rotationY,
  opacity,
}: {
  name: string;
  position: [number, number, number];
  rotationY: number;
  opacity: number;
}) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh receiveShadow>
        <boxGeometry args={[0.74, 0.05, 0.58]} />
        <meshStandardMaterial color="#d8dbe0" transparent opacity={opacity} />
      </mesh>
      <mesh position={[0, 0.03, 0]}>
        <boxGeometry args={[0.64, 0.016, 0.46]} />
        <meshStandardMaterial color="#f1f2f4" transparent opacity={opacity} />
      </mesh>
      <Text
        position={[0, 0.039, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.1}
        color="#2f3033"
        fillOpacity={opacity}
        anchorX="center"
        anchorY="middle"
      >
        {name}
      </Text>
    </group>
  );
}
