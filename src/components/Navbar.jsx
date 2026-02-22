import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun, LogOut, Menu, X, Sparkles } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        setMobileOpen(false);
        navigate('/');
    };

    const initial = user?.name?.[0]?.toUpperCase() || '?';
    const isDev = user?.role === 'admin';

    return (
        <>
            <nav className="navbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', position: 'relative', zIndex: 1000 }}>
                <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    <Link to={user ? '/chat' : '/'} className="navbar-logo" style={{ fontSize: '20px', letterSpacing: '-1px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="logo-base" style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            width: 36,
                            height: 36,
                        }}>
                            <svg width="36" height="36" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0px 4px 8px rgba(0, 198, 167, 0.4))' }}>
                                {/* Base Hexagon/Cube Framework */}
                                <path d="M20 2L35.5885 11V29L20 38L4.41154 29V11L20 2Z" stroke="url(#paint0_linear)" strokeWidth="2.5" strokeLinejoin="round" />
                                {/* Inner connections */}
                                <path d="M20 2V20M35.5885 11L20 20M4.41154 11L20 20M20 38V20M35.5885 29L20 20M4.41154 29L20 20" stroke="url(#paint1_linear)" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
                                {/* Center Node */}
                                <circle cx="20" cy="20" r="4" fill="url(#paint2_linear)" />

                                <defs>
                                    <linearGradient id="paint0_linear" x1="4.41154" y1="2" x2="35.5885" y2="38" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#00c6a7" />
                                        <stop offset="1" stopColor="#6366f1" />
                                    </linearGradient>
                                    <linearGradient id="paint1_linear" x1="20" y1="2" x2="20" y2="38" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#00c6a7" stopOpacity="0.8" />
                                        <stop offset="1" stopColor="#6366f1" stopOpacity="0.8" />
                                    </linearGradient>
                                    <linearGradient id="paint2_linear" x1="16" y1="16" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#ffffff" />
                                        <stop offset="1" stopColor="#e2e8f0" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>Startup Builder</span>
                            <span style={{
                                fontWeight: 900,
                                marginLeft: 4,
                                background: 'linear-gradient(135deg, var(--accent) 0%, #4facfe 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}>AI</span>
                        </div>
                    </Link>
                </div>

                {/* Nav links — centralized */}
                <div className="nav-links" style={{ display: 'flex', gap: '24px', fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', flex: 1, justifyContent: 'center' }}>
                    {user ? (
                        <>
                            <Link to="/dashboard" style={{ textDecoration: 'none', color: 'inherit', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = 'var(--text-primary)'} onMouseOut={e => e.target.style.color = 'var(--text-secondary)'}>Histórico</Link>
                            <Link to="/plans" style={{ textDecoration: 'none', color: 'inherit', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = 'var(--text-primary)'} onMouseOut={e => e.target.style.color = 'var(--text-secondary)'}>Planos</Link>
                            <a href="/#recursos" style={{ textDecoration: 'none', color: 'inherit', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = 'var(--text-primary)'} onMouseOut={e => e.target.style.color = 'var(--text-secondary)'}>Recursos</a>
                            {isDev && (
                                <Link to="/admin" style={{
                                    textDecoration: 'none',
                                    color: 'var(--danger)',
                                    padding: '4px 10px',
                                    borderRadius: '8px',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                    transition: 'all 0.2s',
                                    fontWeight: 800,
                                    fontSize: '12px',
                                    textTransform: 'uppercase'
                                }} onMouseOver={e => e.target.style.background = 'rgba(239, 68, 68, 0.2)'} onMouseOut={e => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}>Painel Dev</Link>
                            )}
                        </>
                    ) : (
                        <>
                            <a href="/#como-funciona" style={{ textDecoration: 'none', color: 'inherit', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = 'var(--text-primary)'} onMouseOut={e => e.target.style.color = 'var(--text-secondary)'}>Como Funciona</a>
                            <a href="/#recursos" style={{ textDecoration: 'none', color: 'inherit', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = 'var(--text-primary)'} onMouseOut={e => e.target.style.color = 'var(--text-secondary)'}>Recursos</a>
                            <Link to="/plans" style={{ textDecoration: 'none', color: 'inherit', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = 'var(--text-primary)'} onMouseOut={e => e.target.style.color = 'var(--text-secondary)'}>Planos</Link>
                        </>
                    )}
                </div>

                <div className="navbar-actions" style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
                    {/* Mobile Toggle */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="btn btn-ghost btn-icon mobile-menu-toggle"
                        style={{ display: 'none' }}
                    >
                        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>

                    <button
                        onClick={toggleTheme}
                        className="btn btn-ghost btn-icon"
                        title="Alternar Tema"
                    >
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>

                    {user ? (
                        <>
                            {/* Clickable user profile button */}
                            <button
                                onClick={() => navigate('/profile')}
                                className="navbar-user"
                                style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: 8, padding: '4px 8px', borderRadius: 12, transition: 'background 0.2s', display: 'flex', alignItems: 'center', gap: 8 }}
                                onMouseOver={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                                onMouseOut={e => e.currentTarget.style.background = 'none'}
                                title="Ver perfil"
                            >
                                {user.avatar_url ? (
                                    <img src={user.avatar_url} alt={user.name} style={{ width: 32, height: 32, borderRadius: 16, objectFit: 'cover', border: '2px solid var(--accent)' }} />
                                ) : (
                                    <div className="navbar-avatar" style={{ width: 32, height: 32, fontSize: 13 }}>{initial}</div>
                                )}
                                <span className="hide-on-mobile" style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>{user.name}</span>
                            </button>
                            <button onClick={handleLogout} className="btn btn-secondary btn-sm" title="Sair">
                                <LogOut size={14} />
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/auth" className="btn btn-ghost btn-sm">Entrar</Link>
                            <Link to="/auth?tab=register" className="btn btn-primary btn-sm">Começar grátis</Link>
                        </>
                    )}
                </div>
            </nav>
            {/* Mobile Menu Overlay */}
            {mobileOpen && (
                <div className="mobile-nav-overlay fade-in" onClick={() => setMobileOpen(false)}>
                    <div className="mobile-nav-menu" onClick={e => e.stopPropagation()}>
                        <div className="mobile-nav-links">
                            {user ? (
                                <>
                                    <div style={{ marginBottom: 16, padding: '0 10px', display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div className="navbar-avatar" style={{ width: 40, height: 40, fontSize: 16 }}>{user?.name?.[0]?.toUpperCase()}</div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: 16 }}>{user.name}</div>
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{user.email}</div>
                                        </div>
                                    </div>
                                    <Link to="/chat" onClick={() => setMobileOpen(false)}>Chat</Link>
                                    <Link to="/dashboard" onClick={() => setMobileOpen(false)}>Histórico</Link>
                                    <Link to="/profile" onClick={() => setMobileOpen(false)}>Meu Perfil</Link>
                                    <Link to="/plans" onClick={() => setMobileOpen(false)}>Planos</Link>
                                    {isDev && (
                                        <Link to="/admin" onClick={() => setMobileOpen(false)} style={{ color: 'var(--danger)' }}>Painel Admin</Link>
                                    )}
                                    <div className="divider" style={{ margin: '10px 0' }}></div>
                                    <button onClick={handleLogout} className="btn btn-secondary btn-full" style={{ justifyContent: 'center' }}>
                                        <LogOut size={18} /> Sair
                                    </button>
                                </>
                            ) : (
                                <>
                                    <a href="/#como-funciona" onClick={() => setMobileOpen(false)}>Como Funciona</a>
                                    <a href="/#recursos" onClick={() => setMobileOpen(false)}>Recursos</a>
                                    <Link to="/plans" onClick={() => setMobileOpen(false)}>Planos</Link>
                                    <Link to="/auth" onClick={() => setMobileOpen(false)} className="btn btn-ghost">Entrar</Link>
                                    <Link to="/auth?tab=register" onClick={() => setMobileOpen(false)} className="btn btn-primary">Começar grátis</Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @media (max-width: 768px) {
                    .nav-links { display: none !important; }
                    .mobile-menu-toggle { display: flex !important; }
                }

                .mobile-nav-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.8);
                    backdrop-filter: blur(10px);
                    z-index: 999;
                    display: flex;
                    justify-content: flex-end;
                }

                .mobile-nav-menu {
                    width: 280px;
                    height: 100%;
                    background: var(--bg-card);
                    border-left: 1px solid var(--border);
                    padding: 80px 24px 40px;
                }

                .mobile-nav-links {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .mobile-nav-links a {
                    text-decoration: none;
                    color: var(--text-primary);
                    font-size: 18px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
            `}</style>
        </>
    );
}
