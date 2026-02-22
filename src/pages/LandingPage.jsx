import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ArrowRight, Building2, Users, Megaphone, Coins, PieChart, ShieldCheck, AlignLeft, X, ExternalLink, Briefcase } from 'lucide-react';

const WelcomeModal = ({ onClose }) => {
  return (
    <div className="modal-overlay fade-in" style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      backdropFilter: 'blur(24px)',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div className="modal-container scale-up" style={{
        maxWidth: '440px',
        width: '100%',
        padding: '48px 32px 32px',
        position: 'relative',
        background: 'var(--bg-card)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 50px 100px -20px rgba(0, 0, 0, 0.5), 0 30px 60px -30px rgba(0, 0, 0, 0.5)',
        borderRadius: '28px',
        textAlign: 'center'
      }}>
        <button
          className="modal-close-btn"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '24px',
            right: '24px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={e => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseOut={e => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <X size={20} title="Fechar" />
        </button>

        <div className="icon-badge" style={{
          margin: '0 auto 28px',
          background: 'linear-gradient(135deg, var(--accent), #6366f1)',
          width: 80,
          height: 80,
          borderRadius: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 20px 40px -10px rgba(0, 198, 167, 0.3)',
          transform: 'rotate(-5deg)'
        }}>
          <Briefcase size={40} color="white" />
        </div>

        <h2 style={{ fontSize: 32, fontFamily: 'Inter', fontWeight: 900, marginBottom: 16, color: 'var(--text-primary)', letterSpacing: '-1px', lineHeight: 1.1 }}>
          O Futuro das<br /><span className="hero-gradient">Suas Ideias</span>
        </h2>

        <p style={{ color: 'var(--text-secondary)', marginBottom: 40, lineHeight: 1.6, fontSize: 16, opacity: 0.9 }}>
          Este sistema foi desenvolvido por Jhonatan Moraes para automatizar a criação de negócios. Conheça meus projetos no portifolio.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <a
            href="https://meu-portifolio-eta-rose.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{
              width: '100%',
              justifyContent: 'center',
              gap: 12,
              padding: '18px',
              borderRadius: '16px',
              fontSize: '16px',
              fontWeight: 700,
              boxShadow: 'var(--shadow-glow)'
            }}
          >
            Ver Meu Portfólio <ExternalLink size={20} />
          </a>

          <button
            onClick={onClose}
            className="btn-ghost"
            style={{
              color: 'var(--text-muted)',
              fontSize: 14,
              cursor: 'pointer',
              fontWeight: 600,
              padding: '12px',
              transition: 'var(--transition)'
            }}
          >
            Entrar no Gerador
          </button>
        </div>
      </div>
    </div>
  );
};

const EXAMPLES = [
  'Quero abrir uma loja de carros esportivos',
  'App de delivery de comida saudável',
  'Plataforma de cursos online para artistas',
  'Serviço de lavanderia por assinatura',
  'Agência de marketing para pequenas empresas',
  'Cafeteria focada em nômades digitais',
  'Startup de energia solar para área rural',
  'E-commerce de moda sustentável',
];

