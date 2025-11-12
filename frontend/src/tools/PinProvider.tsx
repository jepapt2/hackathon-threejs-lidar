import React, { useCallback, useState } from 'react';
import * as THREE from 'three';
import { PinContext } from './PinContext';
import type { PinData } from './PinContext';

export const PinProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pins, setPins] = useState<PinData[]>([]);
  const [active, setActive] = useState(false);

  const toggleActive = useCallback(() => setActive(a => !a), []);

  const addPin = useCallback((pos: THREE.Vector3, modelId?: string, comment: string = '') => {
    const id = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    setPins(p => [...p, { id, position: pos.clone(), comment, modelId }]);
  }, []);

  const updateComment = useCallback((id: string, comment: string) => {
    setPins(p => p.map(pin => pin.id === id ? { ...pin, comment } : pin));
  }, []);

  const removePin = useCallback((id: string) => {
    setPins(p => p.filter(pin => pin.id !== id));
  }, []);

  const clearPins = useCallback(() => setPins([]), []);

  const setAllPins = useCallback((next: PinData[]) => setPins(next), []);
  return (
    <PinContext.Provider value={{ pins, active, toggleActive, addPin, updateComment, removePin, clearPins, setAllPins }}>
      {children}
    </PinContext.Provider>
  );
};

export default PinProvider;