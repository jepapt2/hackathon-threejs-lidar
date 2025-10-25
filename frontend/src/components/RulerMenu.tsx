import React from 'react';
import { useRuler } from '../tools/useRuler';

export const RulerMenu: React.FC<{ inline?: boolean }> = ({ inline = false }) => {
    const { active, distance, points, toggle, reset } = useRuler();
    const base = { background: '#202224', color: '#eee', fontSize: 12, fontFamily: 'sans-serif', padding: '0.75rem' } as React.CSSProperties;
    const containerStyle: React.CSSProperties = inline
        ? { ...base, width: '100%', borderRadius: 6, boxSizing: 'border-box', overflowX: 'hidden', maxWidth: '100%' }
        : { ...base, position: 'absolute', top: 0, left: 0, width: 220, borderRight: '1px solid #333', boxSizing: 'border-box' };
    return (
        <div style={containerStyle}>
            <h3 style={{ marginTop: 0 }}>定規</h3>
            <button onClick={toggle} style={{ width: '100%', marginBottom: 6, boxSizing: 'border-box' }}>
                {active ? '定規を無効化' : '定規を有効化'}
            </button>
            <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                <button disabled={!active} onClick={reset} style={{ flex: 1, boxSizing: 'border-box' }}>リセット</button>
            </div>
            <div style={{ background: '#2a2d31', padding: '6px 8px', borderRadius: 4 }}>
                <strong>状態:</strong> {active ? '有効' : '無効'}<br />
                <strong>選択点数:</strong> {points.length} / 2<br />
                <strong>距離:</strong> {distance !== null ? `${distance.toFixed(3)} m` : '-'}
            </div>
            <p style={{ opacity: 0.7, lineHeight: 1.4, marginTop: 8 }}>
                2点クリックで距離計測。3点目で新しい計測を開始します。Ruler を無効化すると表示と状態はクリアされます。
            </p>
        </div>
    );
};

export default RulerMenu;