import { Suspense } from 'react';
import { OrbitControls } from '@react-three/drei';
import { Model } from './components/Model';
import { RulerTool } from './tools/RulerTool';
// Vite: ?url でビルド後のパス文字列として取得


export const Scene = ({ modelUrl, modelPosition, modelRotation }: { modelUrl?: string; modelPosition: { x: number; y: number; z: number }; modelRotation?: { x: number; y: number; z: number } }) => {
    // convert degrees to radians for three.js
    const degToRad = (d: number) => (d * Math.PI) / 180;
    const rot = modelRotation ? [degToRad(modelRotation.x), degToRad(modelRotation.y), degToRad(modelRotation.z)] as [number, number, number] : undefined;
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
                {modelUrl && (
                    <group position={[modelPosition.x, modelPosition.y, modelPosition.z]} rotation={rot}>
                        <Model url={modelUrl} />
                    </group>
                )}
            </Suspense>
        </>
    );
};
