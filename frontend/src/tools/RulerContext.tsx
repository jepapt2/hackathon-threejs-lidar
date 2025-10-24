import { createContext } from 'react';
import * as THREE from 'three';

export type RulerContextValue = {
    active: boolean;
    points: THREE.Vector3[];
    distance: number | null;
    toggle: () => void;
    addPoint: (p: THREE.Vector3) => void;
    reset: () => void;
};

export const RulerContext = createContext<RulerContextValue | undefined>(undefined);
