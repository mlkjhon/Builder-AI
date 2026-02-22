import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { ArrowLeft } from 'lucide-react';

export default function PlansPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="page-wrapper" style={{ background: 'var(--bg-primary)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />

            <main style={{ flex: 1, padding: '80px 0' }}>
                <section className="features-section" id="planos" style={{ borderTop: 'none', background: 'transparent' }}>
                    <div className="container" style={{ textAlign: 'center' }}>
                        {user && (
                            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 40, marginTop: -20 }}>
                                <button
                                    className="btn btn-ghost"
                                    onClick={() => navigate(-1)}
                                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                                >
                                    <ArrowLeft size={18} /> Voltar
                                </button>
                            </div>
                        )}
                        <div className="section-label" style={{ justifyContent: 'center' }}>Planos e Preços</div>
                        <h2 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16 }}>
                            Escolha o plano ideal para você
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 40, maxWidth: 600, margin: '0 auto 40px' }}>
                            Todos os planos oferecem acesso ao chat com IA. Escolha o seu.
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, maxWidth: 1000, margin: '0 auto' }}>
                            {/* Plano Iniciante */}
                            <div className="feature-card fade-in" style={{ textAlign: 'center' }}>
                                <div className="feature-title" style={{ fontSize: 22 }}>Iniciante</div>
                                <div style={{ fontSize: 38, fontWeight: 900, color: 'var(--text-primary)', margin: '12px 0' }}>Grátis</div>
                                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>Para explorar a plataforma</div>
                                <ul style={{ listStyle: 'none', marginBottom: 24, textAlign: 'left' }}>
                                    <li style={{ padding: '6px 0', color: 'var(--text-secondary)', fontSize: 14, borderBottom: '1px solid var(--border)' }}>✅ 10 conversas por mês</li>
                                    <li style={{ padding: '6px 0', color: 'var(--text-secondary)', fontSize: 14, borderBottom: '1px solid var(--border)' }}>✅ Chat com IA especialista</li>
                                    <li style={{ padding: '6px 0', color: 'var(--text-secondary)', fontSize: 14 }}>✅ Histórico de conversas</li>
                                </ul>
                                {user?.active_plan === 'free' ? (
                                    <button className="btn btn-secondary btn-full" disabled style={{ opacity: 0.8, cursor: 'default' }}>Ativo</button>
                                ) : (
                                    <button
                                        className="btn btn-secondary btn-full"
                                        onClick={() => user ? navigate('/chat') : navigate('/auth')}
                                    >
                                        {user ? 'Acessar Chat' : 'Criar conta grátis'}
                                    </button>
                                )}
                            </div>

                            {/* Plano Pro */}
                            <div className="feature-card fade-in delay-1" style={{ textAlign: 'center', borderColor: 'var(--accent)', boxShadow: 'var(--shadow-glow)', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, var(--accent), #6366f1)' }} />
                                <div className="badge badge-accent" style={{ marginBottom: 12 }}>Mais Popular</div>
                                <div className="feature-title" style={{ fontSize: 22 }}>Pro</div>
                                <div style={{ fontSize: 38, fontWeight: 900, color: 'var(--text-primary)', margin: '12px 0' }}>R$ 49<span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 400 }}>/mês</span></div>
                                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>Para criadores e freelancers</div>
                                <ul style={{ listStyle: 'none', marginBottom: 24, textAlign: 'left' }}>
                                    <li style={{ padding: '6px 0', color: 'var(--text-secondary)', fontSize: 14, borderBottom: '1px solid var(--border)' }}>✅ Conversas ilimitadas</li>
                                    <li style={{ padding: '6px 0', color: 'var(--text-secondary)', fontSize: 14, borderBottom: '1px solid var(--border)' }}>✅ Histórico infinito</li>
                                    <li style={{ padding: '6px 0', color: 'var(--text-secondary)', fontSize: 14, borderBottom: '1px solid var(--border)' }}>✅ Acesso antecipado a novidades</li>
                                    <li style={{ padding: '6px 0', color: 'var(--text-secondary)', fontSize: 14 }}>✅ Suporte prioritário</li>
                                </ul>
                                {user?.active_plan === 'pro' ? (
                                    <button className="btn btn-primary btn-full" disabled style={{ opacity: 0.9, cursor: 'default' }}>Ativo</button>
                                ) : (
                                    <button
                                        className="btn btn-primary btn-full"
                                        onClick={() => user ? navigate('/chat') : navigate('/auth?tab=register')}
                                    >
                                        {user ? 'Fazer upgrade' : 'Começar com Pro'}
                                    </button>
                                )}
                            </div>

                            {/* Plano Empresarial */}
                            <div className="feature-card fade-in delay-2" style={{ textAlign: 'center', borderColor: 'var(--accent-2)', boxShadow: '0 0 30px rgba(99, 102, 241, 0.15)' }}>
                                <div className="badge badge-purple" style={{ marginBottom: 12 }}>Novo</div>
                                <div className="feature-title" style={{ fontSize: 22 }}>Empresarial</div>
                                <div style={{ fontSize: 38, fontWeight: 900, color: 'var(--text-primary)', margin: '12px 0' }}>R$ 149<span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 400 }}>/mês</span></div>
                                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>Para equipes e agências</div>
                                <ul style={{ listStyle: 'none', marginBottom: 24, textAlign: 'left' }}>
                                    <li style={{ padding: '6px 0', color: 'var(--text-secondary)', fontSize: 14, borderBottom: '1px solid var(--border)' }}>✅ Tudo do plano Pro</li>
                                    <li style={{ padding: '6px 0', color: 'var(--text-secondary)', fontSize: 14, borderBottom: '1px solid var(--border)' }}>✅ Até 5 membros na equipe</li>
                                    <li style={{ padding: '6px 0', color: 'var(--text-secondary)', fontSize: 14, borderBottom: '1px solid var(--border)' }}>✅ Dashbord de análises</li>
                                    <li style={{ padding: '6px 0', color: 'var(--text-secondary)', fontSize: 14 }}>✅ SLA e suporte dedicado</li>
                                </ul>
                                {user?.active_plan === 'business' ? (
                                    <button className="btn btn-full" disabled style={{ background: 'linear-gradient(135deg, var(--accent-2), #7c3aed)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 12, fontWeight: 700, cursor: 'default', opacity: 0.9 }}>Ativo</button>
                                ) : (
                                    <button
                                        className="btn btn-full" style={{ background: 'linear-gradient(135deg, var(--accent-2), #7c3aed)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                                        onClick={() => user ? navigate('/chat') : navigate('/auth?tab=register')}
                                    >
                                        {user ? 'Falar com equipe' : 'Falar com equipe'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
