import { Canvas } from '@react-three/fiber';
import { Scene } from './Scene';
import ItemsDebug from './components/ItemsDebug';
import { useState } from 'react';
import { RulerProvider } from './tools/RulerProvider';
import RulerMenu from './components/RulerMenu';

export default function App() {
  const [modelUrl, setModelUrl] = useState<string>();
  const [modelPos, setModelPos] = useState({ x: 0, y: 0, z: 0 });
  // rotation stored in degrees for easier UI editing (converted to radians in Scene)
  const [modelRot, setModelRot] = useState({ x: 0, y: 0, z: 0 });
  return (
    <RulerProvider>
      <div style={{ width: '100vw', height: '100vh', background: '#111', position: 'relative' }}>
        <Canvas shadows camera={{ fov: 55, position: [0, 2, 4] }} gl={{ antialias: true }}>
          <Scene modelUrl={modelUrl} modelPosition={modelPos} modelRotation={modelRot} />
        </Canvas>
        {/* 簡易位置コントロール */}
        <div style={{ position: 'absolute', top: 260, left: 0, background: '#202225', color: '#eee', padding: '8px 10px', fontSize: 12, width: 200, borderTop: '1px solid #333', borderRight: '1px solid #333' }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Model Position</div>
          {(['x', 'y', 'z'] as const).map(axis => (
            <div key={axis} style={{ display: 'flex', alignItems: 'center', marginBottom: 4, gap: 4 }}>
              <label style={{ width: 12 }}>{axis.toUpperCase()}</label>
              <input
                type='number'
                step={0.1}
                value={modelPos[axis]}
                style={{ flex: 1, background: '#111', color: '#eee', border: '1px solid #444', padding: '2px 4px' }}
                onChange={e => setModelPos(p => ({ ...p, [axis]: parseFloat(e.target.value) || 0 }))}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <button style={{ fontSize: 10 }} onClick={() => setModelPos(p => ({ ...p, [axis]: +(p[axis] + 0.5).toFixed(3) }))}>+0.5</button>
                <button style={{ fontSize: 10 }} onClick={() => setModelPos(p => ({ ...p, [axis]: +(p[axis] - 0.5).toFixed(3) }))}>-0.5</button>
              </div>
            </div>
          ))}
          <button style={{ width: '100%', marginTop: 4 }} onClick={() => setModelPos({ x: 0, y: 0, z: 0 })}>Reset Position</button>

          {/* Rotation controls (degrees) */}
          <div style={{ fontWeight: 600, marginTop: 10, marginBottom: 6 }}>Model Rotation (deg)</div>
          {(['x', 'y', 'z'] as const).map(axis => (
            <div key={`rot-${axis}`} style={{ display: 'flex', alignItems: 'center', marginBottom: 4, gap: 4 }}>
              <label style={{ width: 12 }}>{axis.toUpperCase()}</label>
              <input
                type='number'
                step={1}
                value={modelRot[axis]}
                style={{ flex: 1, background: '#111', color: '#eee', border: '1px solid #444', padding: '2px 4px' }}
                onChange={e => setModelRot(r => ({ ...r, [axis]: parseFloat(e.target.value) || 0 }))}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <button style={{ fontSize: 10 }} onClick={() => setModelRot(r => ({ ...r, [axis]: +(r[axis] + 5).toFixed(3) }))}>+5°</button>
                <button style={{ fontSize: 10 }} onClick={() => setModelRot(r => ({ ...r, [axis]: +(r[axis] - 5).toFixed(3) }))}>-5°</button>
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 6 }}>
            <button style={{ flex: 1 }} onClick={() => setModelRot({ x: 0, y: 0, z: 0 })}>Reset Rotation</button>
            <button style={{ flex: 1 }} onClick={() => { setModelPos({ x: 0, y: 0, z: 0 }); setModelRot({ x: 0, y: 0, z: 0 }); }}>Reset All</button>
          </div>
        </div>
        {/* 左側: Ruler Menu */}
        <RulerMenu />
        {/* 右側: Items Debug */}
        <ItemsDebug onSelect={(item) => { if (item.url) setModelUrl(item.url); }} />
      </div>
    </RulerProvider>
  );
}

