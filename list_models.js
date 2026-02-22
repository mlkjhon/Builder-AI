require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listAllModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    try {
        // In @google/generative-ai, listing models is actually done differently.
        // However, we can try to use the fetch API to list models if the SDK doesn't expose it easily.
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Error listing models:", err.message);
    }
}

listAllModels();
