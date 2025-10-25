import { Canvas } from '@react-three/fiber';
import { Scene } from './Scene';
import ControlPanel from './components/ControlPanel';
import { useState } from 'react';
import { RulerProvider } from './tools/RulerProvider';

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

        <ControlPanel
          models={models}
          selectedModelId={selectedModelId}
          setSelectedModelId={setSelectedModelId}
          updateSelectedPosition={updateSelectedPosition}
          updateSelectedRotation={updateSelectedRotation}
          removeModel={removeModel}
          addModel={addModel}
        />
      </div>
    </RulerProvider>
  );
}

