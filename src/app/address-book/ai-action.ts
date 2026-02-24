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
- first_name: 名 (必須)
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
            model: 'gemini-2.5-flash',
            contents: contents,
        });

        const resultText = response.text;
        const jsonStr = resultText?.replace(/```json/g, '').replace(/```/g, '').trim();
        if (!jsonStr) throw new Error("AIからの応答が空です");

        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("AI Parse Error:", error);
        throw new Error('解析に失敗しました。画像が不鮮明かテキストが不足している可能性があります。');
    }
}
