const fs = require('fs');
const data = JSON.parse(fs.readFileSync('available_models.json', 'utf8'));
const stableModels = data.models.filter(m => !m.thinking && m.supportedGenerationMethods.includes('generateContent'));
console.log(JSON.stringify(stableModels.map(m => m.name), null, 2));
