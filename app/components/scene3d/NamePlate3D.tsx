import { useEffect, useMemo } from 'react';
import { CanvasTexture, SRGBColorSpace } from 'three';

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
  const nameTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 160;
    const context = canvas.getContext('2d');

    if (!context) return null;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#2f3033';
    context.font = "700 82px Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(name, canvas.width / 2, canvas.height / 2 + 2);

    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }, [name]);

  useEffect(() => {
    return () => {
      nameTexture?.dispose();
    };
  }, [nameTexture]);

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
      {nameTexture && (
        <mesh position={[0, 0.0395, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.56, 0.18]} />
          <meshBasicMaterial map={nameTexture} transparent opacity={opacity} toneMapped={false} />
        </mesh>
      )}
    </group>
  );
}
