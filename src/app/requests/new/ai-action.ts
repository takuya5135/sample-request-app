'use server'

import { GoogleGenAI } from '@google/genai';

// Gemini APIクライアントの初期化
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY });

export async function parseShippingRequest(input: string, addresses: any[], products: any[]) {
  try {
    // 日本時間での現在日付の取得
    const today = new Date();
    const jstDate = new Date(today.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
    const yyyy = jstDate.getFullYear();
    const mm = String(jstDate.getMonth() + 1).padStart(2, '0');
    const dd = String(jstDate.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    const prompt = `
あなたは有能なデータ入力アシスタントです。
現在のシステム日付は【${todayStr}】です。
ユーザーが入力した「サンプルの依頼内容（自然言語）」から必要な情報を抽出し、渡された【住所録データ】および【商品リストデータ】のレコードと正確にマッピング（紐付け）を行ってください。

【最も重要なミッション】
ユーザーは「既存の顧客」に対して送るケースがほとんどです。抽出した会社名や氏名ただテキストで返すだけでなく、**必ず以下の【住所録データ】の中から同一人物・同一会社と思われるIDを探し出し、\`address_id\` として返却してください。** 
「旭食品」と「あんばい株式会社（旭食品）」のような表記揺れや一部の一致であっても、担当者名が一致するなどの条件から積極的に紐づけてください。

【ユーザー入力】
${input}

【住所録データ (JSON) ※ここからIDを探してください】
${JSON.stringify(addresses.map(a => ({ id: a.id, company_name: a.company_name, department: a.department, last_name: a.last_name, first_name: a.first_name, phone: a.phone })))}

【商品リストデータ (JSON)】
${JSON.stringify(products.map(p => ({ id: p.id, md_code: p.md_code, product_name: p.product_name })))}

出力形式（JSON）:
{
  "address_id": "マッチした住所データのID（※最優先で探索し、どうしても見つからない完全新規の場合のみ null）",
  "company_name": "抽出された会社名（不明な場合は null）",
  "last_name": "抽出された姓（不明な場合は null）",
  "first_name": "抽出された名（不明な場合は null）",
  "phone": "抽出された電話番号（ハイフンあり。不明な場合は null）",
  "products": [
    {
      "product_id": "マッチした商品データのID",
      "quantity": 数量（数値で。不明な場合は1）
    }
  ],
  "delivery_date": "YYYY-MM-DD形式。ユーザーが日付（例：明後日、来週の水曜など）を指定している場合のみ、現在の日付（${todayStr}）から計算して出力してください。指定がない・不明な場合は必ず null を出力してください。",
  "delivery_time": "am" | "14-16" | "16-18" | "18-20" | "19-21" のいずれか（不明なら "am"）
}
※JSONブロックのみを出力し、マークダウンの装飾記号などは除外してください。
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    // @google/genai SDK v1.x では response.text が文字列プロパティとして提供されることが多いですが、
    // 万が一関数だった場合のエラーも防ぐため、明示的に文字列化して扱います。
    const resultText = typeof response.text === 'function' ? (response as any).text() : response.text;

    if (!resultText) {
      console.error("AIからの応答が空または不正な形式です:", response);
      throw new Error("AIからの応答が空です");
    }

    // jsonパース用の処理
    const jsonStr = resultText.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
      return JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("JSON Parse Error. Raw text:", resultText);
      throw new Error("AIからの応答データの形式が不正です。");
    }
  } catch (error: any) {
    console.error("AI Parse Error Detailed:", error);
    throw new Error(`入力の解析に失敗しました: ${error.message || '詳細にもう少し書いてみてください。'}`);
  }
}
