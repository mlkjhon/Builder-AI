require('dotenv').config();
const fs = require('fs');

async function listAllModelsToFile() {
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        fs.writeFileSync('available_models.json', JSON.stringify(data, null, 2));
        console.log("Models list saved to available_models.json");
    } catch (err) {
        console.error("Error listing models:", err.message);
    }
}

listAllModelsToFile();
