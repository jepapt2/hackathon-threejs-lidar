import { supabase } from './supabaseClient';

// モデル(GLB)のメタデータ用テーブル想定: models
// 追加カラム例: file_path, file_url(public), file_size, content_type
// RLS は owner_id = auth.uid() のみ閲覧/追加できる想定 (現状は未設定の場合全件可)

export type Item = {
    id: string;
    name: string;
    url: string;
    created_at: string;
};

export async function listItems(): Promise<Item[]> {
    const { data, error } = await supabase.from('models').select('*')
    if (error) throw error;
    return (data ?? []) as Item[];
}

export async function createItem(params: { name: string; file?: File; owner_id?: string | null }): Promise<Item> {
    // ファイルがある場合は storage(models) へアップロード
    let uploadMeta: { file_path?: string; file_url?: string; file_size?: number; content_type?: string } = {};
    if (params.file) {
        const bucket = 'models';
        const path = `${Date.now()}-${params.file.name}`;
        const mime = params.file.type && params.file.type.trim() !== '' ? params.file.type : 'model/gltf-binary';
        console.log('[createItem] uploading file', { name: params.file.name, size: params.file.size, type: params.file.type, usedContentType: mime });
        const { data: uploadData, error: uploadError } = await supabase.storage.from(bucket).upload(path, params.file, {
            contentType: mime,
            upsert: false,
        });
        if (uploadError) throw uploadError;
        const publicInfo = supabase.storage.from(bucket).getPublicUrl(path);
        uploadMeta = {
            file_path: uploadData?.path ?? path,
            file_url: publicInfo.data.publicUrl,
            file_size: params.file.size,
            content_type: mime,
        };

    }

    const insertPayload = {
        name: params.name,
        url: uploadMeta.file_url,
    };
    console.log('[createItem] inserting row', insertPayload);

    const { data, error } = await supabase.from('models').insert(insertPayload).select().single();
    if (error) throw error;
    console.log('[createItem] insert success', data);
    return data as Item;
}

export async function deleteItem(id: string): Promise<boolean> {
    const { error } = await supabase.from('models').delete().eq('id', id);
    if (error) throw error;
    return true;
}
