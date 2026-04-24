import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY;

async function fetchModelsDirectly() {
    if (!apiKey) {
        console.error("API key is missing");
        return;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        console.log("--- Google AI APIへ直接問い合わせ中... ---");
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error("APIエラー:", JSON.stringify(data.error, null, 2));
            return;
        }

        if (data.models && data.models.length > 0) {
            console.log(`合計 ${data.models.length} 個のモデルが見つかりました。\n`);
            
            const modelInfo = data.models.map((m: any) => ({
                id: m.name.split('/').pop(),
                supportedMethods: m.supportedMethods ? m.supportedMethods.join(', ') : 'none',
                description: m.description
            }));

            console.table(modelInfo);
            
            console.log("\n--- geminiを含む利用可能な全モデルID ---");
            const geminiModels = modelInfo.filter(m => m.id?.toLowerCase().includes('gemini'));
            geminiModels.forEach(m => console.log(` - ${m.id}`));

        } else {
            console.log("モデルリストが空です。");
        }
    } catch (error: any) {
        console.error("通信エラー:", error.message);
    }
}

fetchModelsDirectly();
