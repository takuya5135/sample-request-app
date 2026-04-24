import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY;

if (!apiKey) {
    console.error("API key is missing");
    process.exit(1);
}

const genAI = new GoogleGenAI({ apiKey });

async function checkAvailableModels() {
    try {
        console.log("--- 利用可能なモデル一覧を取得中... ---");
        const response = await genAI.models.list();
        
        if (response && response.models) {
            console.log(`合計 ${response.models.length} 個のモデルが見つかりました。\n`);
            
            // 表形式で見やすく表示
            const modelDetails = response.models.map((m: any) => ({
                name: m.name.replace('models/', ''),
                methods: m.supportedMethods.join(', '),
                displayName: m.displayName
            }));
            
            console.table(modelDetails);

            // 1.5系と2.0系の有無を特定
            const has15 = modelDetails.some(m => m.name.includes('1.5'));
            const has20 = modelDetails.some(m => m.name.includes('2.0'));
            
            console.log("\n--- 主要モデルの対応状況 ---");
            console.log(`Gemini 1.5 系列: ${has15 ? '✅ 利用可能' : '❌ 見つかりません'}`);
            console.log(`Gemini 2.0 系列: ${has20 ? '✅ 利用可能' : '❌ 見つかりません'}`);
        } else {
            console.log("モデルが見つかりませんでした。APIキーの設定や権限を確認してください。");
        }
    } catch (error: any) {
        console.error("エラーが発生しました:", error.message);
        if (error.message.includes("403")) {
            console.log("ヒント: APIキーに権限がないか、プロジェクトが制限されている可能性があります。");
        }
    }
}

checkAvailableModels();
