import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import Navbar from '../components/Navbar';
import { ArrowRight, ArrowLeft, UserPlus, LogIn, Mail, Lock, User as UserIcon, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AuthPage() {
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const [tab, setTab] = useState(searchParams.get('tab') === 'register' ? 'register' : 'login');
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [show2FA, setShow2FA] = useState(false);
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [error, setError] = useState('');
    const { login, user } = useAuth();
    const navigate = useNavigate();
    const [pendingIdea] = useState(location.state?.idea);

    useEffect(() => {
        if (user) navigate('/chat', { replace: true });
    }, [user, navigate]);

    const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const endpoint = tab === 'login' ? '/api/auth/login' : '/api/auth/register';
            const payload = tab === 'login'
                ? { email: form.email, password: form.password }
                : { name: form.name, email: form.email, password: form.password };

            const res = await api.post(endpoint, payload);

            // Mock 2FA check: if user has 2FA enabled, stop and show 2FA input
            if (tab === 'login' && res.data.user.two_factor_enabled && !show2FA) {
                setShow2FA(true);
                setLoading(false);
                toast.success('Por favor, insira seu código 2FA');
                return;
            }

            // If show2FA is active, verify code (simulated check for '123456')
            if (show2FA) {
                if (twoFactorCode !== '123456') {
                    toast.error('Código 2FA inválido. (Dica: Use 123456)');
                    setLoading(false);
                    return;
                }
            }

            login(res.data.token, res.data.user);

            if (pendingIdea) {
                navigate('/chat', { state: { idea: pendingIdea } });
            } else {
                navigate('/chat');
            }
        } catch (err) {
            toast.error(err.response?.data?.error || 'Algo deu errado. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-wrapper">
            <Navbar />
            <div className="auth-bg">
                <button
                    onClick={() => navigate('/')}
                    className="btn btn-ghost"
                    style={{ position: 'absolute', top: 84, left: 24, zIndex: 10, display: 'flex', alignItems: 'center', gap: 8 }}
                >
                    <ArrowLeft size={18} /> Voltar
                </button>
                <div className="hero-orb hero-orb-1" style={{ opacity: 0.5 }}></div>
                <div className="hero-orb hero-orb-2" style={{ opacity: 0.5 }}></div>

                <div className="auth-card fade-in">
                    <div style={{ textAlign: 'center', marginBottom: 32 }}>
                        <div style={{ display: 'inline-flex', background: 'var(--bg-secondary)', padding: 16, borderRadius: 20, marginBottom: 16, color: 'var(--accent)' }}>
                            {tab === 'login' ? <LogIn size={32} /> : <UserPlus size={32} />}
                        </div>
                        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6, color: 'var(--text-primary)' }}>
                            {tab === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                            {tab === 'login'
                                ? 'Entre para acessar seus planos de negócio'
                                : 'Comece a gerar planos de negócio com IA'}
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="auth-tabs">
                        <button
                            className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
                            onClick={() => { setTab('login'); setError(''); }}
                        >
                            Entrar
                        </button>
                        <button
                            className={`auth-tab ${tab === 'register' ? 'active' : ''}`}
                            onClick={() => { setTab('register'); setError(''); }}
                        >
                            Cadastrar
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {tab === 'register' && (
                            <div className="form-group">
                                <label className="form-label">Seu nome</label>
                                <div style={{ position: 'relative' }}>
                                    <UserIcon size={18} className="input-icon" />
                                    <input
                                        className="form-input has-icon"
                                        name="name"
                                        type="text"
                                        placeholder="João Silva"
                                        value={form.name}
                                        onChange={handleChange}
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} className="input-icon" />
                                <input
                                    className="form-input has-icon"
                                    name="email"
                                    type="email"
                                    placeholder="joao@exemplo.com"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Senha</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} className="input-icon" />
                                <input
                                    className="form-input has-icon"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder={tab === 'register' ? 'Mínimo 6 caracteres' : '••••••••'}
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                    minLength={6}
                                    style={{ paddingRight: 40 }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {show2FA && (
                            <div className="form-group fade-in" style={{ marginTop: 16, padding: 16, background: 'var(--bg-secondary)', borderRadius: 16, border: '1px solid var(--accent)' }}>
                                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <ShieldCheck size={16} className="text-accent" /> Código de Autenticação (2FA)
                                </label>
                                <input
                                    className="form-input"
                                    type="text"
                                    placeholder="123456"
                                    value={twoFactorCode}
                                    onChange={e => setTwoFactorCode(e.target.value)}
                                    maxLength={6}
                                    required
                                    style={{ textAlign: 'center', fontSize: 20, letterSpacing: 8, fontWeight: 800 }}
                                />
                                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, textAlign: 'center' }}>
                                    Insira o código gerado pelo seu app de autenticação.
                                </p>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary btn-full btn-lg"
                            style={{ marginTop: 8 }}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div className="loader-ring" style={{ width: 18, height: 18, borderWidth: 2 }}></div>
                                    {tab === 'login' ? 'Entrando...' : 'Criando conta...'}
                                </>
                            ) : (
                                tab === 'login' ? <><LogIn size={18} /> Entrar <ArrowRight size={18} /></> : <><UserPlus size={18} /> Criar conta grátis <ArrowRight size={18} /></>
                            )}
                        </button>
                    </form>

                    <div className="divider-text" style={{ marginTop: 24 }}>
                        {tab === 'login' ? 'Não tem conta?' : 'Já tem conta?'}
                    </div>

                    <button
                        className="btn btn-secondary btn-full"
                        onClick={() => { setTab(tab === 'login' ? 'register' : 'login'); setError(''); }}
                    >
                        {tab === 'login' ? 'Criar conta grátis' : 'Fazer login'}
                    </button>
                </div>
            </div>

            <style>{`
        .auth-bg {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 16px;
          position: relative;
          overflow: hidden;
          background: var(--bg-primary);
        }

        .hero-orb { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; }
        .hero-orb-1 { width: 400px; height: 400px; background: rgba(0,198,167,0.08); top: -100px; left: -100px; }
        .hero-orb-2 { width: 300px; height: 300px; background: rgba(99,102,241,0.08); bottom: -80px; right: -80px; }

        .auth-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 40px;
          width: 100%;
          max-width: 440px;
          position: relative;
          z-index: 1;
          box-shadow: var(--shadow-lg);
        }

        .auth-tabs {
          display: flex;
          background: var(--bg-secondary);
          border-radius: 12px;
          padding: 4px;
          margin-bottom: 28px;
        }

        .auth-tab {
          flex: 1;
          padding: 10px;
          border: none;
          border-radius: 8px;
          background: transparent;
          color: var(--text-muted);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: var(--transition);
        }

        .auth-tab.active {
          background: var(--bg-card);
          color: var(--text-primary);
          box-shadow: var(--shadow-sm);
        }

        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .form-input.has-icon {
          padding-left: 42px;
        }
      `}</style>
        </div>
    );
}
