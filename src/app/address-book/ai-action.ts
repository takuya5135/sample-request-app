'use server'

import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY });

export async function parseAddressInfo(text?: string, imageBase64?: string, mimeType?: string) {
    try {
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
            model: 'gemini-2.0-flash',
            contents: contents,
        });

        // @google/genai SDK v1.x では response.text が文字列プロパティとして提供されることが多いですが、
        // 万が一関数だった場合のエラーも防ぐため、明示的に文字列化して扱います。
        const resultText = typeof response.text === 'function' ? (response as any).text() : response.text;

        if (!resultText) {
            console.error("AIからの応答が空または不正な形式です:", response);
            throw new Error("AIからの応答が空です");
        }

        const jsonStr = resultText.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            return JSON.parse(jsonStr);
        } catch (parseError) {
            console.error("JSON Parse Error. Raw text:", resultText);
            throw new Error("AIからの応答データの形式が不正です。");
        }
    } catch (error: any) {
        console.error("AI Parse Error Detailed:", error);
        throw new Error(`解析に失敗しました: ${error.message || '不明なエラー'}`);
    }
}
