import React, { useEffect, useState } from 'react';
import { listAssets, uploadModelFile, createAsset, deleteAsset } from '../lib/assets';
import type { Asset } from '../lib/assets';
import { supabase } from '../lib/supabaseClient';

export const AssetsDebug: React.FC = () => {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [notes, setNotes] = useState('');
    // セッション情報は必要時に取得する。現状未使用なので保持しない。

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const list = await listAssets();
                setAssets(list);
            } catch (e: unknown) {
                const msg = e instanceof Error ? e.message : String(e);
                setError(msg);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    async function handleUpload() {
        if (!file) return;
        setError(null);
        try {
            setLoading(true);
            const { filePath, publicUrl } = await uploadModelFile(file);
            // owner_id はセッションから取得する運用 (ここは簡易的にユーザIDを仮置き)
            const { data: authData } = await supabase.auth.getUser();
            const ownerId = authData?.user?.id || 'anonymous-owner';
            const asset = await createAsset({ file_path: filePath, title, notes, owner_id: ownerId });
            setAssets((prev) => [asset, ...prev]);
            console.log('Uploaded URL (public maybe):', publicUrl);
            setTitle('');
            setNotes('');
            setFile(null);
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            setError(msg);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id: string) {
        try {
            await deleteAsset(id);
            setAssets((prev) => prev.filter(a => a.id !== id));
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            setError(msg);
        }
    }

    return (
        <div style={{ padding: '1rem', background: '#111', color: '#eee', fontFamily: 'sans-serif' }}>
            <h2>Assets Debug</h2>
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'tomato' }}>{error}</p>}
            <div style={{ marginBottom: '1rem' }}>
                <input type="file" accept=".glb,.gltf,.ply" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                <input type="text" placeholder="title" value={title} onChange={(e) => setTitle(e.target.value)} />
                <input type="text" placeholder="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
                <button disabled={!file || loading} onClick={handleUpload}>Upload & Create Asset</button>
            </div>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {assets.map(a => (
                    <li key={a.id} style={{ marginBottom: '0.75rem', border: '1px solid #444', padding: '0.5rem' }}>
                        <strong>{a.title || '(no title)'}</strong><br />
                        <small>{a.file_path}</small><br />
                        <small>{a.created_at}</small><br />
                        <button onClick={() => handleDelete(a.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AssetsDebug;
