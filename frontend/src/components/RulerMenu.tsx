import React from 'react';
import { useRuler } from '../tools/useRuler';

export const RulerMenu: React.FC<{ inline?: boolean }> = ({ inline = false }) => {
    const { active, distance, points, toggle, reset } = useRuler();
    const containerStyle: React.CSSProperties = inline
        ? { width: '100%', background: '#202224', color: '#eee', fontSize: 12, fontFamily: 'sans-serif', padding: '0.75rem', borderRadius: 6 }
        : { position: 'absolute', top: 0, left: 0, width: 220, background: '#202224', color: '#eee', fontSize: 12, fontFamily: 'sans-serif', padding: '0.75rem', borderRight: '1px solid #333' };
    return (
        <div style={containerStyle}>
            <h3 style={{ marginTop: 0 }}>Ruler</h3>
            <button onClick={toggle} style={{ width: '100%', marginBottom: 6 }}>
                {active ? 'Disable' : 'Enable'} Ruler
            </button>
            <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                <button disabled={!active} onClick={reset} style={{ flex: 1 }}>Reset</button>
            </div>
            <div style={{ background: '#2a2d31', padding: '6px 8px', borderRadius: 4 }}>
                <strong>Status:</strong> {active ? 'Active' : 'Inactive'}<br />
                <strong>Points:</strong> {points.length} / 2<br />
                <strong>Distance:</strong> {distance !== null ? `${distance.toFixed(3)} m` : '-'}
            </div>
            <p style={{ opacity: 0.7, lineHeight: 1.4, marginTop: 8 }}>
                2点クリックで距離計測。3点目で新しい計測を開始します。Ruler を無効化すると表示と状態はクリアされます。
            </p>
        </div>
    );
};

export default RulerMenu;