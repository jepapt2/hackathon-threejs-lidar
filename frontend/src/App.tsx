import { Canvas } from '@react-three/fiber';
import { Scene } from './Scene';
import ItemsDebug from './components/ItemsDebug';
import { useState } from 'react';
import { RulerProvider } from './tools/RulerProvider';
import RulerMenu from './components/RulerMenu';

export default function App() {
  // multiple models state
  const [models, setModels] = useState<Array<{ id: string; name?: string; url: string; position: { x: number; y: number; z: number }; rotation: { x: number; y: number; z: number } }>>([]);
  const [selectedModelId, setSelectedModelId] = useState<string | undefined>(undefined);

  // helpers to operate on the selected model
  const addModel = (url: string, name?: string) => {
    const id = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const newModel = { id, url, name: name || id, position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 } };
    setModels(m => [...m, newModel]);
    setSelectedModelId(id);
  };

  // (kept per-axis update functions instead of a generic patch helper)

  const updateSelectedPosition = (posPatch: Partial<{ x: number; y: number; z: number }>) => {
    if (!selectedModelId) return;
    setModels(ms => ms.map(m => m.id === selectedModelId ? { ...m, position: { ...m.position, ...posPatch } } : m));
  };

  const updateSelectedRotation = (rotPatch: Partial<{ x: number; y: number; z: number }>) => {
    if (!selectedModelId) return;
    setModels(ms => ms.map(m => m.id === selectedModelId ? { ...m, rotation: { ...m.rotation, ...rotPatch } } : m));
  };

  const removeModel = (id: string) => {
    setModels(ms => ms.filter(m => m.id !== id));
    setSelectedModelId(sid => (sid === id ? undefined : sid));
  };
  return (
    <RulerProvider>
      <div style={{ width: '100vw', height: '100vh', background: '#111', position: 'relative' }}>
        <Canvas shadows camera={{ fov: 55, position: [0, 2, 4] }} gl={{ antialias: true }}>
          <Scene models={models} />
        </Canvas>
        {/* 簡易位置コントロール */}
        {/* Left panel: loaded models + editor for selected model */}
        <div style={{ position: 'absolute', top: 160, left: 0, background: '#202225', color: '#eee', padding: '8px 10px', fontSize: 12, width: 240, borderTop: '1px solid #333', borderRight: '1px solid #333' }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Loaded Models</div>
          <div style={{ maxHeight: 260, overflowY: 'auto', marginBottom: 8 }}>
            {models.length === 0 && <div style={{ color: '#888' }}>No models loaded</div>}
            {models.map(m => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', borderBottom: '1px solid #2b2b2b' }}>
                <button style={{ flex: 1, textAlign: 'left', background: selectedModelId === m.id ? '#2a6' : 'transparent', color: '#eee', border: 'none', padding: '4px' }} onClick={() => setSelectedModelId(m.id)}>{m.name || m.id}</button>
                <button title='Delete' onClick={() => removeModel(m.id)} style={{ background: 'transparent', color: '#f66', border: 'none' }}>✕</button>
              </div>
            ))}
          </div>

          <div style={{ fontWeight: 700, marginBottom: 6 }}>Selected Model</div>
          {!selectedModelId && <div style={{ color: '#888', marginBottom: 8 }}>— none —</div>}
          {selectedModelId && (() => {
            const sel = models.find(m => m.id === selectedModelId)!;
            return (
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{sel.name}</div>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Position</div>
                {(['x', 'y', 'z'] as const).map(axis => (
                  <div key={`pos-${axis}`} style={{ display: 'flex', alignItems: 'center', marginBottom: 4, gap: 6 }}>
                    <label style={{ width: 14 }}>{axis.toUpperCase()}</label>
                    <input type='number' step={0.1} value={sel.position[axis]} style={{ flex: 1, background: '#111', color: '#eee', border: '1px solid #444', padding: '2px 6px' }} onChange={e => updateSelectedPosition({ [axis]: parseFloat(e.target.value) || 0 })} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <button style={{ fontSize: 11 }} onClick={() => updateSelectedPosition({ [axis]: +((sel.position[axis] + 0.5).toFixed(3)) })}>+0.5</button>
                      <button style={{ fontSize: 11 }} onClick={() => updateSelectedPosition({ [axis]: +((sel.position[axis] - 0.5).toFixed(3)) })}>-0.5</button>
                    </div>
                  </div>
                ))}

                <div style={{ fontWeight: 600, marginTop: 8, marginBottom: 6 }}>Rotation (deg)</div>
                {(['x', 'y', 'z'] as const).map(axis => (
                  <div key={`rot-${axis}`} style={{ display: 'flex', alignItems: 'center', marginBottom: 4, gap: 6 }}>
                    <label style={{ width: 14 }}>{axis.toUpperCase()}</label>
                    <input type='number' step={1} value={sel.rotation[axis]} style={{ flex: 1, background: '#111', color: '#eee', border: '1px solid #444', padding: '2px 6px' }} onChange={e => updateSelectedRotation({ [axis]: parseFloat(e.target.value) || 0 })} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <button style={{ fontSize: 11 }} onClick={() => updateSelectedRotation({ [axis]: +((sel.rotation[axis] + 5).toFixed(3)) })}>+5°</button>
                      <button style={{ fontSize: 11 }} onClick={() => updateSelectedRotation({ [axis]: +((sel.rotation[axis] - 5).toFixed(3)) })}>-5°</button>
                    </div>
                  </div>
                ))}

                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  <button style={{ flex: 1 }} onClick={() => { updateSelectedPosition({ x: 0, y: 0, z: 0 }); updateSelectedRotation({ x: 0, y: 0, z: 0 }); }}>Reset</button>
                </div>
              </div>
            );
          })()}
        </div>
        {/* 左側: Ruler Menu */}
        <RulerMenu />
        {/* 右側: Items Debug */}
        <ItemsDebug onSelect={(item) => { const it = item as { url?: string; name?: string }; if (it.url) addModel(it.url, it.name); }} />
      </div>
    </RulerProvider>
  );
}

