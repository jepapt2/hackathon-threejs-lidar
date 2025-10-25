import { useLoader, useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { useMemo, useRef, useEffect } from 'react';
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
    // clone scene and optionally shift all child positions by -bboxCenter so geometry is centered
    const { scene, boxCenter, boxSize } = useMemo(() => {
        const s = gltf.scene.clone(true) as THREE.Object3D;
        s.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(s);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        // apply offset to each object's local position so the visible geometry centers at origin
        if (autoCenter) {
            s.traverse((obj) => {
                // only adjust objects with position property
                if (obj.position) {
                    obj.position.sub(center);
                }
            });
        }
        return { scene: s, boxCenter: autoCenter ? new THREE.Vector3(0, 0, 0) : center, boxSize: size };
    }, [gltf, autoCenter]);
    const primRef = useRef<THREE.Object3D | null>(null);
    // also prepare individual child objects for manual expansion
    const childObjects = useMemo(() => scene.children.map(c => c), [scene]);
    const last = useRef<number>(0);
    const groupRef = useRef<THREE.Group | null>(null);

    // initial mount log
    if (debug) {
        console.log('[Model] mounted for', url);
    }

    useFrame(() => {
        if (!debug) return;
        if (!primRef.current) return;
        const now = performance.now();
        if (now - last.current < 200) return;
        last.current = now;
        const wp = new THREE.Vector3();
        primRef.current.getWorldPosition(wp);
        console.log('[Model] worldPos', wp.x.toFixed(3), wp.y.toFixed(3), wp.z.toFixed(3));
    });

    useEffect(() => {
        if (!debug) return;
        // after mount, log structure details
        setTimeout(() => {
            try {
                console.log('[Model] groupRef', !!groupRef.current, groupRef.current?.uuid);
                console.log('[Model] primRef parent', primRef.current?.parent?.uuid, 'parent type', primRef.current?.parent?.type);
                const children = primRef.current?.children || [];
                console.log('[Model] prim children count', children.length);
                children.forEach((c, i) => {
                    const lp = c.position;
                    console.log(`[Model] child[${i}] name=${c.name || '<noname>'} type=${c.type} pos=${lp.x.toFixed(3)},${lp.y.toFixed(3)},${lp.z.toFixed(3)}`);
                });
            } catch (e) {
                console.log('[Model] inspect error', e);
            }
        }, 50);
    }, [debug]);

    // lift the model so its bottom sits on the grid (y=0) when autoCenter is enabled
    const liftY = boxSize ? (autoCenter ? boxSize.y / 2 : 0) : 0;
    return (
        <group ref={groupRef} position={position}>
            {/* inner offset group: subtract bbox center so visible geometry is centered at parent origin */}
            <group position={autoCenter ? [-boxCenter.x, -boxCenter.y + liftY, -boxCenter.z] : [0, liftY, 0]}>
                {childObjects.map((child, i) => (
                    <primitive key={child.uuid} object={child} ref={i === 0 ? (primRef as unknown as React.MutableRefObject<THREE.Object3D | null>) : undefined} />
                ))}
            </group>
        </group>
    );
};
