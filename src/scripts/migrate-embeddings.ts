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
            
            let embedding = null;
            let retries = 0;
            const maxRetries = 3;

            while (retries < maxRetries) {
                try {
                    const result = await ai.models.embedContent({
                        model: 'gemini-embedding-2',
                        contents: [searchText]
                    });

                    if (result && result.embeddings && result.embeddings.length > 0) {
                        embedding = result.embeddings[0].values;
                        break; // 成功したらループを抜ける
                    }
                } catch (err: any) {
                    if (err.status === 429 && retries < maxRetries - 1) {
                        const waitTime = Math.pow(2, retries) * 2000; // 2s, 4s, 8s...
                        console.warn(`  429エラー発生。${waitTime/1000}秒待機してリトライします (${retries + 1}/${maxRetries})`);
                        await new Promise(resolve => setTimeout(resolve, waitTime));
                        retries++;
                    } else {
                        throw err; // その他のエラー、またはリトライ上限
                    }
                }
            }

            if (embedding) {
                const { error: updateError } = await supabase
                    .from('address_book')
                    .update({ embedding })
                    .eq('id', addr.id)

                if (updateError) {
                    console.error(`  更新エラー (ID: ${addr.id}):`, updateError)
                }
            }

            // 次のデータ処理まで一律2秒待機（RPM制限対策）
            await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (err) {
            console.error(`  エラー発生 (ID: ${addr.id}):`, err)
        }
    }

    console.log('--- 全データのベクトル化が完了しました ---')
}

migrate().catch(console.error)
