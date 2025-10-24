import React, { useRef, useCallback, useEffect } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useRuler } from './useRuler';

export const RulerTool: React.FC = () => {
    const { active, points, distance, addPoint } = useRuler();
    const raycaster = useRef(new THREE.Raycaster());
    const pointer = useRef(new THREE.Vector2());
    const tmp = useRef(new THREE.Vector3());
    const { gl, camera, scene } = useThree();

    const handleDomPointerDown = useCallback((ev: PointerEvent) => {
        if (!active) return;
        if (ev.button !== 0) return;
        const rect = gl.domElement.getBoundingClientRect();
        pointer.current.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.current.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.current.setFromCamera(pointer.current, camera);
        const intersects = raycaster.current.intersectObjects(
            scene.children.filter(obj => {
                if (obj instanceof THREE.GridHelper) return false;
                if (obj instanceof THREE.AxesHelper) return false;
                if (obj instanceof THREE.Line) return false;
                if (obj instanceof THREE.Mesh) {
                    const mat = obj.material;
                    interface MaybeTransparent { transparent?: boolean; opacity?: number; }
                    const isInvisible = (material: THREE.Material): boolean => {
                        const mt = material as THREE.Material & MaybeTransparent;
                        return !!mt.transparent && typeof mt.opacity === 'number' && mt.opacity === 0;
                    };
                    if (Array.isArray(mat)) {
                        if (mat.every(m => isInvisible(m))) return false;
                    } else if (mat && isInvisible(mat)) {
                        return false;
                    }
                }
                return true;
            }),
            true
        );
        if (intersects.length === 0) return;
        tmp.current.copy(intersects[0].point);
        addPoint(tmp.current);
    }, [active, camera, gl, scene, addPoint]);

    useEffect(() => {
        const el = gl.domElement;
        el.addEventListener('pointerdown', handleDomPointerDown);
        return () => {
            el.removeEventListener('pointerdown', handleDomPointerDown);
        };
    }, [handleDomPointerDown, gl]);

    return (
        <group>
            {/* ライン */}
            {active && points.length === 2 && (
                <line>
                    <bufferGeometry>
                        <bufferAttribute
                            attach="attributes-position"
                            count={2}
                            array={new Float32Array([
                                points[0].x, points[0].y, points[0].z,
                                points[1].x, points[1].y, points[1].z,
                            ])}
                            itemSize={3}
                        />
                    </bufferGeometry>
                    <lineBasicMaterial color="yellow" />
                </line>
            )}
            {active && points.map((p, i) => (
                <mesh key={i} position={p}>
                    <sphereGeometry args={[0.035, 16, 16]} />
                    <meshStandardMaterial color={i === 0 ? 'cyan' : 'magenta'} />
                </mesh>
            ))}
            {active && distance !== null && points.length === 2 && (
                <Html
                    position={[points[0].x, points[0].y + 0.12, points[0].z]}
                    style={{
                        background: 'rgba(0,0,0,0.6)',
                        padding: '4px 6px',
                        borderRadius: 4,
                        fontSize: 12,
                        color: '#fff',
                        whiteSpace: 'nowrap'
                    }}
                >
                    {distance.toFixed(3)} m
                </Html>
            )}
        </group>
    );
};

export default RulerTool;