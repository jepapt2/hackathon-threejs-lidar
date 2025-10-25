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
            <button onClick={() => setOpen(o => !o)} style={{ width: 44, height: 44, borderRadius: 8, background: '#222', color: '#fff', border: '1px solid #333' }}>{open ? '×' : '☰'}</button>

            {open && (
                <div style={{ marginTop: 8, width: 360, background: '#141414', color: '#eee', border: '1px solid #2b2b2b', borderRadius: 8, boxShadow: '0 6px 20px rgba(0,0,0,0.6)', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', gap: 6, padding: 8, borderBottom: '1px solid #232323' }}>
                        <button onClick={() => setTab('models')} style={{ flex: 1, background: tab === 'models' ? '#2a6' : 'transparent', color: '#eee', border: 'none', padding: 8 }}>Models</button>
                        <button onClick={() => setTab('ruler')} style={{ flex: 1, background: tab === 'ruler' ? '#2a6' : 'transparent', color: '#eee', border: 'none', padding: 8 }}>Ruler</button>
                        <button onClick={() => setTab('items')} style={{ flex: 1, background: tab === 'items' ? '#2a6' : 'transparent', color: '#eee', border: 'none', padding: 8 }}>Items</button>
                    </div>

                    <div style={{ padding: 12, maxHeight: 420, overflowY: 'auto' }}>
                        {tab === 'models' && (
                            <div>
                                <div style={{ fontWeight: 700, marginBottom: 8 }}>Loaded Models</div>
                                <div style={{ maxHeight: 160, overflowY: 'auto', marginBottom: 8 }}>
                                    {models.length === 0 && <div style={{ color: '#888' }}>No models loaded</div>}
                                    {models.map(m => (
                                        <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid #222' }}>
                                            <button style={{ flex: 1, textAlign: 'left', background: selectedModelId === m.id ? '#2a6' : 'transparent', color: '#eee', border: 'none', padding: '6px' }} onClick={() => setSelectedModelId(m.id)}>{m.name || m.id}</button>
                                            <button title='Delete' onClick={() => removeModel(m.id)} style={{ background: 'transparent', color: '#f66', border: 'none' }}>✕</button>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ fontWeight: 700, marginBottom: 6 }}>Selected Model</div>
                                {!sel && <div style={{ color: '#888', marginBottom: 8 }}>— none —</div>}
                                {sel && (
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{sel.name}</div>
                                        <div style={{ fontWeight: 600, marginBottom: 6 }}>Position</div>
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

                                        <div style={{ fontWeight: 600, marginTop: 8, marginBottom: 6 }}>Rotation (deg)</div>
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
                                            <button style={{ flex: 1 }} onClick={() => { updateSelectedPosition({ x: 0, y: 0, z: 0 }); updateSelectedRotation({ x: 0, y: 0, z: 0 }); }}>Reset</button>
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
