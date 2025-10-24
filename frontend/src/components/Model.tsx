import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { useMemo } from 'react';

interface ModelProps {
    url: string;
}

export const Model = ({ url }: ModelProps) => {
    const gltf = useLoader(GLTFLoader, url);
    const scene = useMemo(() => gltf.scene.clone(true), [gltf]);
    return <primitive object={scene} />;
};
