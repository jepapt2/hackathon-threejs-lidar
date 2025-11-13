import { useLoader, useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

interface ModelProps {
    url: string;
    position?: [number, number, number];
    debug?: boolean;
    autoCenter?: boolean;
    selected?: boolean; // highlight flag
}

export const Model = ({ url, position = [0, 0, 0], debug = true, autoCenter = true, selected = false }: ModelProps) => {
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
      return { scene: s, boxCenter: autoCenter ? bottomCenter : center, bbox: box };
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
            <group position={autoCenter ? [-boxCenter.x, -boxCenter.y, -boxCenter.z] : [0, liftY, 0]}>
                {selected && (
                    <></>
                    // <lineSegments>
                    //     <bufferGeometry>
                    //         <bufferAttribute
                    //             attach="attributes-position"
                    //             itemSize={3}
                    //             count={24}
                    //             array={new Float32Array((() => {
                    //                 const min = bbox.min; const max = bbox.max;
                    //                 const x1=min.x, y1=min.y, z1=min.z; const x2=max.x, y2=max.y, z2=max.z;
                    //                 return [
                    //                     x1,y1,z1, x2,y1,z1,
                    //                     x2,y1,z1, x2,y1,z2,
                    //                     x2,y1,z2, x1,y1,z2,
                    //                     x1,y1,z2, x1,y1,z1,
                    //                     x1,y2,z1, x2,y2,z1,
                    //                     x2,y2,z1, x2,y2,z2,
                    //                     x2,y2,z2, x1,y2,z2,
                    //                     x1,y2,z2, x1,y2,z1,
                    //                     x1,y1,z1, x1,y2,z1,
                    //                     x2,y1,z1, x2,y2,z1,
                    //                     x2,y1,z2, x2,y2,z2,
                    //                     x1,y1,z2, x1,y2,z2,
                    //                 ];
                    //             })())}
                    //         />
                    //     </bufferGeometry>
                    //     {/* <lineBasicMaterial color="none" depthTest={false} /> */}
                    // </lineSegments>
                )}
                {childObjects.map((child, i) => (
                    <primitive key={child.uuid} object={child} ref={i === 0 ? (primRef as unknown as React.MutableRefObject<THREE.Object3D | null>) : undefined} />
                ))}
            </group>
        </group>
    );
};
