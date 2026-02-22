const puppeteer = require('puppeteer');

async function generatePDF(plan, idea) {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    const swotColors = {
        strengths: { bg: '#d4edda', border: '#28a745', title: '#155724' },
        weaknesses: { bg: '#f8d7da', border: '#dc3545', title: '#721c24' },
        opportunities: { bg: '#cce5ff', border: '#004085', title: '#004085' },
        threats: { bg: '#fff3cd', border: '#856404', title: '#856404' },
    };

    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', sans-serif; background: #f8fafc; color: #1e293b; }
  
  .header { background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%); color: white; padding: 40px; }
  .header h1 { font-size: 28px; font-weight: 800; }
  .header .subtitle { font-size: 14px; color: #94a3b8; margin-top: 6px; }
  .header .idea { background: rgba(255,255,255,0.1); border-radius: 8px; padding: 12px 16px; margin-top: 16px; font-size: 14px; color: #e2e8f0; }
  .header .badge { display: inline-block; background: #00c6a7; color: #0f172a; padding: 4px 12px; border-radius: 999px; font-size: 11px; font-weight: 700; margin-top: 12px; }
  
  .content { padding: 30px; }
  
  .company-card { background: white; border-radius: 16px; padding: 28px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); border-left: 5px solid #00c6a7; }
  .company-name { font-size: 32px; font-weight: 800; color: #0f172a; }
  .slogan { font-size: 16px; color: #64748b; margin-top: 6px; font-style: italic; }
  
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
  
  .card { background: white; border-radius: 16px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
  .card-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-bottom: 12px; display: flex; align-items: center; gap: 6px; }
  .card-title .icon { font-size: 16px; }
  .card-value { font-size: 15px; color: #1e293b; font-weight: 500; }
  
  .tag-list { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
  .tag { background: #f1f5f9; color: #475569; padding: 4px 10px; border-radius: 6px; font-size: 12px; }
  
  .swot-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
  .swot-card { border-radius: 12px; padding: 18px; border: 2px solid; }
  .swot-card h3 { font-size: 13px; font-weight: 700; text-transform: uppercase; margin-bottom: 10px; }
  .swot-card ul { list-style: none; }
  .swot-card ul li { font-size: 13px; padding: 3px 0; color: #374151; }
  .swot-card ul li::before { content: "• "; font-weight: bold; }
  
  .investor-card { background: linear-gradient(135deg, #0f172a, #1e3a5f); color: white; border-radius: 16px; padding: 28px; margin-bottom: 20px; }
  .investor-card h2 { font-size: 18px; font-weight: 700; margin-bottom: 16px; color: #00c6a7; }
  .score-main { font-size: 64px; font-weight: 800; color: #00c6a7; line-height: 1; }
  .score-label { font-size: 13px; color: #94a3b8; margin-top: 4px; }
  .scores-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 16px; }
  .score-item { text-align: center; background: rgba(255,255,255,0.08); border-radius: 10px; padding: 12px; }
  .score-item .val { font-size: 22px; font-weight: 700; color: #00c6a7; }
  .score-item .lbl { font-size: 10px; color: #94a3b8; margin-top: 2px; }
  .recommendation { display: inline-block; background: #00c6a7; color: #0f172a; font-weight: 800; padding: 8px 20px; border-radius: 999px; font-size: 14px; margin-top: 16px; }
  .evaluation { color: #cbd5e1; font-size: 13px; line-height: 1.6; margin-top: 12px; }
  
  .steps-card { background: white; border-radius: 16px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); margin-bottom: 20px; }
  .step-item { display: flex; align-items: flex-start; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
  .step-item:last-child { border-bottom: none; }
  .step-num { background: #00c6a7; color: #0f172a; font-weight: 800; font-size: 12px; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .step-text { font-size: 14px; color: #374151; padding-top: 3px; }
  
  .footer { text-align: center; padding: 20px; color: #94a3b8; font-size: 12px; }
</style>
</head>
<body>

<div class="header">
  <h1>🚀 Startup Builder AI</h1>
  <p class="subtitle">Gerador Inteligente de Modelo de Negócio</p>
  <div class="idea">💡 "${idea}"</div>
  <span class="badge">Plano gerado por IA</span>
</div>

<div class="content">
  
  <!-- Company -->
  <div class="company-card">
    <div class="company-name">${plan.companyName}</div>
    <div class="slogan">"${plan.slogan}"</div>
  </div>

  <!-- Target + Marketing -->
  <div class="grid-2">
    <div class="card">
      <div class="card-title"><span class="icon">👥</span> Público-alvo</div>
      <div class="card-value">${plan.targetAudience.description}</div>
      <div class="tag-list">${plan.targetAudience.painPoints.map(p => `<span class="tag">${p}</span>`).join('')}</div>
    </div>
    <div class="card">
      <div class="card-title"><span class="icon">📣</span> Estratégia de Marketing</div>
      <div class="card-value">${plan.marketingStrategy.approach}</div>
      <div class="tag-list">${plan.marketingStrategy.channels.map(c => `<span class="tag">${c}</span>`).join('')}</div>
    </div>
  </div>

  <!-- Financial -->
  <div class="card" style="margin-bottom:20px;">
    <div class="card-title"><span class="icon">💰</span> Plano Financeiro</div>
    <div class="grid-2" style="gap:12px;margin-top:8px;">
      <div>
        <div style="font-size:11px;color:#94a3b8;margin-bottom:2px;">Investimento Inicial</div>
        <div style="font-weight:600;color:#059669;">${plan.financialPlan.initialInvestment}</div>
      </div>
      <div>
        <div style="font-size:11px;color:#94a3b8;margin-bottom:2px;">Receita Mensal (6 meses)</div>
        <div style="font-weight:600;color:#059669;">${plan.financialPlan.monthlyRevenue}</div>
      </div>
      <div>
        <div style="font-size:11px;color:#94a3b8;margin-bottom:2px;">Break-even</div>
        <div style="font-weight:600;">${plan.financialPlan.breakEven}</div>
      </div>
      <div>
        <div style="font-size:11px;color:#94a3b8;margin-bottom:2px;">Fontes de Receita</div>
        <div class="tag-list">${plan.financialPlan.revenueStreams.map(r => `<span class="tag">${r}</span>`).join('')}</div>
      </div>
    </div>
  </div>

  <!-- Differential -->
  <div class="card" style="margin-bottom:20px;">
    <div class="card-title"><span class="icon">🎯</span> Diferencial Competitivo</div>
    <div class="card-value" style="margin-bottom:10px;">${plan.competitiveDifferential.main}</div>
    <div class="tag-list">${plan.competitiveDifferential.points.map(p => `<span class="tag">${p}</span>`).join('')}</div>
  </div>

  <!-- SWOT -->
  <div class="card-title" style="margin-bottom:12px;"><span class="icon">📊</span> Análise SWOT</div>
  <div class="swot-grid">
    ${Object.entries({
        strengths: { label: 'Forças 💪', ...swotColors.strengths },
        weaknesses: { label: 'Fraquezas ⚠️', ...swotColors.weaknesses },
        opportunities: { label: 'Oportunidades 🌱', ...swotColors.opportunities },
        threats: { label: 'Ameaças 🛡️', ...swotColors.threats },
    }).map(([key, conf]) => `
      <div class="swot-card" style="background:${conf.bg};border-color:${conf.border};">
        <h3 style="color:${conf.title};">${conf.label}</h3>
        <ul>${plan.swot[key].map(item => `<li>${item}</li>`).join('')}</ul>
      </div>
    `).join('')}
  </div>

  <!-- Investor -->
  <div class="investor-card">
    <h2>🏦 Modo Investidor</h2>
    <div style="display:flex;gap:32px;align-items:flex-end;">
      <div>
        <div class="score-main">${plan.investorScore.overallScore}</div>
        <div class="score-label">Score Geral / 10</div>
      </div>
      <div style="flex:1;">
        <div class="evaluation">${plan.investorScore.evaluation}</div>
        <span class="recommendation">✅ ${plan.investorScore.recommendation}</span>
      </div>
    </div>
    <div class="scores-grid">
      <div class="score-item"><div class="val">${plan.investorScore.marketPotential}</div><div class="lbl">Mercado</div></div>
      <div class="score-item"><div class="val">${plan.investorScore.feasibility}</div><div class="lbl">Viabilidade</div></div>
      <div class="score-item"><div class="val">${plan.investorScore.scalability}</div><div class="lbl">Escalabilidade</div></div>
      <div class="score-item"><div class="val">${plan.investorScore.risk}</div><div class="lbl">Risco</div></div>
    </div>
  </div>

  <!-- Next Steps -->
  <div class="steps-card">
    <div class="card-title" style="margin-bottom:8px;"><span class="icon">📋</span> Próximos Passos</div>
    ${plan.nextSteps.map((step, i) => `
      <div class="step-item">
        <div class="step-num">${i + 1}</div>
        <div class="step-text">${step}</div>
      </div>
    `).join('')}
  </div>

</div>

<div class="footer">
  Gerado por Startup Builder AI • ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
</div>

</body>
</html>
  `;

    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });

    await browser.close();
    return pdf;
}

module.exports = { generatePDF };
