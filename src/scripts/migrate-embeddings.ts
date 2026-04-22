import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'
import { GoogleGenAI } from '@google/genai';

// .env.localから環境変数を読み込む
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY;

if (!supabaseUrl || !supabaseServiceKey || !geminiApiKey) {
    console.error('必要な環境変数が設定されていません (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY)')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)
const ai = new GoogleGenAI({ apiKey: geminiApiKey });

async function migrate() {
    console.log('--- 既存データのベクトル化を開始します ---')

    // embeddingがnullまたは未設定のデータを取得
    const { data: addresses, error } = await supabase
        .from('address_book')
        .select('*')
        .is('embedding', null)
        .neq('is_deleted', true)

    if (error) {
        console.error('データ取得エラー:', error)
        return
    }

    if (!addresses || addresses.length === 0) {
        console.log('ベクトル化が必要なデータはありません。')
        return
    }

    console.log(`${addresses.length} 件のデータを処理します...`)

    for (const addr of addresses) {
        try {
            const searchText = [
                addr.company_name,
                addr.department,
                `${addr.last_name || ''} ${addr.first_name || ''}`.trim(),
                addr.address
            ].filter(Boolean).join(' ');

            console.log(`処理中: ${addr.company_name} (${addr.last_name} ${addr.first_name})`)
            
            const result = await ai.models.embedContent({
                model: 'models/text-embedding-004',
                contents: [searchText]
            });

            if (result && result.embeddings && result.embeddings.length > 0) {
                const embedding = result.embeddings[0].values;

                const { error: updateError } = await supabase
                    .from('address_book')
                    .update({ embedding })
                    .eq('id', addr.id)

                if (updateError) {
                    console.error(`  更新エラー (ID: ${addr.id}):`, updateError)
                }
            }
        } catch (err) {
            console.error(`  エラー発生 (ID: ${addr.id}):`, err)
        }
    }

    console.log('--- 全データのベクトル化が完了しました ---')
}

migrate().catch(console.error)
