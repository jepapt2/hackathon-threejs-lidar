import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import App from '../App';
import type { ModelData, PinInit } from '../App';
import { supabase } from '../lib/supabaseClient';
import * as THREE from 'three';

export default function SceneWrapper() {
  const { id } = useParams();
  const navigate = useNavigate();
  const sceneId = id || '';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [initialModels, setInitialModels] = useState<ModelData[]>([]);
  const [initialPins, setInitialPins] = useState<PinInit[]>([]);

  useEffect(() => {
    const run = async () => {
      if (!sceneId) { setError('シーンID未指定'); setLoading(false); return; }
      // 存在確認
      const { data: sceneRows, error: sceneErr } = await supabase.from('scenes').select('id,name').eq('id', sceneId).limit(1);
      if (sceneErr) { setError(sceneErr.message); setLoading(false); return; }
      if (!sceneRows || sceneRows.length === 0) { setError('シーンが存在しません'); setLoading(false); return; }
      // モデル取得
      const { data: modelRows, error: mErr } = await supabase.from('scene_models').select('*').eq('scene_id', sceneId);
      if (mErr) { setError('モデル取得失敗: ' + mErr.message); setLoading(false); return; }
      // ピン取得
      const { data: pinRows, error: pErr } = await supabase.from('scene_pins').select('*').eq('scene_id', sceneId);
      if (pErr) { setError('ピン取得失敗: ' + pErr.message); setLoading(false); return; }

      type RawModel = { id:string; name?:string; source_url:string; position_x:number; position_y:number; position_z:number; rotation_x:number; rotation_y:number; rotation_z:number };
      const safeModels = (modelRows as RawModel[] | null) || [];
      setInitialModels(safeModels.map(r => ({
        id: r.id,
        name: r.name || undefined,
        url: r.source_url,
        position: { x: r.position_x, y: r.position_y, z: r.position_z },
        rotation: { x: r.rotation_x, y: r.rotation_y, z: r.rotation_z }
      })));
      type RawPin = { id:string; scene_model_id?:string|null; comment?:string|null; world_x:number; world_y:number; world_z:number };
      const safePins = (pinRows as RawPin[] | null) || [];
      setInitialPins(safePins.map(r => ({
        id: r.id,
        position: new THREE.Vector3(r.world_x, r.world_y, r.world_z),
        comment: r.comment || '',
        modelId: r.scene_model_id || undefined
      })));
      setLoading(false);
    };
    run();
  }, [sceneId]);

  if (loading) return <div style={{ padding: 40, color: '#eee', fontFamily: 'sans-serif', background: '#111', minHeight: '100vh' }}>読み込み中...</div>;
  if (error) return <div style={{ padding: 40, color: '#eee', fontFamily: 'sans-serif', background: '#111', minHeight: '100vh' }}>
    <h2 style={{ color: '#f55', fontSize: 18, marginBottom: 16 }}>エラー</h2>
    <div style={{ marginBottom: 20 }}>{error}</div>
    <a href="/" style={{ color: '#5ac46a', textDecoration: 'underline' }}>一覧へ戻る</a>
  </div>;

  return (
    <>
      <App sceneId={sceneId} initialModels={initialModels} initialPins={initialPins} />
      <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 100 }}>
        <button onClick={() => navigate('/')} style={{ padding: '6px 10px', fontSize: 12 }}>一覧へ戻る</button>
      </div>
      <div style={{ position: 'absolute', right: 8, bottom: 8, color: '#ccc', fontSize: 12, pointerEvents: 'none' }}>sceneId: {sceneId}</div>
    </>
  );
}
