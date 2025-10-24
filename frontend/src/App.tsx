import { Canvas } from '@react-three/fiber';
import { Scene } from './Scene';

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#111' }}>
      <Canvas
        shadows
        camera={{ fov: 55, position: [0, 2, 4] }}
        gl={{ antialias: true }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}

