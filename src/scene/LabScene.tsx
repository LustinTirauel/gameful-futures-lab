import { Canvas } from '@react-three/fiber';
import { OrbitControls, RoundedBox, SoftShadows } from '@react-three/drei';
import { people } from '../data/people';
import { useLabWorldStore } from '../store/useLabWorldStore';
import { routeLayouts } from './layouts';
import { CharacterAgent } from './CharacterAgent';

export function LabScene(): JSX.Element {
  const route = useLabWorldStore((state) => state.route);
  const targets = routeLayouts[route];

  return (
    <Canvas shadows camera={{ position: [10, 9, 10], fov: 40 }} style={{ width: '100%', height: '70vh' }}>
      <color attach="background" args={['#f4f1ff']} />
      <ambientLight intensity={0.8} />
      <directionalLight castShadow position={[6, 10, 4]} intensity={1.1} shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <SoftShadows size={18} focus={0.5} samples={12} />

      <group rotation={[0, Math.PI / 4, 0]}>
        <RoundedBox args={[12, 0.5, 12]} radius={0.12} position={[0, -0.25, 0]} receiveShadow>
          <meshStandardMaterial color="#d8f3dc" roughness={0.95} />
        </RoundedBox>

        <RoundedBox args={[3, 2, 3]} radius={0.08} position={[-4.6, 1, -1.8]} castShadow receiveShadow>
          <meshStandardMaterial color="#ffd6a5" />
        </RoundedBox>

        <RoundedBox args={[3.2, 1.6, 3.2]} radius={0.08} position={[0, 0.8, -1.2]} castShadow receiveShadow>
          <meshStandardMaterial color="#bde0fe" />
        </RoundedBox>

        <RoundedBox args={[2.8, 2.6, 2.8]} radius={0.08} position={[4.6, 1.3, -1.8]} castShadow receiveShadow>
          <meshStandardMaterial color="#cdb4db" />
        </RoundedBox>
      </group>

      {people.map((person) => (
        <CharacterAgent key={person.id} id={person.id} color={person.color} target={targets[person.id]} />
      ))}

      <OrbitControls enablePan={false} minPolarAngle={0.6} maxPolarAngle={1.2} minDistance={8} maxDistance={16} />
    </Canvas>
  );
}
