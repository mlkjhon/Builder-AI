const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');
const { getChatSession, sendChatMessage } = require('../services/gemini');

const router = express.Router();

router.use(authMiddleware);

// GET /api/chat - List all chats for current user
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, title, created_at, updated_at FROM chats WHERE user_id = $1 ORDER BY updated_at DESC',
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Fetch chats error:', err);
        res.status(500).json({ error: 'Erro ao carregar os chats.' });
    }
});

// GET /api/chat/:id - Get older messages for a specific chat
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Verify ownership
        const chatCheck = await pool.query('SELECT id FROM chats WHERE id = $1 AND user_id = $2', [id, req.user.id]);
        if (chatCheck.rows.length === 0) return res.status(404).json({ error: 'Chat não encontrado' });

        const result = await pool.query(
            'SELECT id, role, content, created_at FROM messages WHERE chat_id = $1 ORDER BY created_at ASC',
            [id]
        );
        res.json({ id, messages: result.rows });
    } catch (err) {
        console.error('Fetch messages error:', err);
        res.status(500).json({ error: 'Erro ao carregar as mensagens.' });
    }
});

// POST /api/chat - Send a new message (optionally creating a new chat)
router.post('/', async (req, res) => {
    try {
        const { chatId, message, image } = req.body;
        if ((!message || !message.trim()) && !image) {
            return res.status(400).json({ error: 'A mensagem ou imagem não pode estar vazia' });
        }

        let targetChatId = chatId;
        let messagesHistory = [];

        // 1. Resolve Chat ID string and load history if exists
        if (targetChatId) {
            const chatCheck = await pool.query('SELECT id FROM chats WHERE id = $1 AND user_id = $2', [targetChatId, req.user.id]);
            if (chatCheck.rows.length === 0) return res.status(404).json({ error: 'Chat não encontrado' });

            const historyResult = await pool.query('SELECT role, content FROM messages WHERE chat_id = $1 ORDER BY created_at ASC', [targetChatId]);
            messagesHistory = historyResult.rows;
        } else {
            // Generate title from first message
            const title = message.substring(0, 40) + (message.length > 40 ? '...' : '');
            const newChat = await pool.query(
                'INSERT INTO chats (user_id, title) VALUES ($1, $2) RETURNING id',
                [req.user.id, title]
            );
            targetChatId = newChat.rows[0].id;
        }

        // 2. Save User Message
        const dbMessageContent = image ? `${message || ''}\n\n[Imagem Anexada]` : message;
        const userMsgResult = await pool.query(
            'INSERT INTO messages (chat_id, role, content) VALUES ($1, $2, $3) RETURNING id, role, content, created_at',
            [targetChatId, 'user', dbMessageContent.trim()]
        );
        const userMsg = userMsgResult.rows[0];

        // 3. Initiate Gemini Chat Session and Send
        const chatSession = getChatSession(messagesHistory, req.user);
        const modelResponseText = await sendChatMessage(chatSession, message || 'Analise esta imagem.', image);

        // 4. Save Model Message
        const modelMsgResult = await pool.query(
            'INSERT INTO messages (chat_id, role, content) VALUES ($1, $2, $3) RETURNING id, role, content, created_at',
            [targetChatId, 'model', modelResponseText]
        );
        const modelMsg = modelMsgResult.rows[0];

        // Update chat updated_at
        await pool.query('UPDATE chats SET updated_at = NOW() WHERE id = $1', [targetChatId]);

        // 5. Respond
        res.json({
            chatId: targetChatId,
            userMessage: userMsg,
            assistantMessage: modelMsg
        });

    } catch (err) {
        console.error('Post message error:', err);
        const errorMessage = err.message || 'Erro ao processar sua mensagem.';
        res.status(500).json({ error: errorMessage });
    }
});

// DELETE /api/chat/:id - Delete a chat
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM chats WHERE id = $1 AND user_id = $2', [id, req.user.id]);
        res.json({ success: true });
    } catch (err) {
        console.error('Delete chat error:', err);
        res.status(500).json({ error: 'Erro ao excluir o chat.' });
    }
});

// PATCH /api/chat/:id - Rename a chat
router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title } = req.body;
        if (!title || !title.trim()) return res.status(400).json({ error: 'Título é obrigatório' });

        await pool.query('UPDATE chats SET title = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3', [title, id, req.user.id]);
        res.json({ success: true });
    } catch (err) {
        console.error('Rename chat error:', err);
        res.status(500).json({ error: 'Erro ao renomear o chat.' });
    }
});

module.exports = router;
