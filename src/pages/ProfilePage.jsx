import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Camera, Save, CheckCircle, Crown, Zap, Star, ArrowRight, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const PLAN_INFO = {
    free: { label: 'Iniciante (Grátis)', color: '#6b7280', icon: Star },
    pro: { label: 'Pro — R$49/mês', color: '#059669', icon: Zap },
    business: { label: 'Empresarial — R$149/mês', color: '#6366f1', icon: Crown },
};

export default function ProfilePage() {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [saving, setSaving] = useState(false);
    const [name, setName] = useState(user?.name || '');
    const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url || null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [profileData, setProfileData] = useState(null);
    const [twoFactor, setTwoFactor] = useState(user?.two_factor_enabled || false);
    const [tfaLoading, setTfaLoading] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/api/auth/me');
                setProfileData(res.data);
                setName(res.data.name);
                setAvatarPreview(res.data.avatar_url || null);
                setTwoFactor(res.data.two_factor_enabled || false);
            } catch (err) {
                console.error(err);
            }
        };
        fetchProfile();
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setAvatarFile(file);
        const reader = new FileReader();
        reader.onload = (ev) => setAvatarPreview(ev.target.result);
        reader.readAsDataURL(file);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('name', name);
            if (avatarFile) formData.append('avatar', avatarFile);

            const res = await api.put('/api/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Update the auth context with new user data
            const token = localStorage.getItem('token');
            login(token, { ...user, name: res.data.name, avatar_url: res.data.avatar_url });
            setProfileData(res.data);
            toast.success('Perfil salvo com sucesso!');
        } catch (err) {
            console.error(err);
            toast.error('Erro ao salvar o perfil. Tente novamente.');
        } finally {
            setSaving(false);
        }
    };

    const handleToggle2FA = async () => {
        setTfaLoading(true);
        try {
            const newState = !twoFactor;
            await api.patch('/api/profile/2fa', { enabled: newState });

            // Update auth context
            const token = localStorage.getItem('token');
            login(token, { ...user, two_factor_enabled: newState });

            setTwoFactor(newState);
            toast.success(newState ? '2FA ativado com sucesso!' : '2FA desativado.');
        } catch (err) {
            console.error(err);
            toast.error('Erro ao atualizar 2FA.');
        } finally {
            setTfaLoading(false);
        }
    };

    const plan = profileData?.active_plan || 'free';
    const planConfig = PLAN_INFO[plan] || PLAN_INFO.free;
    const PlanIcon = planConfig.icon;
    const initial = name?.[0]?.toUpperCase() || '?';
    const memberSince = profileData?.created_at
        ? new Date(profileData.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
        : '';

    return (
        <div className="page-wrapper">
            <Navbar />
            <div style={{ minHeight: 'calc(100vh - 65px)', background: 'var(--bg-primary)', padding: '48px 0' }}>
                <div className="container" style={{ maxWidth: 760 }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 20 }}>
                        <button
                            className="btn btn-ghost"
                            onClick={() => navigate(-1)}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0' }}
                        >
                            <ArrowLeft size={18} /> Voltar
                        </button>
                    </div>
                    <div style={{ marginBottom: 40 }}>
                        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Meu Perfil</h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Gerencie suas informações e preferências</p>
                    </div>

                    <div className="grid-2" style={{ gap: 24 }}>
                        {/* Avatar section */}
                        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: 32 }}>
                            <div
                                style={{ position: 'relative', cursor: 'pointer' }}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {avatarPreview ? (
                                    <img
                                        src={avatarPreview}
                                        alt="Avatar"
                                        style={{ width: 120, height: 120, borderRadius: 60, objectFit: 'cover', border: '3px solid var(--accent)', boxShadow: '0 0 0 6px var(--accent-glow)' }}
                                    />
                                ) : (
                                    <div style={{ width: 120, height: 120, borderRadius: 60, background: 'linear-gradient(135deg, var(--accent), #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, fontWeight: 900, color: 'white', boxShadow: '0 0 0 6px var(--accent-glow)' }}>
                                        {initial}
                                    </div>
                                )}
                                <div style={{ position: 'absolute', bottom: 4, right: 4, background: 'var(--accent)', borderRadius: 20, padding: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                                    <Camera size={14} color="white" />
                                </div>
                            </div>
                            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 18, marginBottom: 4 }}>{name}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>Membro desde {memberSince}</div>
                            </div>
                            <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => fileInputRef.current?.click()}
                                style={{ width: '100%' }}
                            >
                                <Camera size={14} /> Alterar foto
                            </button>
                        </div>

                        {/* Info + Plan */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {/* Info card */}
                            <div className="card">
                                <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Informações</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <div>
                                        <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 6 }}>Nome</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-secondary)', borderRadius: 10, padding: '10px 14px', border: '1.5px solid var(--border)' }}>
                                            <User size={14} color="var(--text-muted)" />
                                            <input
                                                value={name}
                                                onChange={e => setName(e.target.value)}
                                                style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: 14, width: '100%', fontFamily: 'Inter, sans-serif' }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 6 }}>Email</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-secondary)', borderRadius: 10, padding: '10px 14px', border: '1.5px solid var(--border)', opacity: 0.7 }}>
                                            <Mail size={14} color="var(--text-muted)" />
                                            <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{profileData?.email}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 6 }}>Cargo</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-secondary)', borderRadius: 10, padding: '10px 14px', border: '1.5px solid var(--border)', opacity: 0.7 }}>
                                            <Shield size={14} color="var(--text-muted)" />
                                            <span style={{ color: 'var(--text-secondary)', fontSize: 14, textTransform: 'capitalize' }}>{profileData?.role}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Plan card */}
                            <div className="card" style={{ borderColor: planConfig.color, boxShadow: `0 0 20px ${planConfig.color}20` }}>
                                <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Plano Atual</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                                    <div style={{ background: `${planConfig.color}20`, borderRadius: 10, padding: 10, display: 'flex' }}>
                                        <PlanIcon size={20} color={planConfig.color} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: 15 }}>{planConfig.label}</div>
                                        <div style={{ fontSize: 12, color: planConfig.color, fontWeight: 600, marginTop: 2 }}>✓ Ativo</div>
                                    </div>
                                </div>
                                {plan === 'free' && (
                                    <button
                                        className="btn btn-primary btn-full btn-sm"
                                        onClick={() => navigate('/plans')}
                                        style={{ fontSize: 13 }}
                                    >
                                        Fazer upgrade <ArrowRight size={13} />
                                    </button>
                                )}
                            </div>

                            {/* Security card */}
                            <div className="card">
                                <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Segurança</h3>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: 10, display: 'flex', color: twoFactor ? 'var(--accent)' : 'var(--text-muted)' }}>
                                            <Shield size={20} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 14 }}>Autenticação 2FA</div>
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Proteja sua conta com um código extra</div>
                                        </div>
                                    </div>
                                    <button
                                        className={`btn btn-sm ${twoFactor ? 'btn-secondary' : 'btn-primary'}`}
                                        onClick={handleToggle2FA}
                                        disabled={tfaLoading}
                                        style={{ minWidth: 100 }}
                                    >
                                        {tfaLoading ? '...' : (twoFactor ? 'Desativar' : 'Ativar')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Save button */}
                    <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                        <button
                            className="btn btn-primary"
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? 'Salvando...' : <><Save size={15} /> Salvar alterações</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
