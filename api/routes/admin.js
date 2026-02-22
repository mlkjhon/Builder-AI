const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Middleware to ensure user is admin
const requireAdmin = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
        }
        next();
    } catch (err) {
        res.status(500).json({ error: 'Erro de autorização' });
    }
};

router.use(authMiddleware);
router.use(requireAdmin);

// GET /api/admin/users
router.get('/users', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, name, email, role, active_plan, status, created_at FROM users ORDER BY created_at DESC'
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Fetch users error:', err);
        res.status(500).json({ error: 'Erro ao carregar usuários.' });
    }
});

// PATCH /api/admin/users/:id/plan
router.patch('/users/:id/plan', async (req, res) => {
    try {
        const { id } = req.params;
        const { active_plan } = req.body;

        await pool.query('UPDATE users SET active_plan = $1 WHERE id = $2', [active_plan, id]);
        res.json({ success: true, message: `Plano atualizado para ${active_plan}` });
    } catch (err) {
        console.error('Update user plan error:', err);
        res.status(500).json({ error: 'Erro ao atualizar plano do usuário.' });
    }
});

// PATCH /api/admin/users/:id/role
router.patch('/users/:id/role', async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        // Previne tirar admin de si mesmo para segurança
        if (req.user.id == id && role !== 'admin') {
            return res.status(400).json({ error: 'Você não pode remover seu próprio acesso de Admin.' });
        }

        await pool.query('UPDATE users SET role = $1 WHERE id = $2', [role, id]);
        res.json({ success: true, message: `Cargo atualizado para ${role}` });
    } catch (err) {
        console.error('Update user role error:', err);
        res.status(500).json({ error: 'Erro ao atualizar cargo do usuário.' });
    }
});

// PATCH /api/admin/users/:id/status
router.patch('/users/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Previne bloquear a si mesmo
        if (req.user.id == id && (status === 'blocked' || status === 'suspended' || status === 'inactive')) {
            return res.status(400).json({ error: 'Você não pode bloquear ou desativar sua própria conta admin.' });
        }

        await pool.query('UPDATE users SET status = $1 WHERE id = $2', [status, id]);
        res.json({ success: true, message: `Status atualizado para ${status}` });
    } catch (err) {
        console.error('Update user status error:', err);
        res.status(500).json({ error: 'Erro ao atualizar status do usuário.' });
    }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Previne deletar a si mesmo
        if (req.user.id == id) {
            return res.status(400).json({ error: 'Você não pode deletar sua própria conta admin.' });
        }

        await pool.query('DELETE FROM users WHERE id = $1', [id]);
        res.json({ success: true, message: 'Usuário deletado com sucesso.' });
    } catch (err) {
        console.error('Delete user error:', err);
        res.status(500).json({ error: 'Erro ao deletar usuário.' });
    }
});

module.exports = router;
