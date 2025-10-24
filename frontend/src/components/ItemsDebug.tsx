import React, { useEffect, useState } from 'react';
import { listItems, deleteItem, createItem } from '../lib/models';
import type { Item } from '../lib/models';


export const ItemsDebug: React.FC<{ onSelect?: (item: Item) => void }> = ({ onSelect }) => {
    const [items, setItems] = useState<Item[]>([]);
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const list = await listItems();
                setItems(list);
            } catch (e: unknown) {
                const msg = e instanceof Error ? e.message : String(e);
                setError(msg);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    async function handleCreate() {
        if (!name) return;
        try {
            setLoading(true);
            const newItem = await createItem({ name, file: file ?? undefined });
            setItems(prev => [newItem, ...prev]);
            setName('');
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
            await deleteItem(id);
            setItems(prev => prev.filter(i => i.id !== id));
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            setError(msg);
        }
    }

    const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
    const ACCEPT = '.glb,.gltf,model/gltf-binary,application/octet-stream'; // 拡張

    return (
        <div style={{ position: 'absolute', top: 0, right: 0, width: 280, background: '#1d1d1d', color: '#eee', fontSize: 12, fontFamily: 'sans-serif', padding: '0.75rem' }}>
            <h3 style={{ marginTop: 0 }}>Items Debug</h3>
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'tomato' }}>{error}</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
                <input style={{ width: '100%' }} value={name} onChange={(e) => setName(e.target.value)} placeholder="Model name" />
                {/* iPad で accept によりファイルが半透明(選択不可)になる場合があるため、iOS では accept を外す */}
                <input
                    type="file"
                    accept={isIOS ? undefined : ACCEPT}
                    onChange={(e) => {
                        const f = e.target.files?.[0] ?? null;
                        if (f) {
                            console.log('[ItemsDebug] file selected', { name: f.name, size: f.size, type: f.type });
                        }
                        setFile(f);
                    }}
                />
                {isIOS && <small style={{ opacity: 0.7 }}>iOS: ファイルが選択できない場合は Files アプリから共有 → このブラウザで開くを試してください</small>}
                <button disabled={!name || loading} onClick={handleCreate}>Add</button>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {items.map(i => (
                    <li
                        key={i.id}
                        style={{ borderBottom: '1px solid #333', padding: '4px 0', cursor: i.url ? 'pointer' : 'default' }}
                        onClick={() => { if (i.url) onSelect?.(i); }}
                    >
                        <strong>{i.name}</strong><br />
                        {i.url && <a href={i.url} onClick={(e) => e.stopPropagation()} target="_blank" rel="noreferrer" style={{ color: '#4faaff' }}>file</a>}<br />
                        <small>{i.created_at}</small><br />
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(i.id); }}>Del</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ItemsDebug;
