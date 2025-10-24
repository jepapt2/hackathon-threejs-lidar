import { Suspense } from 'react';
import { OrbitControls } from '@react-three/drei';
import { Model } from './components/Model';
import { RulerTool } from './tools/RulerTool';
// Vite: ?url でビルド後のパス文字列として取得


export const Scene = ({ modelUrl }: { modelUrl?: string }) => {
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
                {modelUrl && <Model url={modelUrl} />}
            </Suspense>
        </>
    );
};
