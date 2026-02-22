import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Sparkles, MessageSquare, Send, Bot, User, Menu, Trash2, Plus, Settings, Save, Heart, MoreVertical, Edit3, Paperclip, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';

const TypewriterMessage = ({ content }) => {
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            setDisplayedText(content.substring(0, i + 1));
            i++;
            if (i >= content.length) {
                clearInterval(interval);
            }
        }, 15);

        return () => clearInterval(interval);
    }, [content]);

    return <ReactMarkdown>{displayedText}</ReactMarkdown>;
};

export default function ChatPage() {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // The idea passed from LandingPage or AuthPage
    const initialIdea = location.state?.idea || location.state?.autoGenerate || '';
    // Chat ID passed from DashboardPage
    const openChatId = location.state?.openChatId || null;

    const [chats, setChats] = useState([]);
    const [currentChatId, setCurrentChatId] = useState(openChatId);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState(initialIdea);
    const [loading, setLoading] = useState(false);
    const [abortController, setAbortController] = useState(null);

    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [deleteModalId, setDeleteModalId] = useState(null);
    const [prefModalOpen, setPrefModalOpen] = useState(false);
    const [preferences, setPreferences] = useState(user?.preferences || '');
    const [prefLoading, setPrefLoading] = useState(false);
    const [menuOpenId, setMenuOpenId] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editingTitle, setEditingTitle] = useState('');
    const [imageFiles, setImageFiles] = useState([]);
    const fileInputRef = useRef(null);
    const autoSentRef = useRef(false); // guard to prevent sending twice

    const activePlan = user?.active_plan || 'free';
    const MAX_IMAGES = {
        free: 1,
        pro: 3,
        business: 99 // Ilimitado (na prática)
    }[activePlan];

    useEffect(() => {
        if (user?.preferences) setPreferences(user.preferences);
    }, [user]);

    const savePreferences = async () => {
        setPrefLoading(true);
        try {
            await api.post('/api/auth/preferences', { preferences });
            // Update auth context + localStorage so AI personalization takes effect immediately
            const token = localStorage.getItem('token');
            login(token, { ...user, preferences });
            setPrefModalOpen(false);
            toast.success('Preferências salvas! A IA agora conhece melhor seus gostos.');
        } catch (err) {
            console.error(err);
            toast.error('Erro ao salvar preferências.');
        } finally {
            setPrefLoading(false);
        }
    };

    const messagesEndRef = useRef(null);

    // Auto scroll to bottom of chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    // Load sidebar history
    useEffect(() => {
        const fetchChats = async () => {
            try {
                const res = await api.get('/api/chat');
                setChats(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchChats();
    }, []);

    // Load active chat messages
    useEffect(() => {
        const fetchMessages = async () => {
            if (!currentChatId) {
                setMessages([]);
                return;
            }
            try {
                const res = await api.get(`/api/chat/${currentChatId}`);
                const dbMessages = res.data.messages;

                // Preserve the 'isNew' flag for typewriter animation if the last message matches
                setMessages(prev => {
                    return dbMessages.map(dbM => {
                        const localM = prev.find(p => p.id === dbM.id);
                        if (localM?.isNew) return { ...dbM, isNew: true };
                        return dbM;
                    });
                });
            } catch (err) {
                console.error(err);
            }
        };
        fetchMessages();
    }, [currentChatId]);

    // Triggers auto-send if there is an initial idea and no current chat
    useEffect(() => {
        if (initialIdea && !autoSentRef.current) {
            autoSentRef.current = true;
            // Immediate send for seamless flow
            handleSend(null, initialIdea);

            // clear state so back-navigation doesn't re-trigger
            navigate(location.pathname, { replace: true, state: {} });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialIdea]);

    const handleStopGeneration = () => {
        if (abortController) {
            abortController.abort();
            setLoading(false);
            setAbortController(null);
        }
    };

    const handleSend = async (e, forceInput = null) => {
        if (e) e.preventDefault();
        const textToSend = forceInput || input;

        if ((!textToSend.trim() && imageFiles.length === 0) || loading) return;

        let uiContent = textToSend;
        if (imageFiles.length > 0) {
            uiContent += `\n\n[${imageFiles.length} Imagem(ns) Anexada(s)]`;
        }

        const tempUserMsg = { id: Date.now(), role: 'user', content: uiContent };
        setMessages(prev => [...prev, tempUserMsg]);
        setInput('');
        setLoading(true);

        const controller = new AbortController();
        setAbortController(controller);

        try {
            const payload = {
                chatId: currentChatId,
                message: textToSend
            };
            if (imageFiles.length > 0) {
                payload.images = imageFiles.map(img => ({ base64: img.base64, mimeType: img.mimeType }));
                payload.image = payload.images[0];
            }
            const res = await api.post('/api/chat', payload, {
                signal: controller.signal
            });

            const { chatId, userMessage, assistantMessage } = res.data;

            if (!currentChatId) {
                setCurrentChatId(chatId);
                const chatsRes = await api.get('/api/chat');
                setChats(chatsRes.data);
            }

            setMessages(prev => {
                const filterTemp = prev.filter(m => m.id !== tempUserMsg.id);
                return [...filterTemp, userMessage, { ...assistantMessage, isNew: true }];
            });
            setImageFiles([]);
        } catch (err) {
            if (err.name === 'CanceledError' || err.name === 'AbortError') {
                console.log('Generation stopped by user');
                return;
            }
            console.error('Send message error:', err);
            toast.error(err.response?.data?.error || 'Falha ao enviar mensagem. Tente novamente.');
            setMessages(prev => prev.filter(m => m.id !== tempUserMsg.id));
            setInput(textToSend);
        } finally {
            setLoading(false);
            setAbortController(null);
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        let validFiles = files.filter(f => f.type.startsWith('image/'));
        if (validFiles.length === 0) {
            toast.error('Por favor, selecione apenas imagens.');
            return;
        }

        if (imageFiles.length + validFiles.length > MAX_IMAGES) {
            let limitMessage = 'Você atingiu o limite de imagens.';
            if (activePlan === 'free') limitMessage = 'Plano Grátis: Apenas 1 imagem por vez.';
            else if (activePlan === 'pro') limitMessage = 'Plano Pro: Até 3 imagens por vez.';
            toast.error(limitMessage);
            validFiles = validFiles.slice(0, MAX_IMAGES - imageFiles.length);
        }

        const loadPromises = validFiles.map(file => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    const base64Data = ev.target.result.split(',')[1];
                    resolve({
                        preview: ev.target.result,
                        base64: base64Data,
                        mimeType: file.type
                    });
                };
                reader.readAsDataURL(file);
            });
        });

        Promise.all(loadPromises).then(newImages => {
            setImageFiles(prev => [...prev, ...newImages]);
        });

        // reset input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeImage = (index) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
    };

    const requestDelete = (e, id) => {
        e.stopPropagation();
        setDeleteModalId(id);
    };

    const confirmDelete = async () => {
        if (!deleteModalId) return;
        const id = deleteModalId;
        try {
            await api.delete(`/api/chat/${id}`);
            setChats(prev => prev.filter(c => c.id !== id));
            if (currentChatId === id) {
                setCurrentChatId(null);
                setMessages([]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setDeleteModalId(null);
        }
    };

    const cancelDelete = () => {
        setDeleteModalId(null);
    };

    const startNewChat = () => {
        setCurrentChatId(null);
        setMessages([]);
    };

    const handleRename = async (id, newTitle) => {
        if (!newTitle.trim()) return;
        try {
            await api.patch(`/api/chat/${id}`, { title: newTitle });
            setChats(prev => prev.map(c => c.id === id ? { ...c, title: newTitle } : c));
        } catch (err) {
            console.error(err);
        } finally {
            setEditingId(null);
        }
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClick = () => setMenuOpenId(null);
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    return (
        <div className="page-wrapper" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />

            <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>

                {/* Mobile sidebar overlay */}
                {sidebarOpen && (
                    <div
                        className="sidebar-overlay"
                        style={{
                            position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 40,
                            display: window.innerWidth <= 768 ? 'block' : 'none'
                        }}
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <div className={`chat-sidebar ${sidebarOpen ? 'open' : ''}`}>
                    <div className="sidebar-header">
                        <button onClick={startNewChat} className="btn btn-primary" style={{ width: '100%', marginBottom: 8 }}>
                            <Plus size={16} /> Novo Chat
                        </button>
                        <button onClick={() => setPrefModalOpen(true)} className="btn btn-secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13, background: 'rgba(255,255,255,0.03)' }}>
                            <Settings size={14} /> Personalizar IA
                        </button>
                    </div>
                    <div className="sidebar-content">
                        {chats.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)', fontSize: 13 }}>
                                Nenhum histórico ainda.
                            </div>
                        ) : (
                            chats.map(c => (
                                <div
                                    key={c.id}
                                    className={`chat-nav-item ${currentChatId === c.id ? 'active' : ''}`}
                                    onClick={() => {
                                        setCurrentChatId(c.id);
                                        // Close sidebar on mobile when a chat is selected
                                        if (window.innerWidth <= 768) setSidebarOpen(false);
                                    }}
                                >
                                    <MessageSquare size={16} style={{ flexShrink: 0 }} />
                                    {editingId === c.id ? (
                                        <input
                                            autoFocus
                                            className="chat-nav-title-input"
                                            value={editingTitle}
                                            onChange={e => setEditingTitle(e.target.value)}
                                            onBlur={() => handleRename(c.id, editingTitle)}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') handleRename(c.id, editingTitle);
                                                if (e.key === 'Escape') setEditingId(null);
                                            }}
                                            onClick={e => e.stopPropagation()}
                                        />
                                    ) : (
                                        <span className="chat-nav-title">{c.title}</span>
                                    )}

                                    <div style={{ position: 'relative' }}>
                                        <button
                                            className="chat-menu-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setMenuOpenId(menuOpenId === c.id ? null : c.id);
                                            }}
                                        >
                                            <MoreVertical size={14} />
                                        </button>

                                        {menuOpenId === c.id && (
                                            <div className="chat-dropdown-menu fade-in" onClick={e => e.stopPropagation()}>
                                                <button onClick={() => {
                                                    setEditingId(c.id);
                                                    setEditingTitle(c.title);
                                                    setMenuOpenId(null);
                                                }}>
                                                    <Edit3 size={14} /> Renomear
                                                </button>
                                                <button onClick={(e) => {
                                                    requestDelete(e, c.id);
                                                    setMenuOpenId(null);
                                                }} className="delete">
                                                    <Trash2 size={14} /> Excluir
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className="chat-main">
                    <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
                        <Menu size={20} />
                    </button>

                    <div className="messages-container">
                        {messages.length === 0 && !loading && (
                            <div className="chat-empty-state fade-in">
                                <div className="empty-icon-wrap" style={{ margin: '0 auto 24px', background: 'var(--accent-glow)', width: 80, height: 80, borderRadius: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Sparkles size={40} color="var(--accent)" />
                                </div>
                                <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}>Como posso ajudar com o seu projeto hoje?</h1>
                                <p style={{ color: 'var(--text-secondary)', maxWidth: 460, margin: '0 auto', lineHeight: 1.6 }}>
                                    Descreva a sua ideia de site, peça a estrutura de uma landing page atraente ou me peça para gerar prompts perfeitos para suas ferramentas IA (Midjourney, Cursor, etc).
                                </p>
                            </div>
                        )}

                        {messages.map((m, i) => (
                            <div key={m.id || i} className={`message-row fade-in delay-1 ${m.role}`}>
                                <div className="message-avatar" style={{ padding: m.role === 'user' && user?.avatar_url ? 0 : '', overflow: 'hidden' }}>
                                    {m.role === 'user' ? (
                                        user?.avatar_url ? (
                                            <img src={user.avatar_url} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <User size={18} />
                                        )
                                    ) : <Bot size={18} />}
                                </div>
                                <div className="message-content">
                                    {m.role === 'model' ? (
                                        <div className="markdown-body">
                                            {m.isNew ? (
                                                <TypewriterMessage content={m.content} />
                                            ) : (
                                                <ReactMarkdown>{m.content}</ReactMarkdown>
                                            )}
                                        </div>
                                    ) : (
                                        m.content
                                    )}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="message-row fade-in model">
                                <div className="message-avatar"><Bot size={18} /></div>
                                <div className="message-content" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div className="loader-dots"><span></span><span></span><span></span></div>
                                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Mestre de obras digitais pensando...</span>
                                    </div>
                                    <button
                                        onClick={handleStopGeneration}
                                        className="btn btn-ghost btn-sm"
                                        style={{ border: '1px solid var(--border)', alignSelf: 'flex-start', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px' }}
                                    >
                                        <X size={14} /> Interromper resposta
                                    </button>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chat-input-area">
                        {imageFiles.length > 0 && (
                            <div className="image-preview-wrapper fade-in" style={{ display: 'flex', gap: 12, marginBottom: 12, overflowX: 'auto', paddingBottom: 8 }}>
                                {imageFiles.map((img, idx) => (
                                    <div key={idx} className="image-preview-container">
                                        <img src={img.preview} alt={`Preview ${idx}`} />
                                        <button type="button" onClick={() => removeImage(idx)} className="remove-image-btn">
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <form className="chat-input-form" onSubmit={handleSend}>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={handleImageChange}
                            />
                            <button
                                type="button"
                                className="btn btn-ghost btn-icon attachment-btn"
                                onClick={() => {
                                    if (imageFiles.length >= MAX_IMAGES) {
                                        toast.error(activePlan === 'free' ? 'Plano Grátis: Limite de 1 imagem atingido.' : 'Plano Pro: Limite de 3 imagens atingido.');
                                    } else {
                                        fileInputRef.current?.click();
                                    }
                                }}
                                disabled={loading}
                            >
                                <Paperclip size={20} />
                            </button>
                            <textarea
                                className="chat-textarea"
                                placeholder="Digite sua ideia de site, peça a estrutura da landing page ou gere um prompt aqui..."
                                value={input}
                                onChange={e => {
                                    setInput(e.target.value);
                                    // Auto-resize
                                    e.target.style.height = 'auto';
                                    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
                                }}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        // Prevent default only on desktop to allow enter on mobile keyboard? 
                                        // Usually, Enter submits on both, but we keep this behavior consistent
                                        e.preventDefault();
                                        handleSend(e);
                                        e.target.style.height = 'auto';
                                    }
                                }}
                                disabled={loading}
                                rows={1}
                                style={{ height: 'auto' }}
                            />
                            <button
                                type="submit"
                                className="btn btn-primary btn-icon chat-send-btn"
                                disabled={(!input.trim() && imageFiles.length === 0) || loading}
                            >
                                <Send size={18} />
                            </button>
                        </form>
                        <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                            A IA pode cometer erros. Verifique informações importantes.
                        </div>
                    </div>
                </div>

                {/* Custom Delete Modal Overlay */}
                {deleteModalId && (
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                        zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <div className="card fade-in" style={{ maxWidth: 400, width: '90%', textAlign: 'center', backgroundColor: 'var(--bg-card)', padding: 32, position: 'relative' }}>
                            <div style={{ color: 'var(--danger)', marginBottom: 16 }}>
                                <Trash2 size={48} style={{ margin: '0 auto' }} />
                            </div>
                            <h3 style={{ fontSize: 20, marginBottom: 12, color: 'var(--text-primary)' }}>Apagar Histórico?</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 14 }}>Tem certeza que deseja apagar este chat? Esta ação não pode ser desfeita.</p>
                            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                                <button className="btn btn-secondary" onClick={cancelDelete} style={{ flex: 1 }}>Cancelar</button>
                                <button className="btn" style={{ flex: 1, backgroundColor: 'var(--danger)', color: 'white' }} onClick={confirmDelete}>Sim, apagar</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Preferences Modal */}
                {prefModalOpen && (
                    <div className="modal-overlay fade-in" style={{ zIndex: 10000 }}>
                        <div className="modal-container" style={{ maxWidth: 500, width: '90%', padding: 32, borderRadius: 24, backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                                <div style={{ width: 40, height: 40, borderRadius: 20, background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Heart size={20} color="var(--accent)" />
                                </div>
                                <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>Personalizar Minha IA</h3>
                            </div>

                            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.5 }}>
                                Diga o que você gosta, o que não gosta e como quer ser tratado. A IA lembrará disso em todas as conversas.
                            </p>

                            <textarea
                                className="chat-textarea"
                                style={{
                                    background: 'var(--bg-secondary)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 16,
                                    padding: 16,
                                    minHeight: 180,
                                    fontSize: 14,
                                    marginBottom: 20,
                                    width: '100%',
                                    color: 'var(--text-primary)',
                                    resize: 'none',
                                    outline: 'none'
                                }}
                                placeholder="Ex: Gosto de explicações visuais e código limpo. Não gosto de respostas muito longas. Prefiro que use React e Tailwind nos exemplos."
                                value={preferences}
                                onChange={(e) => setPreferences(e.target.value)}
                            />

                            <div style={{ display: 'flex', gap: 12 }}>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setPrefModalOpen(false)}
                                    style={{ flex: 1 }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={savePreferences}
                                    style={{ flex: 1 }}
                                    disabled={prefLoading}
                                >
                                    {prefLoading ? 'Salvando...' : 'Salvar'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .chat-sidebar {
                    width: 260px;
                    background: var(--bg-secondary);
                    border-right: 1px solid var(--border);
                    display: flex;
                    flex-direction: column;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .sidebar-header {
                    padding: 16px;
                    border-bottom: 1px solid var(--border);
                }

                .sidebar-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 12px;
                }

                .chat-nav-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px;
                    border-radius: var(--radius-md);
                    color: var(--text-secondary);
                    cursor: pointer;
                    transition: var(--transition);
                    margin-bottom: 4px;
                    position: relative;
                }

                .chat-nav-item:hover {
                    background: var(--bg-card);
                    color: var(--text-primary);
                }

                .chat-nav-title-input {
                    background: var(--bg-secondary);
                    border: 1px solid var(--accent);
                    border-radius: 4px;
                    color: var(--text-primary);
                    font-size: 13px;
                    padding: 2px 6px;
                    width: 100%;
                    outline: none;
                }

                .chat-nav-title {
                    flex: 1;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .chat-menu-btn {
                    background: transparent;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    opacity: 0;
                    transition: var(--transition);
                    padding: 4px;
                    display: flex;
                    align-items: center;
                }

                .chat-nav-item:hover .chat-menu-btn, .chat-nav-item.active .chat-menu-btn { opacity: 1; }
                .chat-menu-btn:hover { color: var(--text-primary); }

                .chat-dropdown-menu {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-md);
                    padding: 6px;
                    z-index: 100;
                    box-shadow: var(--shadow-lg);
                    min-width: 120px;
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .chat-dropdown-menu button {
                    background: transparent;
                    border: none;
                    color: var(--text-secondary);
                    padding: 8px 10px;
                    border-radius: 6px;
                    font-size: 12px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    width: 100%;
                    cursor: pointer;
                    text-align: left;
                    transition: var(--transition);
                }

                .chat-dropdown-menu button:hover {
                    background: var(--bg-secondary);
                    color: var(--text-primary);
                }

                .chat-dropdown-menu button.delete:hover {
                    color: var(--danger);
                    background: rgba(239, 68, 68, 0.1);
                }

                .chat-main {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    background: var(--bg-primary);
                    position: relative;
                }

                .sidebar-toggle {
                    position: absolute;
                    top: 16px;
                    left: 16px;
                    z-index: 10;
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    color: var(--text-primary);
                    width: 40px;
                    height: 40px;
                    border-radius: var(--radius-md);
                    display: none;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                }

                .messages-container {
                    flex: 1;
                    overflow-y: auto;
                    padding: 40px 24px;
                }

                .chat-empty-state {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    padding: 0 20px;
                }

                .message-row {
                    display: flex;
                    gap: 16px;
                    max-width: 800px;
                    margin: 0 auto 32px;
                }

                .message-row.user {
                    flex-direction: row-reverse;
                }

                .message-avatar {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .message-row.user .message-avatar {
                    background: var(--bg-secondary);
                    color: var(--text-primary);
                    border: 1px solid var(--border);
                }

                .message-row.model .message-avatar {
                    background: linear-gradient(135deg, var(--accent), var(--accent-dark));
                    color: white;
                }

                .message-content {
                    background: transparent;
                    color: var(--text-primary);
                    font-size: 15px;
                    line-height: 1.6;
                    border-radius: 12px;
                    max-width: calc(100% - 60px);
                }

                .message-row.user .message-content {
                    background: var(--bg-secondary);
                    padding: 14px 20px;
                    border-bottom-right-radius: 4px;
                    border: 1px solid var(--border);
                }

                .message-row.model .message-content {
                    padding: 8px 0;
                }

                /* Markdown Base Styling for AI output */
                .markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4 {
                    font-weight: 700;
                    margin-top: 24px;
                    margin-bottom: 12px;
                    color: var(--text-primary);
                }
                
                .markdown-body h3 { font-size: 18px; }

                .markdown-body p { margin-bottom: 16px; }

                .markdown-body ul, .markdown-body ol {
                    margin-bottom: 16px;
                    padding-left: 24px;
                }
                
                .markdown-body li { margin-bottom: 8px; }

                .markdown-body strong { color: var(--text-primary); }

                .markdown-body code {
                    background: var(--bg-secondary);
                    padding: 2px 6px;
                    border-radius: 6px;
                    font-family: monospace;
                    font-size: 13px;
                }

                .markdown-body pre {
                    background: #0f172a; /* Slate 900 */
                    padding: 24px 20px 20px;
                    border-radius: 12px;
                    overflow-x: auto;
                    margin: 16px 0;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
                    position: relative;
                }

                .markdown-body pre::before {
                    content: 'DETALHES DO PROJETO';
                    display: block;
                    position: absolute;
                    top: 0;
                    right: 0;
                    padding: 3px 10px;
                    background: rgba(255, 255, 255, 0.05);
                    color: rgba(255, 255, 255, 0.3);
                    font-size: 9px;
                    font-weight: 800;
                    letter-spacing: 1px;
                    border-bottom-left-radius: 8px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                    border-left: 1px solid rgba(255, 255, 255, 0.08);
                    text-transform: uppercase;
                }
                
                .markdown-body pre code {
                    background: transparent;
                    color: #94a3b8; /* Slate 400 */
                    padding: 0;
                    font-family: 'Fira Code', 'Courier New', monospace;
                    font-size: 14px;
                    line-height: 1.5;
                }

                .markdown-body code:not(pre code) {
                    background: var(--bg-secondary);
                    color: var(--accent);
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-size: 0.9em;
                }

                .chat-input-area {
                    padding: 20px 24px 24px;
                    background: var(--bg-primary);
                    position: relative;
                }

                .chat-input-area::before {
                    content: '';
                    position: absolute;
                    top: -40px;
                    left: 0;
                    right: 0;
                    height: 40px;
                    background: linear-gradient(to top, var(--bg-primary), transparent);
                    pointer-events: none;
                }

                .chat-input-form {
                    max-width: 800px;
                    margin: 0 auto;
                    position: relative;
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: 24px;
                    padding: 6px;
                    display: flex;
                    align-items: center;
                    box-shadow: var(--shadow-sm);
                    transition: var(--transition);
                }

                .chat-input-form:focus-within {
                    border-color: var(--accent);
                    box-shadow: 0 0 0 3px var(--accent-glow);
                }

                .chat-textarea {
                    flex: 1;
                    background: transparent;
                    border: none;
                    outline: none;
                    color: var(--text-primary);
                    font-family: 'Inter', sans-serif;
                    font-size: 15px;
                    resize: none;
                    padding: 12px 16px;
                    max-height: 200px;
                    overflow-y: auto;
                }

                .chat-textarea::placeholder { color: var(--text-muted); opacity: 0.8; }

                .chat-send-btn {
                    padding: 8px;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    flex-shrink: 0;
                    box-shadow: 0 4px 12px var(--accent-glow);
                }

                .image-preview-container {
                    background: var(--bg-card);
                    padding: 8px;
                    border-radius: 12px;
                    border: 1px solid var(--border);
                    box-shadow: var(--shadow-md);
                    display: inline-flex;
                    position: relative;
                    flex-shrink: 0;
                }
                .image-preview-container img {
                    height: 80px;
                    border-radius: 8px;
                    object-fit: cover;
                }
                .remove-image-btn {
                    position: absolute;
                    top: -8px;
                    right: -8px;
                    width: 24px;
                    height: 24px;
                    border-radius: 12px;
                    background: var(--danger);
                    color: white;
                    border: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                }
                .attachment-btn {
                    color: var(--text-muted);
                    padding: 8px;
                    background: transparent;
                }
                .attachment-btn:hover {
                    color: var(--text-primary);
                }
                    width: 40px;
                    height: 40px;
                    border-radius: 20px;
                    flex-shrink: 0;
                    margin-right: 2px;
                }

                @media (max-width: 768px) {
                    .chat-sidebar {
                        position: absolute;
                        top: 0;
                        bottom: 0;
                        left: -260px;
                        z-index: 20;
                    }
                    .chat-sidebar.open { left: 0; box-shadow: var(--shadow-lg); }
                    .sidebar-toggle { display: flex; }
                    .messages-container { padding: 80px 16px 20px; }
                }

            `}</style>
        </div >
    );
}
