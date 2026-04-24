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

    const BATCH_SIZE = 10;
    console.log(`${addresses.length} 件のデータを ${BATCH_SIZE} 件ずつのバッチで処理します...`)

    for (let i = 0; i < addresses.length; i += BATCH_SIZE) {
        const chunk = addresses.slice(i, i + BATCH_SIZE);
        
        try {
            console.log(`バッチ処理中: ${i + 1} 〜 ${Math.min(i + BATCH_SIZE, addresses.length)} 件目...`);
            
            const requests = chunk.map(addr => ({
                content: {
                    role: 'user',
                    parts: [{ text: [
                        addr.company_name,
                        addr.department,
                        `${addr.last_name || ''} ${addr.first_name || ''}`.trim(),
                        addr.address
                    ].filter(Boolean).join(' ') }]
                }
            }));

            // 型エラーを回避するために any キャストを使用
            const aiAny = ai as any;
            const modelInstance = aiAny.getGenerativeModel({ model: "text-embedding-004" });
            const result = await modelInstance.batchEmbedContents({ 
                requests,
                config: { outputDimensionality: 3072 }
            });

            if (result && result.embeddings) {
                for (let j = 0; j < chunk.length; j++) {
                    const embedding = result.embeddings[j].values;
                    const addr = chunk[j];

                    const { error: updateError } = await supabase
                        .from('address_book')
                        .update({ embedding })
                        .eq('id', addr.id);

                    if (updateError) {
                        console.error(`  更新エラー (ID: ${addr.id}):`, updateError);
                    }
                }
                console.log(`  -> ${chunk.length} 件の更新が完了しました。`);
            }

            // 次のバッチまで5秒待機（無料枠対策）
            await new Promise(resolve => setTimeout(resolve, 5000));

        } catch (err: any) {
            console.error(`バッチ処理エラー (Index: ${i}):`, err.message);
            
            // 429 Resource Exhausted の場合は大幅に待機してリトライ
            if (err.status === 429 || err.message?.includes('429')) {
                console.log("制限に達しました。30秒待機してこのバッチをやり直します...");
                await new Promise(resolve => setTimeout(resolve, 30000));
                i -= BATCH_SIZE; // ループの加算分を打ち消して同じインデックスから再開
            } else {
                console.error("予期せぬエラーが発生したため、このバッチをスキップします。");
            }
        }
    }

    console.log('--- 全データのベクトル化が完了しました ---')
}

migrate().catch(console.error)
