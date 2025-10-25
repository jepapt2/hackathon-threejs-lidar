import React, { useEffect, useState } from 'react';
import { listItems, createItem } from '../lib/models';
import type { Item } from '../lib/models';


export const ItemsDebug: React.FC<{ onSelect?: (item: Item) => void; inline?: boolean }> = ({ onSelect, inline = false }) => {
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

    // async function handleDelete(id: string) {
    //     try {
    //         await deleteItem(id);
    //         setItems(prev => prev.filter(i => i.id !== id));
    //     } catch (e: unknown) {
    //         const msg = e instanceof Error ? e.message : String(e);
    //         setError(msg);
    //     }
    // }

    const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
    const ACCEPT = '.glb,.gltf,model/gltf-binary,application/octet-stream'; // 拡張

    const base: React.CSSProperties = { background: '#1d1d1d', color: '#eee', fontSize: 12, fontFamily: 'sans-serif', padding: '0.75rem' };
    const containerStyle: React.CSSProperties = inline
        ? { ...base, width: '100%', borderRadius: 6, boxSizing: 'border-box', overflowX: 'hidden', maxWidth: '100%', overflowWrap: 'break-word' }
        : { ...base, position: 'absolute', top: 0, right: 0, width: 280, boxSizing: 'border-box' };

    return (
        <div style={containerStyle}>
            {loading && <p>読み込み中...</p>}
            {error && <p style={{ color: 'tomato' }}>{error}</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
                <input style={{ width: '100%', boxSizing: 'border-box' }} value={name} onChange={(e) => setName(e.target.value)} placeholder="モデル名" />
                {/* iPad で accept によりファイルが半透明(選択不可)になる場合があるため、iOS では accept を外す */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                        id="items-file-input"
                        type="file"
                        accept={isIOS ? undefined : ACCEPT}
                        onChange={(e) => {
                            const f = e.target.files?.[0] ?? null;
                            if (f) {
                                console.log('[ItemsDebug] file selected', { name: f.name, size: f.size, type: f.type });
                            }
                            setFile(f);
                        }}
                        style={{ display: 'none' }}
                    />
                    <label htmlFor='items-file-input' style={{ display: 'inline-block', padding: '6px 10px', background: '#2b2b2b', color: '#fff', borderRadius: 6, cursor: 'pointer', border: '1px solid #333' }}>
                        {file ? '選択済み: ' + file.name : 'glbファイルをアップロード'}
                    </label>
                    {file && <button onClick={() => setFile(null)} style={{ background: 'transparent', color: '#fff', border: '1px solid #444', padding: '6px 8px', borderRadius: 6 }}>クリア</button>}
                </div>
                {isIOS && <small style={{ opacity: 0.7 }}>iOS: ファイルが選択できない場合は Files アプリから共有 → このブラウザで開くを試してください</small>}
                <button disabled={!name || loading} onClick={handleCreate}>追加</button>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {items.map(i => (
                    <li
                        key={i.id}
                        style={{ borderBottom: '1px solid #333', padding: '4px 0', overflowWrap: 'break-word' }}

                    >
                        <strong style={{ display: 'block', wordBreak: 'break-word' }}>{i.name}</strong>

                        <small style={{ display: 'block', opacity: 0.8 }}>{i.created_at}</small>
                        <div style={{ marginTop: 6, display: "flex", justifyContent: "space-between" }}>
                            <button onClick={(e) => {
                                e.stopPropagation();
                                if (i.url) onSelect?.(i);
                            }}>配置</button>
                            {/* <button style={{ color: '#f66', backgroundColor: 'transparent' }} onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(
                                    `${i.name} を削除してもよろしいですか？`
                                )) {
                                    handleDelete(i.id);
                                }
                            }}>削除</button> */}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ItemsDebug;
