import React, { useState, useEffect } from 'react';
import * as THREE from 'three';
import { supabase } from '../lib/supabaseClient';
import usePins from '../tools/usePins';
import RulerMenu from './RulerMenu';
import ItemsDebug from './ItemsDebug';

type Model = {
  id: string;
  name?: string;
  url: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
};

interface ControlPanelProps {
  models: Model[];
  selectedModelId?: string;
  setSelectedModelId: (id?: string) => void;
  updateSelectedPosition: (patch: Partial<{ x: number; y: number; z: number }>) => void;
  updateSelectedRotation: (patch: Partial<{ x: number; y: number; z: number }>) => void;
  removeModel: (id: string) => void;
  addModel: (url: string, name?: string) => void;
  replaceAllModels?: (next: Model[]) => void;
}

interface SceneModelRow {
  id: string;
  name?: string;
  source_url: string;
  position_x: number; position_y: number; position_z: number;
  rotation_x: number; rotation_y: number; rotation_z: number;
}

interface ScenePinRow {
  id: string;
  scene_model_id?: string | null;
  comment?: string | null;
  world_x: number; world_y: number; world_z: number;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  models,
  selectedModelId,
  setSelectedModelId,
  updateSelectedPosition,
  updateSelectedRotation,
  removeModel,
  addModel,
  replaceAllModels
}) => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'models' | 'ruler' | 'items' | 'pins' | 'scenes'>('models');
  const [currentSceneName, setCurrentSceneName] = useState('default');
  const [scenes, setScenes] = useState<Array<{ id: string; name: string }>>([]);
  const sel = selectedModelId ? models.find(m => m.id === selectedModelId) : undefined;

  const [posEdit, setPosEdit] = useState<{ x: string; y: string; z: string }>({ x: '0', y: '0', z: '0' });
  const [rotEdit, setRotEdit] = useState<{ x: string; y: string; z: string }>({ x: '0', y: '0', z: '0' });

  useEffect(() => {
    if (sel) {
      setPosEdit({ x: String(sel.position.x), y: String(sel.position.y), z: String(sel.position.z) });
      setRotEdit({ x: String(sel.rotation.x), y: String(sel.rotation.y), z: String(sel.rotation.z) });
    }
  }, [sel]);

  // Pins
  const pinsCtx = usePins();
  const { pins, active, toggleActive, removePin, updateComment, clearPins, setAllPins } = pinsCtx;

  const refreshScenes = async () => {
    const { data, error } = await supabase.from('scenes').select('id,name').order('created_at', { ascending: false });
    if (!error && data) setScenes(data as Array<{id:string;name:string}>);
  };
  useEffect(() => { if (open && tab === 'scenes') refreshScenes(); }, [open, tab]);

  const saveScene = async () => {
    const sceneName = currentSceneName.trim() || 'default';
    const { data: sceneRows, error: sceneErr } = await supabase.from('scenes').select('id').eq('name', sceneName).limit(1);
    if (sceneErr) { alert('シーン取得失敗: ' + sceneErr.message); return; }
    let sceneId: string | undefined = sceneRows?.[0]?.id as string | undefined;
    if (!sceneId) {
      const { data: inserted, error: insErr } = await supabase.from('scenes').insert({ name: sceneName }).select('id').limit(1);
      if (insErr || !inserted || inserted.length === 0) { alert('シーン作成失敗'); return; }
      sceneId = inserted[0].id as string;
    }
    // purge existing
    await supabase.from('scene_models').delete().eq('scene_id', sceneId);
    await supabase.from('scene_pins').delete().eq('scene_id', sceneId);
    // insert models
    const modelPayload = models.map(m => ({
      scene_id: sceneId,
      name: m.name,
      source_url: m.url,
      position_x: m.position.x,
      position_y: m.position.y,
      position_z: m.position.z,
      rotation_x: m.rotation.x,
      rotation_y: m.rotation.y,
      rotation_z: m.rotation.z,
      scale_x: 1, scale_y: 1, scale_z: 1, order_index: 0
    }));
  const { data: insertedModels, error: modErr } = await supabase.from('scene_models').insert(modelPayload).select('id');
    if (modErr) { alert('モデル保存失敗: ' + modErr.message); return; }
  const idMap: Record<string,string> = {};
  (insertedModels||[]).forEach((row: { id: string }, idx:number) => { idMap[models[idx].id] = row.id; });
    if (pins.length) {
      const pinPayload = pins.map(p => ({
        scene_id: sceneId,
        scene_model_id: p.modelId ? idMap[p.modelId] ?? null : null,
        comment: p.comment,
        world_x: p.position.x,
        world_y: p.position.y,
        world_z: p.position.z
      }));
      const { error: pinErr } = await supabase.from('scene_pins').insert(pinPayload);
      if (pinErr) { alert('ピン保存失敗: ' + pinErr.message); return; }
    }
    await refreshScenes();
    alert('シーン保存完了');
  };

  const loadScene = async (nameOverride?: string) => {
    const sceneName = (nameOverride || currentSceneName || 'default').trim();
    const { data: sceneRows, error: sceneErr } = await supabase.from('scenes').select('id').eq('name', sceneName).limit(1);
    if (sceneErr || !sceneRows || sceneRows.length === 0) { alert('シーンがありません'); return; }
    const sceneId = sceneRows[0].id as string;
  const { data: modelRows, error: mErr } = await supabase.from('scene_models').select('*').eq('scene_id', sceneId);
    if (mErr) { alert('モデル取得失敗'); return; }
    const { data: pinRows, error: pErr } = await supabase.from('scene_pins').select('*').eq('scene_id', sceneId);
    if (pErr) { alert('ピン取得失敗'); return; }
    if (replaceAllModels) {
      const loadedModels: Model[] = (modelRows as SceneModelRow[] | null || []).map(r => ({
        id: r.id,
        name: r.name || undefined,
        url: r.source_url,
        position: { x: r.position_x, y: r.position_y, z: r.position_z },
        rotation: { x: r.rotation_x, y: r.rotation_y, z: r.rotation_z }
      }));
      replaceAllModels(loadedModels);
      setSelectedModelId(loadedModels[0]?.id);
    }
    const nextPins = (pinRows as ScenePinRow[] | null || []).map(r => ({
      id: r.id,
      position: new THREE.Vector3(r.world_x, r.world_y, r.world_z),
      comment: r.comment || '',
      modelId: r.scene_model_id || undefined
    }));
    setAllPins(nextPins);
    alert('読み込み完了: モデル ' + (modelRows?.length || 0) + ' / ピン ' + (pinRows?.length || 0) + ' 件');
  };

  return (
    <div style={{ position: 'absolute', left: 12, top: 12, zIndex: 40 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button onClick={() => { setTab('models'); setOpen(true); }} style={{ padding: '8px 10px', borderRadius: 6, background: tab === 'models' && open ? '#2a6' : '#222', color: '#fff', border: '1px solid #333' }}>編集</button>
        <button onClick={() => { setTab('ruler'); setOpen(true); }} style={{ padding: '8px 10px', borderRadius: 6, background: tab === 'ruler' && open ? '#2a6' : '#222', color: '#fff', border: '1px solid #333' }}>定規</button>
        <button onClick={() => { setTab('items'); setOpen(true); }} style={{ padding: '8px 10px', borderRadius: 6, background: tab === 'items' && open ? '#2a6' : '#222', color: '#fff', border: '1px solid #333' }}>配置</button>
  <button onClick={() => { setTab('pins'); setOpen(true); }} style={{ padding: '8px 10px', borderRadius: 6, background: tab === 'pins' && open ? '#2a6' : '#222', color: '#fff', border: '1px solid #333' }}>ピン</button>
  <button onClick={() => { setTab('scenes'); setOpen(true); }} style={{ padding: '8px 10px', borderRadius: 6, background: tab === 'scenes' && open ? '#2a6' : '#222', color: '#fff', border: '1px solid #333' }}>シーン</button>
        {open && <button onClick={() => setOpen(false)} style={{ padding: '8px 10px', borderRadius: 6, background: '#222', color: '#fff', border: '1px solid #333' }}>×</button>}
      </div>
      {open && (
        <div style={{ marginTop: 8, width: 410, background: '#141414', color: '#eee', border: '1px solid #2b2b2b', borderRadius: 8, boxShadow: '0 6px 20px rgba(0,0,0,0.6)', overflow: 'hidden' }}>
          <div style={{ padding: 12, maxHeight: 460, overflowY: 'auto' }}>
            {tab === 'models' && (
              <div>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>配置済みモデル</div>
                <div style={{ maxHeight: 160, overflowY: 'auto', marginBottom: 8 }}>
                  {models.length === 0 && <div style={{ color: '#888' }}>モデルはありません</div>}
                  {models.map(m => (
                    <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid #222' }}>
                      <button style={{ flex: 1, textAlign: 'left', background: m.id === selectedModelId ? '#2a6' : '#222', color: '#fff', border: '1px solid #333', padding: '4px 6px', borderRadius: 4 }} onClick={() => setSelectedModelId(m.id)}>{m.name || m.id}</button>
                      <button style={{ fontSize: 11, padding: '4px 6px', color: '#f88', border: '1px solid #333', background: '#222', borderRadius: 4 }} onClick={() => removeModel(m.id)}>削除</button>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <button style={{ flex: 1 }} onClick={saveScene}>シーン保存</button>
                  <button style={{ flex: 1 }} onClick={() => loadScene()}>シーン読込</button>
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
                        <input
                          type='number'
                          step={0.1}
                          value={posEdit[axis]}
                          style={{ flex: 1, background: '#111', color: '#eee', border: '1px solid #444', padding: '4px 6px' }}
                          onChange={e => setPosEdit(prev => ({ ...prev, [axis]: e.target.value }))}
                          onBlur={() => {
                            const v = parseFloat(posEdit[axis]);
                            updateSelectedPosition({ [axis]: Number.isFinite(v) ? v : 0 });
                          }}
                          onKeyDown={(e) => { if (e.key === 'Enter') { const v = parseFloat(posEdit[axis]); updateSelectedPosition({ [axis]: Number.isFinite(v) ? v : 0 }); } }}
                        />
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button style={{ fontSize: 12, padding: '4px 6px' }} onClick={() => { const v = +((sel.position[axis] + 0.5).toFixed(3)); updateSelectedPosition({ [axis]: v }); setPosEdit(prev => ({ ...prev, [axis]: String(v) })); }}>+0.5</button>
                          <button style={{ fontSize: 12, padding: '4px 6px' }} onClick={() => { const v = +((sel.position[axis] - 0.5).toFixed(3)); updateSelectedPosition({ [axis]: v }); setPosEdit(prev => ({ ...prev, [axis]: String(v) })); }}>-0.5</button>
                        </div>
                      </div>
                    ))}
                    <div style={{ fontWeight: 600, marginTop: 8, marginBottom: 6 }}>回転（°）</div>
                    {(['x', 'y', 'z'] as const).map(axis => (
                      <div key={`rot-${axis}`} style={{ display: 'flex', alignItems: 'center', marginBottom: 6, gap: 8 }}>
                        <label style={{ width: 18 }}>{axis.toUpperCase()}</label>
                        <input
                          type='number'
                          step={1}
                          value={rotEdit[axis]}
                          style={{ flex: 1, background: '#111', color: '#eee', border: '1px solid #444', padding: '4px 6px' }}
                          onChange={e => setRotEdit(prev => ({ ...prev, [axis]: e.target.value }))}
                          onBlur={() => {
                            const v = parseFloat(rotEdit[axis]);
                            updateSelectedRotation({ [axis]: Number.isFinite(v) ? v : 0 });
                          }}
                          onKeyDown={(e) => { if (e.key === 'Enter') { const v = parseFloat(rotEdit[axis]); updateSelectedRotation({ [axis]: Number.isFinite(v) ? v : 0 }); } }}
                        />
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button style={{ fontSize: 12, padding: '4px 6px' }} onClick={() => { const v = +((sel.rotation[axis] + 5).toFixed(3)); updateSelectedRotation({ [axis]: v }); setRotEdit(prev => ({ ...prev, [axis]: String(v) })); }}>+5°</button>
                          <button style={{ fontSize: 12, padding: '4px 6px' }} onClick={() => { const v = +((sel.rotation[axis] - 5).toFixed(3)); updateSelectedRotation({ [axis]: v }); setRotEdit(prev => ({ ...prev, [axis]: String(v) })); }}>-5°</button>
                        </div>
                      </div>
                    ))}
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <button style={{ flex: 1 }} onClick={() => { updateSelectedPosition({ x: 0, y: 0, z: 0 }); updateSelectedRotation({ x: 0, y: 0, z: 0 }); setPosEdit({ x: '0', y: '0', z: '0' }); setRotEdit({ x: '0', y: '0', z: '0' }); }}>リセット</button>
                    </div>
                  </div>
                )}
              </div>
            )}
            {tab === 'ruler' && (
              <div><RulerMenu inline /></div>
            )}
            {tab === 'items' && (
              <div><ItemsDebug onSelect={(it) => { if (it.url) addModel(it.url, it.name); }} inline /></div>
            )}
            {tab === 'pins' && (
              <div>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>ピン</div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <button style={{ flex: 1 }} onClick={toggleActive}>{active ? '配置モード終了' : '配置モード開始'}</button>
                  <button style={{ flex: 1 }} onClick={clearPins} disabled={pins.length === 0}>全削除</button>
                </div>
                <div style={{ marginBottom: 8, background: '#1d1f22', padding: '6px 8px', borderRadius: 4, fontSize: 12 }}>
                  モード: <strong style={{ color: active ? '#4ecc8c' : '#ccc' }}>{active ? '配置中 (クリックで追加)' : '待機'}</strong><br />
                  合計ピン: {pins.length}
                </div>
                {pins.length === 0 && <div style={{ color: '#777', fontSize: 12 }}>ピンはまだありません。配置モード開始後にモデル上をクリックしてください。</div>}
                {pins.length > 0 && (
                  <div style={{ maxHeight: 200, overflowY: 'auto', borderTop: '1px solid #222', paddingTop: 6 }}>
                    {pins.map(p => (
                      <div key={p.id} style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '6px 0', borderBottom: '1px solid #222' }}>
                        <div style={{ fontSize: 11, wordBreak: 'break-word' }}>{p.comment || '(コメントなし)'}</div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button style={{ flex: 1, fontSize: 11 }} onClick={() => {
                            const next = window.prompt('コメントを編集', p.comment) ?? p.comment;
                            updateComment(p.id, next);
                          }}>編集</button>
                          <button style={{ flex: 1, fontSize: 11, color: '#f88' }} onClick={() => removePin(p.id)}>削除</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <p style={{ marginTop: 10, fontSize: 11, lineHeight: 1.5, opacity: 0.75 }}>
                  配置モードを開始すると左クリック位置にピンを追加します。追加時にコメント入力できます。
                </p>
              </div>
            )}
            {tab === 'scenes' && (
              <div>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>シーン一覧</div>
                <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                  <input value={currentSceneName} onChange={e => setCurrentSceneName(e.target.value)} placeholder='シーン名' style={{ flex: 1, background: '#111', border: '1px solid #333', color: '#eee', padding: '4px 6px' }} />
                  <button onClick={saveScene}>保存</button>
                  <button onClick={() => loadScene()}>読込</button>
                </div>
                <div style={{ marginBottom: 8, display: 'flex', gap: 6 }}>
                  <button style={{ flex: 1 }} onClick={refreshScenes}>再読込</button>
                  <button style={{ flex: 1 }} onClick={async () => { const name = prompt('新しいシーン名', currentSceneName) || ''; if (!name.trim()) return; const { error } = await supabase.from('scenes').insert({ name: name.trim() }); if (error) { alert('作成失敗: '+error.message); } else { setCurrentSceneName(name.trim()); refreshScenes(); } }}>新規作成</button>
                </div>
                <div style={{ maxHeight: 200, overflowY: 'auto', borderTop: '1px solid #222', paddingTop: 6 }}>
                  {scenes.length === 0 && <div style={{ color: '#777', fontSize: 12 }}>シーンなし</div>}
                  {scenes.map(s => (
                    <div key={s.id} style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '4px 0', borderBottom: '1px solid #222' }}>
                      <button style={{ flex: 1, textAlign: 'left', background: s.name === currentSceneName ? '#2a6' : '#222', color: '#fff', border: '1px solid #333', padding: '4px 6px', borderRadius: 4 }} onClick={() => { setCurrentSceneName(s.name); loadScene(s.name); }}>読込: {s.name}</button>
                      <button style={{ fontSize: 11, color: '#f88', background: '#222', border: '1px solid #333', padding: '4px 6px', borderRadius: 4 }} onClick={async () => { if (!confirm('削除しますか?')) return; await supabase.from('scene_pins').delete().eq('scene_id', s.id); await supabase.from('scene_models').delete().eq('scene_id', s.id); const { error } = await supabase.from('scenes').delete().eq('id', s.id); if (error) { alert('削除失敗: '+error.message); } refreshScenes(); }}>削除</button>
                    </div>
                  ))}
                </div>
                <p style={{ marginTop: 10, fontSize: 11, lineHeight: 1.5, opacity: 0.7 }}>保存は現在のモデル/ピンを指定シーン名に上書きします。ピンのモデル参照は保存時に新規UUIDへ再マッピングされます。</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ControlPanel;
