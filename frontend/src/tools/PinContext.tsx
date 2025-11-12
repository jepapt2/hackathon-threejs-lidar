import { createContext } from 'react';
import * as THREE from 'three';

export interface PinData {
  id: string;
  position: THREE.Vector3;
  comment: string;
  modelId?: string; // which model was clicked (optional)
}

export interface PinContextValue {
  pins: PinData[];
  active: boolean; // placing mode
  toggleActive: () => void;
  addPin: (p: THREE.Vector3, modelId?: string, comment?: string) => void;
  updateComment: (id: string, comment: string) => void;
  removePin: (id: string) => void;
  clearPins: () => void;
  setAllPins: (pins: PinData[]) => void;
}

export const PinContext = createContext<PinContextValue | undefined>(undefined);