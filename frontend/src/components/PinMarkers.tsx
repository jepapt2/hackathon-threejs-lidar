import React from 'react';
import { Html } from '@react-three/drei';
import usePins from '../tools/usePins';

// シーン内にピンを表示。Sphere + Html ラベル。
export const PinMarkers: React.FC = () => {
  const { pins, removePin, updateComment } = usePins();
  return (
    <group>
      {pins.map(pin => (
        <group position={[pin.position.x, pin.position.y, pin.position.z]} key={pin.id}>
          <mesh userData={{ isPinMarker: true }}>
            <sphereGeometry args={[0.035, 16, 16]} />
            <meshStandardMaterial color="#ff3366" emissive="#550022" emissiveIntensity={0.8} />
          </mesh>
          <Html
            position={[0, 0.08, 0]}
            style={{
              background: 'rgba(0,0,0,0.7)',
              padding: '4px 6px',
              borderRadius: 4,
              fontSize: 11,
              color: '#fff',
              maxWidth: 240,
              width: "160px"
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ wordBreak: 'break-word' }}>{pin.comment || '(コメントなし)'}</div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  style={{ fontSize: 10 }}
                  onClick={() => {
                    const next = window.prompt('コメントを編集', pin.comment) || pin.comment;
                    updateComment(pin.id, next);
                  }}
                >編集</button>
                <button
                  style={{ fontSize: 10, color: '#f88' }}
                  onClick={() => removePin(pin.id)}
                >削除</button>
              </div>
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
};

export default PinMarkers;