export default function LandingPage() {
  const [idea, setIdea] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Show welcome modal once per session
    const shown = sessionStorage.getItem('welcome-shown');
    if (!shown) {
      setShowWelcome(true);
      sessionStorage.setItem('welcome-shown', 'true');
    }
  }, []);

  // If logged in, redirect to /chat
  useEffect(() => {
    if (user) {
      navigate('/chat', { replace: true });
    }
  }, [user, navigate]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!idea.trim() || idea.trim().length < 10) {
      setError('Por favor, descreva sua ideia com pelo menos 10 caracteres.');
      return;
    }

    if (!user) {
      navigate('/auth', { state: { idea } });
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Instead of relying on a dedicated endpoint, we just pass the idea to ChatPage
      // ChatPage handles the initial POST /api/chat if needed
      navigate('/chat', { state: { autoGenerate: idea } });
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao gerar plano. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} />}

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Hero */}
        <section className="hero-section" id="como-funciona">
          <div className="hero-bg-grid"></div>
          <div className="hero-orb hero-orb-1"></div>
          <div className="hero-orb hero-orb-2"></div>

          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <div className="hero-content fade-in">
              <div className="badge badge-accent" style={{ marginBottom: 24 }}>
                <Sparkles size={14} /> Powered by Gemini AI
              </div>

              <h1 className="hero-title">
                Da ideia ao <span className="hero-gradient">plano de negócio</span> em segundos
              </h1>

              <p className="hero-subtitle">
                Descreva sua ideia e nossa Inteligência Artificial gera um plano completo com análise de mercado,
                estratégia, financeiro e matriz SWOT. Agora com **interrupção de resposta** e **IA personalizada**.
              </p>

              {/* Input form */}
              <form onSubmit={handleGenerate} className="hero-form">
                <div className="hero-input-wrap">
                  <div className="hero-input-icon"><AlignLeft size={20} color="var(--accent)" /></div>
                  <textarea
                    className="hero-textarea"
                    placeholder="Ex: Quero abrir uma cafeteria especializada em cafés especiais e trabalho remoto com ambiente instagramável..."
                    value={idea}
                    onChange={e => setIdea(e.target.value)}
                    rows={3}
                    maxLength={500}
                    disabled={loading}
                  />
                  <div className="hero-input-footer">
                    <span className="char-count">{idea.length}/500 caracteres</span>
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg"
                      disabled={idea.trim().length < 3}
                    >
                      <>Começar Agora <Sparkles size={16} /></>
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="error-msg">⚠️ {error}</div>
                )}
              </form>

              {/* Marquee Examples */}
              <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Ou explore ideias:</span>
                <div className="marquee-container">
                  <div className="marquee-content">
                    {EXAMPLES.map((ex, i) => (
                      <button
                        key={i}
                        className="example-chip"
                        onClick={() => setIdea(ex)}
                        disabled={loading}
                        style={{ margin: '0 8px' }}
                      >
                        {ex}
                      </button>
                    ))}
                    {/* Duplicate for seamless infinite scrolling */}
                    {EXAMPLES.map((ex, i) => (
                      <button
                        key={'dup-' + i}
                        className="example-chip"
                        onClick={() => setIdea(ex)}
                        disabled={loading}
                        style={{ margin: '0 8px' }}
                      >
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features / Recursos */}
        <section className="features-section" id="recursos">
          <div className="container">
            <div className="section-label">O que você recebe</div>
            <div className="grid-3" style={{ gap: 16 }}>
              {[
                { icon: <Building2 />, title: 'Identidade e Propósito', desc: 'Nome criativo, slogan e diretrizes de marca que conectam com o cliente' },
                { icon: <Users />, title: 'Público-alvo', desc: 'Análise detalhada de quem são seus clientes e suas principais dores' },
                { icon: <Megaphone />, title: 'Marketing', desc: 'Estratégias e canais assertivos para alcançar seu mercado alvo no curto prazo' },
                { icon: <Coins />, title: 'Plano Financeiro', desc: 'Estimativa de investimento inicial, projeção de receita e break-even' },
                { icon: <PieChart />, title: 'Análise SWOT', desc: 'Mapeamento visual de Forças, Fraquezas, Oportunidades e Ameaças' },
                { icon: <ShieldCheck />, title: 'Modo Investidor', desc: 'Avaliação crítica com score de risco e viabilidade com foco em VC' },
              ].map((f, i) => (
                <div key={i} className={`feature-card fade-in delay-${i + 1}`}>
                  <div className="feature-icon" style={{ color: 'var(--accent)' }}>{f.icon}</div>
                  <div className="feature-title">{f.title}</div>
                  <div className="feature-desc">{f.desc}</div>
                </div>
              ))}
            </div>

            <div className="hero-cta-bottom">
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><ArrowRight size={14} /> PDF automático incluído</span>
              <span>·</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><ArrowRight size={14} /> Histórico blindado</span>
              <span>·</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><ArrowRight size={14} /> 100% seguro</span>
            </div>
          </div>
        </section>

        {/* Planos */}
        <section className="features-section" id="planos" style={{ borderTop: 'none', background: 'var(--bg-primary)' }}>
          <div className="container" style={{ textAlign: 'center' }}>
            <div className="section-label" style={{ justifyContent: 'center' }}>Planos e Preços</div>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16 }}>
              Comece grátis, assine quando quiser
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 40 }}>
              Todos os planos oferecem acesso ao chat com IA. Escolha o ideal para o seu momento.
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

        {/* Avaliações */}
        <section style={{ padding: '80px 0', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
          <div className="container">
            <div className="section-label" style={{ justifyContent: 'center', marginBottom: 40 }}>O que dizem nossos usuários</div>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', textAlign: 'center', marginBottom: 48 }}>Resultados reais de empreendedores reais</h2>
            <div className="grid-3" style={{ gap: 24 }}>
              <div className="feature-card fade-in" style={{ textAlign: 'left' }}>
                <div style={{ marginBottom: 16, color: '#f59e0b', fontSize: 18 }}>★★★★★</div>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 14, marginBottom: 20 }}>
                  "Em 5 minutos eu tinha a estrutura completa da minha landing page com sections, copy e até o prompt pra criar as imagens. Incrível!"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 22, background: 'linear-gradient(135deg, #059669, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 16 }}>L</div>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 14 }}>Lucas M.</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>Empreendedor de SaaS</div>
                  </div>
                </div>
              </div>
              <div className="feature-card fade-in delay-1" style={{ textAlign: 'left' }}>
                <div style={{ marginBottom: 16, color: '#f59e0b', fontSize: 18 }}>★★★★★</div>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 14, marginBottom: 20 }}>
                  "Usei pra criar o prompt do meu e-commerce de moda sustentável e economizei horas de trabalho. A IA entendeu exatamente o que eu precisava."
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 22, background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 16 }}>A</div>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 14 }}>Ana B.</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>Designer e empreendedora</div>
                  </div>
                </div>
              </div>
              <div className="feature-card fade-in delay-2" style={{ textAlign: 'left' }}>
                <div style={{ marginBottom: 16, color: '#f59e0b', fontSize: 18 }}>★★★★★</div>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 14, marginBottom: 20 }}>
                  "Minha agência usa todos os dias pra criar briefings de sites para clientes. O plano Empresarial valeu cada centavo. Recomendo!"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 22, background: 'linear-gradient(135deg, #f59e0b, #ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 16 }}>R</div>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 14 }}>Rafael C.</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>Diretor de agência digital</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <style>{`
        .hero-section {
          position: relative;
          overflow: hidden;
          padding: 80px 0 60px;
          min-height: 70vh;
          display: flex;
          align-items: center;
        }

        .hero-bg-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(0,198,167,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,198,167,0.04) 1px, transparent 1px);
          background-size: 50px 50px;
        }

        .hero-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          animation: pulse 4s ease-in-out infinite;
        }

        .hero-orb-1 {
          width: 400px; height: 400px;
          background: rgba(0, 198, 167, 0.08);
          top: -100px; left: -100px;
        }

        .hero-orb-2 {
          width: 300px; height: 300px;
          background: rgba(99, 102, 241, 0.08);
          bottom: -80px; right: -80px;
          animation-delay: 2s;
        }

        .hero-content { text-align: center; max-width: 760px; margin: 0 auto; }

        .hero-title {
          font-size: clamp(28px, 4.5vw, 46px);
          font-weight: 900;
          letter-spacing: -1.5px;
          line-height: 1.1;
          color: var(--text-primary);
          margin-bottom: 20px;
        }

        .hero-gradient {
          background: linear-gradient(135deg, var(--accent), #6366f1);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: clamp(15px, 2vw, 18px);
          color: var(--text-secondary);
          max-width: 580px;
          margin: 0 auto 40px;
          line-height: 1.7;
        }

        .hero-form { max-width: 680px; margin: 0 auto 32px; }

        .hero-input-wrap {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 20px;
          transition: var(--transition);
          box-shadow: var(--shadow-md);
        }

        .hero-input-wrap:focus-within {
          border-color: var(--accent);
          box-shadow: var(--shadow-lg), 0 0 0 3px rgba(0,198,167,0.1);
        }

        .hero-input-icon {
          margin-bottom: 10px;
        }

        .hero-textarea {
          width: 100%;
          background: transparent;
          border: none;
          outline: none;
          font-size: 16px;
          color: var(--text-primary);
          font-family: 'Inter', sans-serif;
          resize: none;
          line-height: 1.6;
        }

        .hero-textarea::placeholder { color: var(--text-muted); opacity: 0.8;}

        .hero-input-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1px solid var(--border);
        }

        .char-count { font-size: 12px; color: var(--text-muted); }

        .example-chip {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 999px;
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-secondary);
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: var(--transition);
          display: inline-flex;
          align-items: center;
          white-space: nowrap;
        }

        .example-chip:hover:not(:disabled) {
          background: var(--accent-glow);
          border-color: var(--accent);
          color: var(--accent);
          transform: translateY(-2px);
        }

        .features-section {
          background: var(--bg-secondary);
          border-top: 1px solid var(--border);
          padding: 60px 0;
        }

        .feature-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 24px;
          text-align: left;
          transition: var(--transition);
          opacity: 0;
          animation-fill-mode: forwards;
        }

        .feature-card:hover {
          border-color: var(--border-hover);
          transform: translateY(-4px);
          box-shadow: var(--shadow-glow);
        }

        .feature-icon { margin-bottom: 16px; padding: 12px; background: var(--bg-secondary); border-radius: 12px; display: inline-flex; }
        .feature-title { font-size: 16px; font-weight: 800; margin-bottom: 8px; color: var(--text-primary); }
        .feature-desc { font-size: 14px; color: var(--text-secondary); line-height: 1.6; }

        .hero-cta-bottom {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-top: 40px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}
