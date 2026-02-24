'use server'

import { GoogleGenAI } from '@google/genai';

// Gemini APIクライアントの初期化
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY });

export async function parseShippingRequest(input: string, addresses: any[], products: any[]) {
  try {
    const prompt = `
あなたはサンプル発送の手配アシスタントです。
以下のユーザー入力、および登録済みの「住所録」「商品リスト」から、発送に必要な情報を抽出してJSON形式で返してください。

【ユーザー入力】
${input}

【住所録データ (JSON)】
${JSON.stringify(addresses.map(a => ({ id: a.id, company_name: a.company_name, contact_name: a.contact_name })))}

【商品リストデータ (JSON)】
${JSON.stringify(products.map(p => ({ id: p.id, md_code: p.md_code, product_name: p.product_name })))}

出力形式（JSON）:
{
  "address_id": "マッチした住所データのID（不明な場合は null）",
  "company_name": "抽出された会社名（不明な場合は null）",
  "contact_name": "抽出された担当者名（不明な場合は null）",
  "products": [
    {
      "product_id": "マッチした商品データのID",
      "quantity": 数量（数値で。不明な場合は1）
    }
  ],
  "delivery_date": "YYYY-MM-DD形式。例：明後日なら現在日から計算",
  "delivery_time": "am" | "14-16" | "16-18" | "18-20" | "19-21" のいずれか（不明なら "am"）
}
※JSONブロックのみを出力し、マークダウンの装飾記号などは除外してください。
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text;
    // jsonパース用の処理
    const jsonStr = text?.replace(/```json/g, '').replace(/```/g, '').trim();
    if (!jsonStr) throw new Error("AIからの応答が空です");

    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("AI Parse Error:", error);
    throw new Error('入力の解析に失敗しました。詳細にもう少し書いてみてください。');
  }
}
