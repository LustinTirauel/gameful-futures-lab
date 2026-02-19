import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';

export default function CameraController({ cameraX, cameraY, cameraZ, fov }: { cameraX: number; cameraY: number; cameraZ: number; fov: number }) {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(cameraX, cameraY, cameraZ);
    if ('fov' in camera) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
    camera.lookAt(0, 0, 0);
  }, [camera, cameraX, cameraY, cameraZ, fov]);

  return null;
}
