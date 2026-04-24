import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY;
const genAI = new GoogleGenAI({ apiKey });

async function checkDimension() {
    const result = await genAI.models.embedContent({
        model: 'gemini-embedding-2',
        contents: ['test']
    });
    console.log(`Dimension: ${result.embeddings[0].values.length}`);
}

checkDimension();
