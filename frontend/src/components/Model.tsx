import { useLoader, useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { useMemo, useRef, } from 'react';
import * as THREE from 'three';

interface ModelProps {
    url: string;
    /** optional position applied to a wrapper group to ensure transforms propagate */
    position?: [number, number, number];
    /** debug: log world position to console */
    debug?: boolean;
    /** auto center geometry to origin by subtracting bbox center */
    autoCenter?: boolean;
}

export const Model = ({ url, position = [0, 0, 0], debug = true, autoCenter = true }: ModelProps) => {
    const gltf = useLoader(GLTFLoader, url);
    // clone scene and compute bbox info; do not mutate scene here — we'll offset via an inner group
    const { scene, boxCenter } = useMemo(() => {
        const s = gltf.scene.clone(true) as THREE.Object3D;
        s.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(s);
        const center = box.getCenter(new THREE.Vector3());
        const minY = box.min.y;
        // boxCenter will be used to compute an inner-group position that recenters X/Z to the geometry center
        // but places Y at the geometry bottom (minY) so the model's bottom rests at the parent origin
        const bottomCenter = new THREE.Vector3(center.x, minY, center.z);
        return { scene: s, boxCenter: autoCenter ? bottomCenter : center };
    }, [gltf, autoCenter]);
    const primRef = useRef<THREE.Object3D | null>(null);
    // also prepare individual child objects for manual expansion
    const childObjects = useMemo(() => scene.children.map(c => c), [scene]);
    const last = useRef<number>(0);
    const groupRef = useRef<THREE.Group | null>(null);


    useFrame(() => {
        if (!debug) return;
        if (!primRef.current) return;
        const now = performance.now();
        if (now - last.current < 200) return;
        last.current = now;
        const wp = new THREE.Vector3();
        primRef.current.getWorldPosition(wp);

    });



    // previous implementation used liftY; when autoCenter is enabled we now position the inner group
    // so that the geometry bottom aligns with the parent origin (y=0) by offsetting by boxCenter.y (which is bbox.min.y)
    const liftY = 0;
    return (
        <group ref={groupRef} position={position} onClick={(event) => console.log(`レイヤーx${event.layerX}, レイヤーy${event.layerY}`)}>
            {/* inner offset group: subtract bbox center so visible geometry is centered at parent origin */}
            <group position={autoCenter ? [-boxCenter.x, -boxCenter.y, -boxCenter.z] : [0, liftY, 0]}>
                {childObjects.map((child, i) => (
                    <primitive key={child.uuid} object={child} ref={i === 0 ? (primRef as unknown as React.MutableRefObject<THREE.Object3D | null>) : undefined} />
                ))}
            </group>
        </group>
    );
};
