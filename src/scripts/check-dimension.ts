import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY;

if (!apiKey) {
    console.error("API key is missing");
    process.exit(1);
}
const genAI = new GoogleGenAI({ apiKey: apiKey as string });

async function checkDimension() {
    const result = await genAI.models.embedContent({
        model: 'gemini-embedding-2',
        contents: ['test']
    });
    const embeddings = result?.embeddings;
    if (embeddings && embeddings.length > 0 && embeddings[0].values) {
        console.log(`Dimension: ${embeddings[0].values.length}`);
    } else {
        console.log("No embeddings found");
    }
}

checkDimension();
