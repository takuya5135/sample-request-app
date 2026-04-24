import { GoogleGenAI } from '@google/genai';

/**
 * テキストからベクトル（Embedding）を生成する
 * Gemini 1.5 系列の text-embedding-004 モデルを使用 (768次元)
 */
export async function generateEmbedding(text: string): Promise<number[] | null> {
    try {
        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY;
        if (!apiKey) {
            console.error("Gemini API key is not set for embedding");
            return null;
        }

        const ai = new GoogleGenAI({ apiKey });
        
        let retries = 0;
        const maxRetries = 3;

        while (retries < maxRetries) {
            try {
                const result = await ai.models.embedContent({
                    model: 'text-embedding-004',
                    contents: [text],
                    config: { outputDimensionality: 3072 }
                });

                if (result && result.embeddings && result.embeddings.length > 0) {
                    return result.embeddings[0].values ?? null;
                }
                return null;
            } catch (error: any) {
                if (error.status === 429 && retries < maxRetries - 1) {
                    const waitTime = Math.pow(2, retries) * 2000;
                    console.warn(`Embedding API 429 limit hit. Retrying in ${waitTime}ms...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                    retries++;
                } else {
                    throw error;
                }
            }
        }
        return null;
    } catch (error) {
        console.error("Error generating embedding:", error);
        return null;
    }
}

/**
 * 住所録データから検索用の代表テキストを生成する
 */
export function getAddressSearchText(address: {
    company_name: string;
    last_name: string;
    first_name?: string;
    department?: string;
    address?: string;
}): string {
    const parts = [
        address.company_name,
        address.department,
        `${address.last_name || ''} ${address.first_name || ''}`.trim(),
        address.address
    ].filter(Boolean);

    return parts.join(' ');
}
