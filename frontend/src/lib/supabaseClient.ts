import { createClient } from '@supabase/supabase-js';

// 環境変数は Vite の仕組みで VITE_ プレフィックスが必要
// .env.local 例:
// VITE_SUPABASE_URL=https://xxxx.supabase.co
// VITE_SUPABASE_ANON_KEY=public-anon-key

// Vite では必ず VITE_ プレフィックス付き環境変数のみバンドルされる
const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
    // 初期段階では console.warn に留める
    console.warn('Supabase 環境変数が設定されていません。VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY を .env に追加してください');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
    },
});
