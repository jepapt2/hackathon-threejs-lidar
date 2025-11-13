import React, { useCallback, useEffect, useState } from 'react';
import * as THREE from 'three';
import { PinContext } from './PinContext';
import type { PinData } from './PinContext';

export interface PinProviderProps { children: React.ReactNode; initialPins?: PinData[] }

export const PinProvider: React.FC<PinProviderProps> = ({ children, initialPins }) => {
  const [pins, setPins] = useState<PinData[]>(initialPins || []);
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

  // 初期ピンが後から渡されるケース(非同期ロード)にも対応
  useEffect(() => {
    if (initialPins && initialPins.length && pins.length === 0) {
      setPins(initialPins);
    }
  }, [initialPins, pins.length]);
  return (
    <PinContext.Provider value={{ pins, active, toggleActive, addPin, updateComment, removePin, clearPins, setAllPins }}>
      {children}
    </PinContext.Provider>
  );
};

export default PinProvider;