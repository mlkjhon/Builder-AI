const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres' });
        }

        // Verifica se email já existe
        const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            return res.status(409).json({ error: 'Email já cadastrado' });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        // Simple logic: if email contains admin/dev or is postgres, assign 'admin' role, otherwise 'user'
        const role = (email === 'postgres' || email.includes('admin') || email.includes('dev')) ? 'admin' : 'user';

        const result = await pool.query(
            'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at',
            [name, email, passwordHash, role]
        );

        const user = result.rows[0];
        const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }


});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email e senha são obrigatórios' });
        }

        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Email ou senha incorretos' });
        }

        const user = result.rows[0];

        if (user.status && user.status !== 'active') {
            const statusMsgs = {
                'blocked': 'Sua conta foi bloqueada. Entre em contato com o suporte.',
                'suspended': 'Sua conta está suspensa temporariamente.',
                'inactive': 'Sua conta foi desativada.'
            };
            return res.status(403).json({ error: statusMsgs[user.status] || 'Sua conta não está ativa.' });
        }

        const valid = await bcrypt.compare(password, user.password_hash);

        if (!valid) {
            return res.status(401).json({ error: 'Email ou senha incorretos' });
        }

        const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// GET /api/auth/me
router.get('/me', require('../middleware/auth'), async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name, email, role, avatar_url, active_plan, preferences, created_at FROM users WHERE id = $1', [req.user.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Me error:', err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// POST /api/auth/preferences
router.post('/preferences', require('../middleware/auth'), async (req, res) => {
    try {
        const { preferences } = req.body;
        await pool.query('UPDATE users SET preferences = $1 WHERE id = $2', [preferences, req.user.id]);
        res.json({ success: true, message: 'Preferências atualizadas' });
    } catch (err) {
        console.error('Update preferences error:', err);
        res.status(500).json({ error: 'Erro ao atualizar preferências' });
    }
});

module.exports = router;
