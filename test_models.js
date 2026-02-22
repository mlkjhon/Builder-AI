require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
    try {
        const modelList = await genAI.getGenerativeModel({ model: "gemini-1.5-pro" }); // This is just to test if we can even get the client
        // To list models, we use the listModels method from the genAI instance if available, 
        // but in newer versions it might be different. 
        // Actually, let's just try gemini-1.5-flash which is widely available.
        console.log("Testing gemini-flash-latest...");
        const flashModel = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const result = await flashModel.generateContent("Hello");
        console.log("Response from flash:", result.response.text());
    } catch (err) {
        console.error("Error:", err.message);
        if (err.response) {
            console.error("Status:", err.status);
        }
    }
}

listModels();
