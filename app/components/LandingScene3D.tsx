'use client';

import { Canvas } from '@react-three/fiber';
import { useEffect, useState } from 'react';

type LandingScene3DProps = {
  onRuntimeError?: () => void;
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

  if (!isWebGLAvailable) {
    return null;
  }

  return (
    <div className="scene-layer" aria-hidden="true">
      <Canvas camera={{ position: [0, 0.8, 3], fov: 50 }}>
        <ambientLight intensity={0.45} />
        <directionalLight position={[2, 4, 2]} intensity={1.1} color="#d4f7dc" />
      </Canvas>
    </div>
  );
}
