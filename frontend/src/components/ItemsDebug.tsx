import React, { useEffect, useState } from 'react';
import { listItems, deleteItem } from '../lib/items';
import type { Item } from '../lib/items';


export const ItemsDebug: React.FC = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
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

            setName('');
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

    return (
        <div style={{ position: 'absolute', top: 0, right: 0, width: 280, background: '#1d1d1d', color: '#eee', fontSize: 12, fontFamily: 'sans-serif', padding: '0.75rem' }}>
            <h3 style={{ marginTop: 0 }}>Items Debug</h3>
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'tomato' }}>{error}</p>}
            <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                <input style={{ flex: 1 }} value={name} onChange={(e) => setName(e.target.value)} placeholder="Item name" />
                <button disabled={!name || loading} onClick={handleCreate}>Add</button>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {items.map(i => (
                    <li key={i.id} style={{ borderBottom: '1px solid #333', padding: '4px 0' }}>
                        <strong>{i.name}</strong><br />
                        <small>{i.created_at}</small><br />
                        <button onClick={() => handleDelete(i.id)}>Del</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ItemsDebug;
