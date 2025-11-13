import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

interface SceneRow { id: string; name: string }

export default function ScenesIndex() {
  const [scenes, setScenes] = useState<SceneRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    const run = async () => {
      const { data, error } = await supabase.from('scenes').select('id,name').order('created_at', { ascending: false });
      if (error) { setError(error.message); setLoading(false); return; }
      setScenes((data as SceneRow[]) || []);
      setLoading(false);
    };
    run();
  }, []);

  return (
    <div style={{ padding: 40, fontFamily: 'sans-serif', background: '#111', minHeight: '100vh', color: '#eee' }}>
      <h1 style={{ fontSize: 22, marginBottom: 16 }}>シーン一覧 (IDルート)</h1>
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
      <p style={{ marginTop: 28, fontSize: 12, opacity: 0.6 }}>現段階ではクリックで App を表示するだけ (ID参照)。後で読み込み処理を追加予定。</p>
    </div>
  );
}
