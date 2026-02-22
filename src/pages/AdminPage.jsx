import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../api';
import { Users, Shield, ArrowLeft, RefreshCw, Trash2, Ban, PauseCircle, CheckCircle, UserX } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [usersList, setUsersList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/dashboard');
            return;
        }
        fetchUsers();
    }, [user, navigate]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/admin/users');
            setUsersList(res.data);
            setError('');
        } catch (err) {
            console.error(err);
            setError('Falha ao carregar usuários. Você tem permissão de Admin?');
        } finally {
            setLoading(false);
        }
    };

    const handlePlanChange = async (userId, newPlan) => {
        try {
            await api.patch(`/api/admin/users/${userId}/plan`, { active_plan: newPlan });
            setUsersList(prev => prev.map(u => u.id === userId ? { ...u, active_plan: newPlan } : u));
            toast.success('Plano atualizado com sucesso!');
        } catch (err) {
            console.error(err);
            toast.error('Erro ao atualizar plano');
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await api.patch(`/api/admin/users/${userId}/role`, { role: newRole });
            setUsersList(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
            toast.success('Cargo atualizado com sucesso!');
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || 'Erro ao atualizar cargo');
        }
    };

    const handleStatusChange = async (userId, newStatus) => {
        try {
            await api.patch(`/api/admin/users/${userId}/status`, { status: newStatus });
            setUsersList(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
            toast.success(`Status atualizado para ${newStatus}!`);
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || 'Erro ao atualizar status');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('TEM CERTEZA? Esta ação é IRREVERSÍVEL e deletará todos os dados do usuário!')) return;

        try {
            await api.delete(`/api/admin/users/${userId}`);
            setUsersList(prev => prev.filter(u => u.id !== userId));
            toast.success('Usuário deletado com sucesso.');
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || 'Erro ao deletar usuário');
        }
    };

    if (!user || user.role !== 'admin') return null;

    return (
        <div className="page-wrapper min-h-screen">
            <Navbar />
            <div className="container" style={{ maxWidth: 900, marginTop: 40 }}>
                {/* Header with Back Button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
                    <button onClick={() => navigate('/dashboard')} className="btn btn-ghost" style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ArrowLeft size={18} /> Voltar
                    </button>
                    <div style={{ flex: 1 }}>
                        <h1 style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 28, margin: 0 }}>
                            <Shield className="text-accent" size={32} /> Painel Administrativo
                        </h1>
                        <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0', paddingLeft: 44 }}>
                            Gerencie usuários, visualize metas e atualize planos.
                        </p>
                    </div>
                    <button onClick={fetchUsers} className="btn btn-secondary" title="Recarregar">
                        <RefreshCw size={18} className={loading ? 'spin' : ''} />
                    </button>
                </div>

                {error && <div className="error-message" style={{ marginBottom: 20 }}>{error}</div>}

                <div className="card fade-in">
                    <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Users size={20} className="text-primary" />
                        <h2 style={{ fontSize: 18, margin: 0 }}>Usuários Cadastrados ({usersList.length})</h2>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                                    <th style={{ padding: 16, color: 'var(--text-muted)', fontWeight: 600, fontSize: 13 }}>ID</th>
                                    <th style={{ padding: 16, color: 'var(--text-muted)', fontWeight: 600, fontSize: 13 }}>Nome & Email</th>
                                    <th style={{ padding: 16, color: 'var(--text-muted)', fontWeight: 600, fontSize: 13 }}>Cargo</th>
                                    <th style={{ padding: 16, color: 'var(--text-muted)', fontWeight: 600, fontSize: 13 }}>Plano</th>
                                    <th style={{ padding: 16, color: 'var(--text-muted)', fontWeight: 600, fontSize: 13 }}>Status</th>
                                    <th style={{ padding: 16, color: 'var(--text-muted)', fontWeight: 600, fontSize: 13 }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>Carregando...</td></tr>
                                ) : usersList.map(u => (
                                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'var(--bg-secondary)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                                        <td data-label="ID" style={{ padding: 16, fontSize: 13, color: 'var(--text-muted)' }}>{u.id}</td>
                                        <td data-label="Nome & Email" style={{ padding: 16 }}>
                                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</div>
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.email}</div>
                                        </td>
                                        <td data-label="Cargo" style={{ padding: 16 }}>
                                            <select
                                                value={u.role || 'user'}
                                                onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                                style={{
                                                    background: u.role === 'admin' ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-card)',
                                                    color: u.role === 'admin' ? 'var(--danger)' : 'var(--text-secondary)',
                                                    border: '1px solid ' + (u.role === 'admin' ? 'var(--danger)' : 'var(--border)'),
                                                    padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700,
                                                    textTransform: 'uppercase', outline: 'none', cursor: 'pointer'
                                                }}
                                            >
                                                <option value="user">USER</option>
                                                <option value="admin">ADMIN (DEV)</option>
                                            </select>
                                        </td>
                                        <td data-label="Plano" style={{ padding: 16 }}>
                                            <select
                                                value={u.active_plan || 'free'}
                                                onChange={(e) => handlePlanChange(u.id, e.target.value)}
                                                style={{
                                                    background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                                                    border: '1px solid var(--border)', padding: '6px 12px',
                                                    borderRadius: 6, outline: 'none', cursor: 'pointer', fontSize: 13
                                                }}
                                            >
                                                <option value="free">Grátis</option>
                                                <option value="pro">Pro</option>
                                                <option value="business">Premium</option>
                                            </select>
                                        </td>
                                        <td data-label="Status" style={{ padding: 16 }}>
                                            <select
                                                value={u.status || 'active'}
                                                onChange={(e) => handleStatusChange(u.id, e.target.value)}
                                                style={{
                                                    background: u.status === 'active' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                    color: u.status === 'active' ? 'var(--success)' : 'var(--danger)',
                                                    border: '1px solid ' + (u.status === 'active' ? 'var(--success)' : 'var(--danger)'),
                                                    padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700,
                                                    textTransform: 'uppercase', outline: 'none', cursor: 'pointer'
                                                }}
                                            >
                                                <option value="active">ATIVO</option>
                                                <option value="suspended">SUSPENSO</option>
                                                <option value="blocked">BLOQUEADO</option>
                                                <option value="inactive">INATIVO</option>
                                            </select>
                                        </td>
                                        <td data-label="Ações" style={{ padding: 16 }}>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button
                                                    onClick={() => handleDeleteUser(u.id)}
                                                    className="btn btn-ghost"
                                                    style={{ color: 'var(--danger)', padding: '6px', minWidth: 'auto' }}
                                                    title="Deletar Usuário"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <style>{`
                    .spin { animation: spin 1s linear infinite; }
                    @keyframes spin { 100% { transform: rotate(360deg); } }

                    @media (max-width: 768px) {
                        .container { padding: 0 16px; margin-top: 20px !important; }
                        h1 { fontSize: 24px !important; }
                        p { paddingLeft: 0 !important; fontSize: 13px !important; }
                        
                        table thead { display: none; }
                        table, table tbody, table tr, table td { display: block; width: 100%; }
                        table tr { margin-bottom: 16px; border: 1px solid var(--border); border-radius: 12px; padding: 8px; background: var(--bg-card); }
                        table td { padding: 8px 12px !important; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-subtle); }
                        table td:last-child { border-bottom: none; }
                        table td::before {
                            content: attr(data-label);
                            font-weight: 700;
                            font-size: 11px;
                            text-transform: uppercase;
                            color: var(--text-muted);
                        }
                    }
                `}</style>
            </div>
        </div>
    );
}
