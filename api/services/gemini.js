const { GoogleGenerativeAI } = require('@google/generative-ai');

if (!process.env.GEMINI_API_KEY) {
  console.error('CRITICAL: GEMINI_API_KEY is not defined in .env');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const buildSystemInstruction = (user = null) => {
  return `
Você é o "Mestre de Obras Digital", um desenvolvedor sênior de sites e estrategista de startups de elite.
Sua função é atuar como um parceiro técnico altamente colaborativo na criação de negócios digitais.

DIRETRIZ DE IDENTIDADE CRÍTICA:
- Nome do Usuário: ${user?.name || 'Visitante'}
- PREFERÊNCIAS DO USUÁRIO (Favor seguir rigorosamente): "${user?.preferences || 'Nenhuma preferência definida.'}"

Você deve adaptar TODO o seu comportamento, tom de voz e escolhas técnicas com base nestas preferências.

Diretrizes de Personalidade:
1. **Comunicação ChatGPT:** Seja direto, proativo e evite enrolação. 
2. **Mentoria Técnica:** Explique linguagens (JS, Python, Java) de forma clara.
3. **Engenharia de Prompts:** Gere prompts prontos para Midjourney ou Cursor.

Sempre inicie cumprimentando o usuário pelo nome.
`;
};


const getChatSession = (history = [], userPreferences = {}) => {
  const customInstruction = buildSystemInstruction(userPreferences);

  // History array shape expected from db: { role: 'user' | 'model', content: '...' }
  const formattedHistory = history.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : msg.role,
    parts: [{ text: msg.content }]
  }));

  const model = genAI.getGenerativeModel({
    model: "gemini-flash-latest",
    systemInstruction: customInstruction
  });

  return model.startChat({
    history: formattedHistory,
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
    },
  });
};

const sendChatMessage = async (chatSession, message, imageData = null) => {
  try {
    let payload = message;
    if (imageData && imageData.base64 && imageData.mimeType) {
      payload = [
        message,
        { inlineData: { data: imageData.base64, mimeType: imageData.mimeType } }
      ];
    }
    const result = await chatSession.sendMessage(payload);
    return result.response.text();
  } catch (error) {
    console.error('Gemini Chat Error:', error);
    // Handle rate limiting (429) specifically with a friendly message
    if (error.status === 429) {
      throw new Error('Ops! Nossa cota de inteligência atingiu o limite por agora. 🚀 Estamos trabalhando para expandir isso em breve! Tente novamente em alguns minutos ou faça um upgrade para continuar sem interrupções.');
    }
    // Handle API key issues
    if (error.status === 400 || error.status === 401 || error.status === 403) {
      throw new Error('Erro de autenticação com a IA. Verifique a chave de API.');
    }
    throw new Error('Falha ao comunicar com a IA. Tente novamente em instantes.');
  }
};

const generateBusinessPlan = async (idea) => {
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
  const prompt = `
      Atue como um Especialista em Novos Negócios e Arquiteto de Software.
      Analise a seguinte ideia de startup e gere um plano de negócios simplificado e objetivo:
      
      Ideia: "${idea}"
      
      Retorne APENAS um objeto JSON válido (sem marcação Markdown ou bloco \`\`\`json) com a seguinte estrutura estrita:
      {
        "companyName": "Nome sugerido criativo",
        "elevatorPitch": "Resumo de 1 frase",
        "targetAudience": ["Público 1", "Público 2"],
        "coreFeatures": ["Feature 1", "Feature 2", "Feature 3"],
        "monetization": ["Estratégia 1", "Estratégia 2"],
        "techStack": ["Tecnologia 1", "Tecnologia 2", "Tecnologia 3"]
      }
    `;

  try {
    const result = await model.generateContent(prompt);
    let textResult = result.response.text().trim();
    if (textResult.startsWith('```json')) {
      textResult = textResult.replace(/```json/g, '').replace(/```/g, '').trim();
    }
    return JSON.parse(textResult);
  } catch (error) {
    console.error('Plan Generation Error:', error);
    throw error;
  }
};

module.exports = {
  getChatSession,
  sendChatMessage,
  generateBusinessPlan
};
