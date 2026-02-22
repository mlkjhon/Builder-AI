import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Target, Users, Megaphone, Coins, Sparkles, Building2, CheckCircle2, AlertTriangle, ArrowRight, Download, Plus, LayoutDashboard, BrainCircuit, Activity, LineChart, TrendingUp, ShieldAlert, Crosshair } from 'lucide-react';
import toast from 'react-hot-toast';

function ScoreBar({ value, max = 10, color = 'var(--accent)' }) {
    return (
        <div style={{ background: 'var(--bg-secondary)', borderRadius: 999, height: 6, overflow: 'hidden' }}>
            <div style={{
                height: '100%',
                width: `${(value / max) * 100}%`,
                background: color,
                borderRadius: 999,
                transition: 'width 1s ease',
            }} />
        </div>
    );
}

const SWOT_CONFIG = [
    { key: 'strengths', label: 'Forças', icon: <TrendingUp size={16} />, color: 'var(--success)', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)' },
    { key: 'weaknesses', label: 'Fraquezas', icon: <Activity size={16} />, color: 'var(--warning)', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
    { key: 'opportunities', label: 'Oportunidades', icon: <LineChart size={16} />, color: 'var(--info)', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)' },
    { key: 'threats', label: 'Ameaças', icon: <ShieldAlert size={16} />, color: 'var(--danger)', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' },
];

export default function ResultPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const planData = location.state?.plan;
    const [pdfLoading, setPdfLoading] = useState(false);
    const [showInvestor, setShowInvestor] = useState(false);

    if (!planData) {
        return (
            <div className="page-wrapper">
                <Navbar />
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
                    <BrainCircuit size={48} color="var(--text-muted)" />
                    <p style={{ color: 'var(--text-secondary)' }}>Nenhum plano encontrado.</p>
                    <Link to="/" className="btn btn-primary"><Plus size={16} /> Gerar novo plano</Link>
                </div>
            </div>
        );
    }

    const { id, idea, result } = planData;
    const plan = result;

    const handleDownloadPDF = async () => {
        setPdfLoading(true);
        try {
            const res = await api.get(`/api/plans/${id}/pdf`, { responseType: 'blob' });
            const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
            const a = document.createElement('a');
            a.href = url;
            a.download = `${plan.companyName?.replace(/\s+/g, '-') || 'plano'}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            toast.error('Erro ao baixar PDF. Tente novamente.');
        } finally {
            setPdfLoading(false);
        }
    };

    const score = plan.investorScore;
    const scoreColor = score.overallScore >= 7 ? 'var(--success)' : score.overallScore >= 5 ? 'var(--warning)' : 'var(--danger)';
    const isDev = user?.role === 'admin';

    return (
        <div className="page-wrapper">
            <Navbar />

            <main style={{ flex: 1 }}>
                {/* Result Header */}
                <div className="result-header">
                    <div className="container">
                        <div className="result-header-content">
                            <div>
                                <div className="badge badge-accent" style={{ marginBottom: 10 }}>
                                    <Sparkles size={12} /> Plano gerado por IA
                                </div>
                                <h1 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 900, marginBottom: 6, color: 'var(--text-primary)' }}>
                                    {plan.companyName}
                                </h1>
                                <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>"{plan.slogan}"</p>
                                <div className="idea-badge"><Sparkles size={12} style={{ marginRight: 4 }} /> {idea}</div>
                            </div>
                            <div className="result-header-actions">
                                <button
                                    className="btn btn-secondary"
                                    onClick={handleDownloadPDF}
                                    disabled={pdfLoading}
                                >
                                    {pdfLoading ? (
                                        <><div className="loader-ring" style={{ width: 16, height: 16, borderWidth: 2 }}></div> Gerando PDF...</>
                                    ) : (
                                        <><Download size={16} /> Baixar PDF</>
                                    )}
                                </button>
                                <button
                                    className={`btn ${showInvestor ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => setShowInvestor(v => !v)}
                                >
                                    <Building2 size={16} /> Modo Investidor
                                </button>
                                <Link to="/" className="btn btn-ghost"><Plus size={16} /> Nova ideia</Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container result-body">

                    {/* Investor Mode Panel */}
                    {showInvestor && (
                        <div className="investor-panel fade-in">
                            <div className="investor-panel-header">
                                <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Building2 size={20} /> Avaliação do Investidor
                                </h2>
                                <span className={`badge ${score.recommendation === 'INVESTIR' ? 'badge-success' : 'badge-warning'}`}>
                                    {score.recommendation === 'INVESTIR' ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />} {score.recommendation}
                                </span>
                            </div>

                            <div className="investor-score-main">
                                <div className="big-score" style={{ color: scoreColor }}>
                                    {score.overallScore}
                                    <span style={{ fontSize: 24, color: 'var(--text-muted)', fontWeight: 400 }}>/10</span>
                                </div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7, maxWidth: 500 }}>
                                    {score.evaluation}
                                </p>
                            </div>

                            <div className="investor-scores-grid">
                                {[
                                    { label: 'Potencial de Mercado', value: score.marketPotential, color: 'var(--success)' },
                                    { label: 'Viabilidade', value: score.feasibility, color: 'var(--info)' },
                                    { label: 'Escalabilidade', value: score.scalability, color: '#8b5cf6' },
                                    { label: 'Nível de Risco', value: score.risk, color: 'var(--danger)' },
                                ].map((s, i) => (
                                    <div key={i} className="investor-score-item">
                                        <div className="investor-score-top">
                                            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.label}</span>
                                            <span style={{ fontWeight: 700, color: s.color }}>{s.value}/10</span>
                                        </div>
                                        <ScoreBar value={s.value} color={s.color} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Grid de Cards */}
                    <div className="result-grid">

                        {/* Público-alvo */}
                        <div className="result-card fade-in delay-1">
                            <div className="result-card-label"><Users size={14} /> Público-alvo</div>
                            <p className="result-card-main">{plan.targetAudience.description}</p>
                            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '8px 0 10px' }}>
                                {plan.targetAudience.demographics}
                            </p>
                            <div className="tags">
                                {plan.targetAudience.painPoints.map((p, i) => (
                                    <span key={i} className="tag" style={{ borderColor: 'var(--accent-glow)', color: 'var(--accent)' }}>
                                        <Target size={12} style={{ marginRight: 4 }} /> {p}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Marketing */}
                        <div className="result-card fade-in delay-2">
                            <div className="result-card-label"><Megaphone size={14} /> Estratégia de Marketing</div>
                            <p className="result-card-main">{plan.marketingStrategy.approach}</p>
                            <div className="tags" style={{ margin: '10px 0' }}>
                                {plan.marketingStrategy.channels.map((c, i) => (
                                    <span key={i} className="tag"><Crosshair size={12} style={{ marginRight: 4 }} /> {c}</span>
                                ))}
                            </div>
                            <div style={{ marginTop: 8 }}>
                                {plan.marketingStrategy.tactics.map((t, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '5px 0', fontSize: 13, color: 'var(--text-secondary)' }}>
                                        <ArrowRight size={14} color="var(--accent)" style={{ marginTop: 2, flexShrink: 0 }} /> {t}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Financeiro */}
                        <div className="result-card result-card-wide fade-in delay-3">
                            <div className="result-card-label"><Coins size={14} /> Plano Financeiro</div>
                            <div className="financial-grid">
                                <div className="financial-item">
                                    <div className="financial-label">Investimento Inicial</div>
                                    <div className="financial-value" style={{ color: 'var(--accent)' }}>{plan.financialPlan.initialInvestment}</div>
                                </div>
                                <div className="financial-item">
                                    <div className="financial-label">Receita Mensal (6 meses)</div>
                                    <div className="financial-value" style={{ color: 'var(--success)' }}>{plan.financialPlan.monthlyRevenue}</div>
                                </div>
                                <div className="financial-item">
                                    <div className="financial-label">Break-even</div>
                                    <div className="financial-value">{plan.financialPlan.breakEven}</div>
                                </div>
                                <div className="financial-item">
                                    <div className="financial-label">Fontes de Receita</div>
                                    <div className="tags" style={{ marginTop: 6 }}>
                                        {plan.financialPlan.revenueStreams.map((r, i) => (
                                            <span key={i} className="tag" style={{ color: 'var(--success)', borderColor: 'rgba(34,197,94,0.2)' }}>
                                                <Coins size={12} style={{ marginRight: 4 }} /> {r}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div style={{ marginTop: 16 }}>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Principais custos</div>
                                <div className="tags">
                                    {plan.financialPlan.mainCosts.map((c, i) => (
                                        <span key={i} className="tag" style={{ color: 'var(--warning)', borderColor: 'rgba(245,158,11,0.2)' }}>
                                            <AlertTriangle size={12} style={{ marginRight: 4 }} /> {c}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Diferencial Competitivo */}
                        <div className="result-card fade-in delay-4">
                            <div className="result-card-label"><Target size={14} /> Diferencial Competitivo</div>
                            <p className="result-card-main">{plan.competitiveDifferential.main}</p>
                            <div style={{ marginTop: 12 }}>
                                {plan.competitiveDifferential.points.map((p, i) => (
                                    <div key={i} style={{ display: 'flex', gap: 8, padding: '8px 0', fontSize: 13, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>
                                        <CheckCircle2 size={14} color="var(--accent)" style={{ marginTop: 2, flexShrink: 0 }} /> {p}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Próximos Passos */}
                        <div className="result-card fade-in delay-5">
                            <div className="result-card-label"><CheckCircle2 size={14} /> Próximos Passos</div>
                            <div>
                                {plan.nextSteps.map((step, i) => (
                                    <div key={i} className="step-row">
                                        <div className="step-num-badge">{i + 1}</div>
                                        <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{step}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* SWOT */}
                    <div style={{ marginTop: 24 }}>
                        <div className="section-label">Análise SWOT</div>
                        <div className="swot-grid">
                            {SWOT_CONFIG.map((conf) => (
                                <div
                                    key={conf.key}
                                    className="swot-card fade-in"
                                    style={{ background: conf.bg, borderColor: conf.border }}
                                >
                                    <div className="swot-card-title" style={{ color: conf.color }}>
                                        {conf.icon} {conf.label}
                                    </div>
                                    <ul className="swot-list">
                                        {plan.swot[conf.key].map((item, i) => (
                                            <li key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '4px 0', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                                                <span style={{ color: conf.color, marginTop: 2 }}>•</span>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* DEV MODE JSON DUMP */}
                    {isDev && (
                        <div className="dev-json fade-in delay-6">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: 'var(--danger)', fontWeight: 800 }}>
                                <AlertTriangle size={16} /> JSON BRUTO DA IA (DEV MODE)
                            </div>
                            {JSON.stringify(plan, null, 2)}
                        </div>
                    )}

                    {/* Bottom Actions */}
                    <div className="result-bottom-actions">
                        <Link to="/dashboard" className="btn btn-secondary">
                            <LayoutDashboard size={16} /> Ver histórico
                        </Link>
                        <button onClick={handleDownloadPDF} className="btn btn-primary" disabled={pdfLoading}>
                            {pdfLoading ? 'Gerando...' : <><Download size={16} /> Baixar PDF completo</>}
                        </button>
                        <Link to="/" className="btn btn-ghost">
                            <Plus size={16} /> Gerar nova ideia
                        </Link>
                    </div>

                </div>
            </main>

            <style>{`
        .result-header {
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border);
          padding: 32px 0;
        }

        .result-header-content {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
          flex-wrap: wrap;
        }

        .result-header-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          flex-shrink: 0;
        }

        .idea-badge {
          display: inline-flex;
          align-items: center;
          margin-top: 12px;
          background: var(--accent-glow);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 6px 12px;
          font-size: 13px;
          color: var(--text-secondary);
        }

        .result-body { padding: 32px 0 60px; }

        .investor-panel {
          background: var(--bg-card);
          border: 1px solid var(--border-hover);
          border-radius: 20px;
          padding: 28px;
          margin-bottom: 24px;
          box-shadow: var(--shadow-glow);
        }

        .investor-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .investor-panel-header h2 { font-size: 18px; font-weight: 700; color: var(--accent); }

        .investor-score-main {
          display: flex;
          align-items: center;
          gap: 28px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .big-score {
          font-size: 64px;
          font-weight: 900;
          line-height: 1;
          letter-spacing: -3px;
          white-space: nowrap;
        }

        .investor-scores-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        
        .investor-score-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }

        .result-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .result-card {
           background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 22px;
          transition: var(--transition);
          opacity: 0;
          animation-fill-mode: forwards;
        }

        .result-card:hover { border-color: var(--border-hover); box-shadow: var(--shadow-sm); }
        .result-card-wide { grid-column: span 2; }

        .result-card-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--text-muted);
          margin-bottom: 12px;
        }

        .result-card-main {
          font-size: 15px;
          color: var(--text-primary);
          font-weight: 500;
          line-height: 1.5;
        }

        .financial-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .financial-label { font-size: 11px; color: var(--text-muted); margin-bottom: 4px; font-weight: 600; }
        .financial-value { font-size: 16px; font-weight: 700; color: var(--text-primary); }

        .swot-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

        .swot-card {
          border: 1px solid;
          border-radius: var(--radius-lg);
          padding: 20px;
        }

        .swot-card-title {
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .swot-list { list-style: none; }

        .step-row {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 10px 0;
          border-bottom: 1px solid var(--border);
        }

        .step-row:last-child { border-bottom: none; }

        .step-num-badge {
          background: linear-gradient(135deg, var(--accent), var(--accent-dark));
          color: white;
          font-weight: 800;
          font-size: 12px;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .result-bottom-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid var(--border);
          flex-wrap: wrap;
        }

        @media (max-width: 768px) {
          .result-grid { grid-template-columns: 1fr; }
          .result-card-wide { grid-column: span 1; }
          .financial-grid { grid-template-columns: 1fr 1fr; }
          .swot-grid { grid-template-columns: 1fr 1fr; }
          .investor-scores-grid { grid-template-columns: 1fr 1fr; }
          .result-header-content { flex-direction: column; }
          .result-header-actions { width: 100%; }
        }

        @media (max-width: 480px) {
          .swot-grid { grid-template-columns: 1fr; }
          .financial-grid { grid-template-columns: 1fr; }
        }
      `}</style>
        </div>
    );
}
