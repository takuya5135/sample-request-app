import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'
import { GoogleGenAI } from '@google/genai';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey)
const ai = new GoogleGenAI({ apiKey: geminiApiKey });

async function testSearch() {
    const query = "旭食品株式会社";
    console.log(`クエリ: "${query}" で検索中...`);

    const result = await ai.models.embedContent({
        model: 'gemini-embedding-2',
        contents: [query]
    });
    const embedding = result.embeddings[0].values;

    const { data, error } = await supabase.rpc('match_addresses', {
        query_embedding: embedding,
        match_threshold: 0.3,
        match_count: 3
    });

    if (error) {
        console.error('検索エラー:', error);
    } else {
        console.log('検索結果:');
        data?.forEach((r: any) => {
            console.log(`  - ${r.company_name} (${r.last_name} ${r.first_name}) [類似度: ${r.similarity.toFixed(4)}]`);
        });
    }
}

testSearch().catch(console.error)
