import { Suspense } from 'react';
import { OrbitControls } from '@react-three/drei';
import { Model } from './components/Model';
import { RulerTool } from './tools/RulerTool';
// Vite: ?url でビルド後のパス文字列として取得
export const Scene = ({ models }: { models: Array<{ id: string; url: string; position: { x: number; y: number; z: number }; rotation: { x: number; y: number; z: number } }> }) => {
    // convert degrees to radians for three.js
    const degToRad = (d: number) => (d * Math.PI) / 180;
    return (
        <>
            {/* Lighting */}
            <ambientLight intensity={0.4} />
            <directionalLight position={[5, 10, 5]} intensity={0.9} castShadow />

            {/* Controls */}
            <OrbitControls makeDefault enableDamping dampingFactor={0.12} />

            {/* Helpers (開発中のみ) */}
            <gridHelper args={[10, 10]} />
            <axesHelper args={[1]} />

            {/* Measurement Tool */}
            <RulerTool />

            {/* 3D Models / Future components */}
            <Suspense fallback={null}>
                {models.map(m => {
                    const rot = [degToRad(m.rotation.x), degToRad(m.rotation.y), degToRad(m.rotation.z)] as [number, number, number];
                    return (
                        <group key={m.id} position={[m.position.x, m.position.y, m.position.z]} rotation={rot}>
                            <Model url={m.url} />
                        </group>
                    );
                })}
            </Suspense>
        </>
    );
};
