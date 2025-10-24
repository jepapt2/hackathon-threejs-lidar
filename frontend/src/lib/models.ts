import { supabase } from './supabaseClient';

export type Item = {
    id: string;
    name: string;
    created_at: string;
    owner_id?: string | null;
};

export async function listItems(): Promise<Item[]> {
    const { data, error } = await supabase.from('models').select('*')
    console.log('listItems data:', data, error);
    if (error) throw error;
    return (data ?? []) as Item[];
}

export async function createItem(params: { name: string; owner_id?: string | null }): Promise<Item> {
    const { data, error } = await supabase.from('models').insert(params).select().single();
    if (error) throw error;
    return data as Item;
}

export async function deleteItem(id: string): Promise<boolean> {
    const { error } = await supabase.from('models').delete().eq('id', id);
    if (error) throw error;
    return true;
}
