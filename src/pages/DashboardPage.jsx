import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api';
import { Sparkles, History, LayoutDashboard, Clock, FileText, ArrowRight, BrainCircuit, Activity, ArrowLeft } from 'lucide-react';

export default function DashboardPage() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const res = await api.get('/api/chat');
                setPlans(res.data); // Reusing 'plans' state for 'chats' for less refactor
            } catch (err) {
                console.error('Erro ao carregar histórico', err);
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, []);

    const handleCardClick = (chat) => {
        navigate('/chat', { state: { openChatId: chat.id } });
    };

    return (
        <div className="page-wrapper">
            <Navbar />

            <main className="dashboard-main">
                <div className="container">
                    <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 20 }}>
                        <button
                            className="btn btn-ghost"
                            onClick={() => navigate(-1)}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0' }}
                        >
                            <ArrowLeft size={18} /> Voltar
                        </button>
                    </div>
                    <div className="dashboard-header">
                        <div>
                            <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-primary)' }}>
                                <LayoutDashboard size={28} color="var(--accent)" /> Seu Histórico
                            </h1>
                            <p style={{ color: 'var(--text-secondary)' }}>Acesse e avalie todos os planos de negócio criados pela IA.</p>
                        </div>
                        <Link to="/chat" className="btn btn-primary">
                            <Sparkles size={16} /> Novo Chat
                        </Link>
                    </div>

                    {!loading && plans.length > 0 && (
                        <div className="stats-grid">
                            <div className="stat-card fade-in">
                                <div className="stat-icon" style={{ color: 'var(--accent)', background: 'var(--accent-glow)' }}><FileText size={20} /></div>
                                <div>
                                    <div className="stat-label">Total de Chats</div>
                                    <div className="stat-value">{plans.length} <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-muted)' }}>conversas</span></div>
                                </div>
                            </div>
                            <div className="stat-card fade-in delay-1">
                                <div className="stat-icon" style={{ color: 'var(--info)', background: 'rgba(59,130,246,0.1)' }}><Clock size={20} /></div>
                                <div>
                                    <div className="stat-label">Último Acesso</div>
                                    <div className="stat-value" style={{ fontSize: 18 }}>Hoje</div>
                                </div>
                            </div>
                            <div className="stat-card fade-in delay-2">
                                <div className="stat-icon" style={{ color: 'var(--success)', background: 'rgba(34,197,94,0.1)' }}><Activity size={20} /></div>
                                <div>
                                    <div className="stat-label">Status da Conta</div>
                                    <div className="stat-value" style={{ fontSize: 18, color: 'var(--success)' }}>Ativa PRO</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {loading ? (
                        <div className="loading-state">
                            <div className="loader-ring"></div>
                            <p style={{ marginTop: 16, color: 'var(--text-muted)' }}>Carregando histórico...</p>
                        </div>
                    ) : plans.length === 0 ? (
                        <div className="empty-state fade-in">
                            <div className="empty-icon-wrap" style={{ margin: '0 auto 24px', background: 'var(--bg-secondary)', width: 80, height: 80, borderRadius: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <BrainCircuit size={40} color="var(--text-muted)" />
                            </div>
                            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>Nenhuma conversa ainda</h2>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>
                                Você ainda não iniciou nenhum chat com a IA. Vamos criar um site hoje?
                            </p>
                            <Link to="/chat" className="btn btn-primary btn-lg">
                                <Sparkles size={18} /> Iniciar Chat
                            </Link>
                        </div>
                    ) : (
                        <div className="plans-grid">
                            {plans.map((p, i) => {
                                return (
                                    <div
                                        key={p.id}
                                        className={`plan-card fade-in delay-${(i % 5) + 1}`}
                                        onClick={() => handleCardClick(p)}
                                    >
                                        <div className="plan-card-header">
                                            <div className="plan-card-title">{p.title || 'Chat Sem Nome'}</div>
                                        </div>

                                        <div className="plan-card-footer">
                                            <div className="plan-card-date">
                                                <History size={12} /> {new Date(p.created_at).toLocaleDateString('pt-BR')}
                                            </div>
                                            <div className="plan-card-action">Ver Detalhes <ArrowRight size={14} /></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

            <style>{`
        .dashboard-main { padding: 40px 0 80px; flex: 1; }
        
        .dashboard-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 40px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 40px;
        }

        .stat-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-label { font-size: 13px; color: var(--text-muted); font-weight: 500; margin-bottom: 4px; }
        .stat-value { font-size: 24px; font-weight: 800; color: var(--text-primary); line-height: 1; }

        .loading-state {
          padding: 80px 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .empty-state {
          background: var(--bg-card);
          border: 1px dashed var(--border-hover);
          border-radius: var(--radius-lg);
          padding: 60px 20px;
          text-align: center;
        }

        .plans-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }

        .plan-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 24px;
          cursor: pointer;
          transition: var(--transition);
          display: flex;
          flex-direction: column;
        }

        .plan-card:hover {
          border-color: var(--accent);
          transform: translateY(-4px);
          box-shadow: var(--shadow-md), 0 0 0 1px var(--accent-glow);
        }

        .plan-card:hover .plan-card-action {
          color: var(--accent);
          transform: translateX(4px);
        }

        .plan-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 12px;
        }

        .plan-card-title {
          font-size: 18px;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1.3;
        }

        .plan-card-idea {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 24px;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          flex: 1;
        }

        .plan-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 16px;
          border-top: 1px solid var(--border);
        }

        .plan-card-date {
          font-size: 12px;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .plan-card-action {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 4px;
          transition: var(--transition);
        }

        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: 1fr; }
        }
      `}</style>
        </div>
    );
}
