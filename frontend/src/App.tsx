import { Canvas } from '@react-three/fiber';
import { Scene } from './Scene';
import ItemsDebug from './components/ItemsDebug';
import { useState } from 'react';
import { RulerProvider } from './tools/RulerProvider';
import RulerMenu from './components/RulerMenu';

export default function App() {
  const [modelUrl, setModelUrl] = useState<string>();
  return (
    <RulerProvider>
      <div style={{ width: '100vw', height: '100vh', background: '#111', position: 'relative' }}>
        <Canvas
          shadows
          camera={{ fov: 55, position: [0, 2, 4] }}
          gl={{ antialias: true }}
        >
          <Scene modelUrl={modelUrl} />
        </Canvas>
        {/* 左側: Ruler Menu */}
        <RulerMenu />
        {/* 右側: Items Debug */}
        <ItemsDebug onSelect={(item) => {
          if (item.url) setModelUrl(item.url);
        }} />
      </div>
    </RulerProvider>
  );
}

