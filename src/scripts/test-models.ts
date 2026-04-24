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

async function listModels() {
    try {
        console.log("Listing available models...");
        const response = await genAI.models.list();
        if (response && response.models) {
            console.log("Available models:", response.models.map((m: any) => m.name));
        }
        
        const genModels = ['gemini-1.5-flash', 'gemini-2.0-flash'];
        for (const model of genModels) {
            try {
                const response = await genAI.models.generateContent({
                    model: model,
                    contents: [{ role: 'user', parts: [{ text: 'Hi' }] }]
                });
                console.log(`Model ${model} is WORKING`);
            } catch (e: any) {
                console.log(`Model ${model} FAILED: ${e.message}`);
            }
        }
        
        const embedModels = ['gemini-embedding-2', 'text-embedding-004'];
        for (const model of embedModels) {
            try {
                const result = await genAI.models.embedContent({
                    model: model,
                    contents: ['test']
                });
                console.log(`Model ${model} is WORKING`);
            } catch (e: any) {
                console.log(`Model ${model} FAILED: ${e.message}`);
            }
        }
    } catch (error) {
        console.error(error);
    }
}

listModels();
