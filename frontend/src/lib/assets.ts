import { supabase } from './supabaseClient';

export type Asset = {
    id: string;
    owner_id: string; // Supabase の auth.uid()
    file_path: string;
    title?: string | null;
    notes?: string | null;
    created_at: string;
};

// 一覧取得 (自分のレコードのみ。公開ポリシーなら全件になる可能性あり)
export async function listAssets(): Promise<Asset[]> {
    const { data, error } = await supabase.from('assets').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data as Asset[];
}

// 1件取得
export async function getAsset(id: string): Promise<Asset | null> {
    const { data, error } = await supabase.from('assets').select('*').eq('id', id).single();
    if (error) {
        if (error.code === 'PGRST116') return null; // not found
        throw error;
    }
    return data as Asset;
}

// 追加 (owner_id は DB 側トリガーで入れる運用も可。ここでは引数で渡す例)
export async function createAsset(params: { file_path: string; title?: string; notes?: string; owner_id: string }): Promise<Asset> {
    const { data, error } = await supabase.from('assets').insert({ ...params }).select().single();
    if (error) throw error;
    return data as Asset;
}

// 更新
export async function updateAsset(id: string, patch: Partial<Pick<Asset, 'title' | 'notes'>>): Promise<Asset> {
    const { data, error } = await supabase.from('assets').update(patch).eq('id', id).select().single();
    if (error) throw error;
    return data as Asset;
}

// 削除
export async function deleteAsset(id: string): Promise<boolean> {
    const { error } = await supabase.from('assets').delete().eq('id', id);
    if (error) throw error;
    return true;
}

// ファイルアップロード (models バケット)
export async function uploadModelFile(file: File): Promise<{ filePath: string; publicUrl?: string }> {
    const bucket = 'models';
    const path = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, { contentType: file.type });
    if (error) throw error;
    // 公開バケットの場合に URL 取得
    const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(path);
    return { filePath: data?.path ?? path, publicUrl: publicData.publicUrl };
}

// 署名付き URL 生成 (private バケット向け)
export async function getSignedModelUrl(filePath: string, expiresInSeconds = 60): Promise<string> {
    const bucket = 'models';
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(filePath, expiresInSeconds);
    if (error) throw error;
    return data.signedUrl;
}
