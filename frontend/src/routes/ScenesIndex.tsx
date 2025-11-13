import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

interface SceneRow { id: string; name: string }

export default function ScenesIndex() {
  const [scenes, setScenes] = useState<SceneRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      const { data, error } = await supabase.from('scenes').select('id,name').order('created_at', { ascending: false });
      if (error) { setError(error.message); setLoading(false); return; }
      setScenes((data as SceneRow[]) || []);
      setLoading(false);
    };
    run();
  }, []);

  const refresh = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('scenes').select('id,name').order('created_at', { ascending: false });
    if (error) { setError(error.message); setLoading(false); return; }
    setScenes((data as SceneRow[]) || []);
    setLoading(false);
  };

  const createScene = async () => {
    const name = newName.trim();
    if (!name) { alert('名前を入力してください'); return; }
    setCreating(true);
    // 重複チェック
    const { data: existing, error: existErr } = await supabase.from('scenes').select('id').eq('name', name).limit(1);
    if (existErr) { alert('確認失敗: ' + existErr.message); setCreating(false); return; }
    if (existing && existing.length) {
      if (confirm('同名シーンが既にあります。開きますか？')) {
        navigate(`/scene/${existing[0].id}`);
      }
      setCreating(false);
      return;
    }
    const { data: inserted, error: insErr } = await supabase.from('scenes').insert({ name }).select('id').limit(1);
    if (insErr || !inserted || inserted.length === 0) { alert('作成失敗'); setCreating(false); return; }
    const newId = inserted[0].id;
    navigate(`/scene/${newId}`);
  };

  return (
    <div style={{ padding: 40, fontFamily: 'sans-serif', background: '#111', minHeight: '100vh', color: '#eee' }}>
      <h1 style={{ fontSize: 22, marginBottom: 16 }}>シーン一覧</h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder='新しいシーン名'
          style={{ flex: '1 1 240px', background: '#1b1b1b', border: '1px solid #333', color: '#eee', padding: '8px 10px', borderRadius: 6 }}
        />
        <button
          onClick={createScene}
          disabled={creating}
          style={{ padding: '8px 14px', borderRadius: 6 }}
        >{creating ? '作成中...' : '新規作成'}</button>
        <button
          onClick={refresh}
          disabled={loading}
          style={{ padding: '8px 14px', borderRadius: 6 }}
        >再読込</button>
      </div>
      {loading && <div>読み込み中...</div>}
      {error && <div style={{ color: '#f55' }}>エラー: {error}</div>}
      {!loading && !error && scenes.length === 0 && <div style={{ opacity: 0.7 }}>シーンがありません。</div>}
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {scenes.map(s => (
          <li key={s.id} style={{ display: 'flex' }}>
            <Link to={`/scene/${s.id}`} style={{
              flex: 1,
              background: '#1c1c1c',
              padding: '10px 14px',
              borderRadius: 6,
              border: '1px solid #2e2e2e',
              color: '#5ac46a',
              textDecoration: 'none'
            }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{s.name || '(名称なし)'}</div>
              <div style={{ fontSize: 11, opacity: 0.7 }}>id: {s.id}</div>
            </Link>
          </li>
        ))}
      </ul>
      <p style={{ marginTop: 28, fontSize: 12, opacity: 0.6 }}>
        新規作成は名前重複時に既存シーンへ遷移します。IDクリックでシーン閲覧・編集画面へ。
      </p>
    </div>
  );
}
