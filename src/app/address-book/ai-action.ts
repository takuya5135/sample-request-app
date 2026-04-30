'use server'

import { GoogleGenAI } from '@google/genai';

export async function parseAddressInfo(text?: string, imageBase64?: string, mimeType?: string) {
    try {
        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY;
        if (!apiKey) {
            console.error("Gemini API key is not set");
            return { success: false, error: "AI解析用のAPIキーが設定されていません。" };
        }

        const ai = new GoogleGenAI({ apiKey });

        const prompt = `
あなたは名刺やメール署名から連絡先情報を抽出するアシスタントです。
提供されたテキスト、または画像から以下の情報を抽出し、JSON形式で返してください。

抽出項目:
- company_name: 会社名 (必須。株式会社などは含める)
- department: 部署名 (なければ空文字)
- last_name: 姓 (必須)
- first_name: 名 (なければ空文字)
- postal_code: 郵便番号 (ハイフンあり。なければ空文字)
- address_: 住所 (都道府県から。なければ空文字)
- phone: 電話番号 (ハイフンあり。なければ空文字)
- email: メールアドレス (なければ空文字)

出力形式（JSON）:
{
  "company_name": "...",
  "department": "...",
  "last_name": "...",
  "first_name": "...",
  "postal_code": "...",
  "address_": "...",
  "phone": "...",
  "email": "..."
}
※JSONブロックのみを出力し、マークダウンの装飾記号などは除外してください。
`;

        const contents: any[] = [prompt];

        if (text) {
            contents.push(`\n【入力テキスト】\n${text}`);
        }

        if (imageBase64 && mimeType) {
            contents.push({
                inlineData: {
                    data: imageBase64,
                    mimeType: mimeType
                }
            });
        }

        const response = await ai.models.generateContent({
            model: 'gemini-flash-latest',
            contents: contents,
        });

        const resultText = typeof response.text === 'function' ? (response as any).text() : response.text;

        if (!resultText) {
            console.error("AIからの応答が空です:", response);
            return { success: false, error: "AIからの応答が空でした。" };
        }

        const jsonStr = resultText.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            const data = JSON.parse(jsonStr);
            return { success: true, data };
        } catch (parseError) {
            console.error("JSON Parse Error. Raw text:", resultText);
            return { success: false, error: "解析結果のデータ形式が不正です。" };
        }
    } catch (error: any) {
        console.error("AI Parse Error Detailed:", error);
        return { success: false, error: `解析中にエラーが発生しました: ${error.message || '不明なエラー'}` };
    }
}

