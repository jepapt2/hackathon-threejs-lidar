import React, { useState } from 'react';
import RulerMenu from './RulerMenu';
import ItemsDebug from './ItemsDebug';

type Model = { id: string; name?: string; url: string; position: { x: number; y: number; z: number }; rotation: { x: number; y: number; z: number } };

export const ControlPanel: React.FC<{
    models: Model[];
    selectedModelId?: string;
    setSelectedModelId: (id?: string) => void;
    updateSelectedPosition: (patch: Partial<{ x: number; y: number; z: number }>) => void;
    updateSelectedRotation: (patch: Partial<{ x: number; y: number; z: number }>) => void;
    removeModel: (id: string) => void;
    addModel: (url: string, name?: string) => void;
}> = ({ models, selectedModelId, setSelectedModelId, updateSelectedPosition, updateSelectedRotation, removeModel, addModel }) => {
    const [open, setOpen] = useState(false);
    const [tab, setTab] = useState<'models' | 'ruler' | 'items'>('models');

    const sel = selectedModelId ? models.find(m => m.id === selectedModelId) : undefined;

    return (
        <div style={{ position: 'absolute', left: 12, top: 12, zIndex: 40 }}>
            {/* top menu buttons always visible; clicking opens the lower panel with selected tab */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button onClick={() => { setTab('models'); setOpen(true); }} title='編集' style={{ padding: '8px 10px', borderRadius: 6, background: tab === 'models' && open ? '#2a6' : '#222', color: '#fff', border: '1px solid #333' }}>編集</button>
                <button onClick={() => { setTab('ruler'); setOpen(true); }} title='定規' style={{ padding: '8px 10px', borderRadius: 6, background: tab === 'ruler' && open ? '#2a6' : '#222', color: '#fff', border: '1px solid #333' }}>定規</button>
                <button onClick={() => { setTab('items'); setOpen(true); }} title='モデル' style={{ padding: '8px 10px', borderRadius: 6, background: tab === 'items' && open ? '#2a6' : '#222', color: '#fff', border: '1px solid #333' }}>配置</button>
                <button onClick={() => setOpen(false)} style={{ borderRadius: 6, background: '#222', color: '#fff', border: 'none' }}>×</button>
            </div>

            {open && (
                <div style={{ marginTop: 8, width: 400, background: '#141414', color: '#eee', border: '1px solid #2b2b2b', borderRadius: 8, boxShadow: '0 6px 20px rgba(0,0,0,0.6)', overflow: 'hidden', position: 'relative' }}>
                    {/* close button inside open panel */}

                    <div style={{ padding: 12, maxHeight: 420, overflowY: 'auto' }}>
                        {tab === 'models' && (
                            <div>
                                <div style={{ fontWeight: 700, marginBottom: 8 }}>配置済みモデル</div>
                                <div style={{ maxHeight: 160, overflowY: 'auto', marginBottom: 8 }}>
                                    {models.length === 0 && <div style={{ color: '#888' }}>モデルは読み込まれていません</div>}
                                    {models.map(m => (
                                        <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid #222' }}>
                                            <button style={{ flex: 1, textAlign: 'left', background: selectedModelId === m.id ? '#2a6' : 'transparent', color: '#eee', border: 'none', padding: '6px' }} onClick={() => setSelectedModelId(m.id)}>{m.name || m.id}</button>
                                            <button title='削除' onClick={() => removeModel(m.id)} style={{ background: 'transparent', color: '#f66', border: 'none' }}>✕</button>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ fontWeight: 700, marginBottom: 6 }}>選択中のモデル</div>
                                {!sel && <div style={{ color: '#888', marginBottom: 8 }}>— 未選択 —</div>}
                                {sel && (
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{sel.name}</div>
                                        <div style={{ fontWeight: 600, marginBottom: 6 }}>位置</div>
                                        {(['x', 'y', 'z'] as const).map(axis => (
                                            <div key={`pos-${axis}`} style={{ display: 'flex', alignItems: 'center', marginBottom: 6, gap: 8 }}>
                                                <label style={{ width: 18 }}>{axis.toUpperCase()}</label>
                                                <input type='number' step={0.1} value={sel.position[axis]} style={{ flex: 1, background: '#111', color: '#eee', border: '1px solid #444', padding: '4px 6px' }} onChange={e => updateSelectedPosition({ [axis]: parseFloat(e.target.value) || 0 })} />
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                    <button style={{ fontSize: 12 }} onClick={() => updateSelectedPosition({ [axis]: +((sel.position[axis] + 0.5).toFixed(3)) })}>+0.5</button>
                                                    <button style={{ fontSize: 12 }} onClick={() => updateSelectedPosition({ [axis]: +((sel.position[axis] - 0.5).toFixed(3)) })}>-0.5</button>
                                                </div>
                                            </div>
                                        ))}

                                        <div style={{ fontWeight: 600, marginTop: 8, marginBottom: 6 }}>回転（°）</div>
                                        {(['x', 'y', 'z'] as const).map(axis => (
                                            <div key={`rot-${axis}`} style={{ display: 'flex', alignItems: 'center', marginBottom: 6, gap: 8 }}>
                                                <label style={{ width: 18 }}>{axis.toUpperCase()}</label>
                                                <input type='number' step={1} value={sel.rotation[axis]} style={{ flex: 1, background: '#111', color: '#eee', border: '1px solid #444', padding: '4px 6px' }} onChange={e => updateSelectedRotation({ [axis]: parseFloat(e.target.value) || 0 })} />
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                    <button style={{ fontSize: 12 }} onClick={() => updateSelectedRotation({ [axis]: +((sel.rotation[axis] + 5).toFixed(3)) })}>+5°</button>
                                                    <button style={{ fontSize: 12 }} onClick={() => updateSelectedRotation({ [axis]: +((sel.rotation[axis] - 5).toFixed(3)) })}>-5°</button>
                                                </div>
                                            </div>
                                        ))}

                                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                            <button style={{ flex: 1 }} onClick={() => { updateSelectedPosition({ x: 0, y: 0, z: 0 }); updateSelectedRotation({ x: 0, y: 0, z: 0 }); }}>リセット</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {tab === 'ruler' && (
                            <div>
                                <RulerMenu inline />
                            </div>
                        )}

                        {tab === 'items' && (
                            <div>
                                <ItemsDebug onSelect={(it) => { if (it.url) addModel(it.url, it.name); }} inline />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ControlPanel;
