import React, { useCallback, useState } from 'react';
import * as THREE from 'three';
import { RulerContext } from './RulerContext';

export const RulerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [active, setActive] = useState(false);
    const [points, setPoints] = useState<THREE.Vector3[]>([]);
    const [distance, setDistance] = useState<number | null>(null);

    const toggle = useCallback(() => {
        setActive(a => !a);
        setPoints([]);
        setDistance(null);
    }, []);

    const addPoint = useCallback((p: THREE.Vector3) => {
        setPoints(prev => {
            if (prev.length >= 2) {
                setDistance(null);
                return [p.clone()];
            }
            const next = [...prev, p.clone()];
            if (next.length === 2) setDistance(next[0].distanceTo(next[1]));
            return next;
        });
    }, []);

    const reset = useCallback(() => {
        setPoints([]);
        setDistance(null);
    }, []);

    return (
        <RulerContext.Provider value={{ active, points, distance, toggle, addPoint, reset }}>
            {children}
        </RulerContext.Provider>
    );
};

export default RulerProvider;