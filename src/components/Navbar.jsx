import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Rocket, Moon, Sun, LogOut } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const initial = user?.name?.[0]?.toUpperCase() || '?';
    const isDev = user?.role === 'admin';

    return (
        <>
            <nav className="navbar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                    <Link to={user ? '/chat' : '/'} className="navbar-logo" style={{ fontSize: '20px', letterSpacing: '-0.5px' }}>
                        <div className="logo-icon" style={{ borderRadius: '8px', padding: '6px' }}>
                            <Rocket size={20} strokeWidth={2.5} />
                        </div>
                        <span style={{ fontWeight: 800 }}>Startup Builder</span>
                        <span style={{ color: 'var(--accent)', fontWeight: 900, marginLeft: 4 }}>AI</span>
                    </Link>

                    {/* Nav links — different depending on login state */}
                    <div className="nav-links" style={{ display: 'flex', gap: '24px', fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>
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
                </div>

                <div className="navbar-actions">
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
                                <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>{user.name}</span>
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
            <style>{`
                @media (max-width: 768px) {
                    .nav-links { display: none !important; }
                }
            `}</style>
        </>
    );
}
