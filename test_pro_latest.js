require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModelsSDK() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    try {
        // The SDK doesn't have a direct listModels on genAI in all versions, 
        // but we can try to find it. 
        // Actually, in @google/generative-ai, it's often not there.
        // Let's try to use gemini-1.5-pro-latest
        console.log("Testing gemini-1.5-pro-latest...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
        const result = await model.generateContent("Hi");
        console.log("Response:", result.response.text());
    } catch (err) {
        console.error("Error:", err.message);
    }
}

listModelsSDK();
