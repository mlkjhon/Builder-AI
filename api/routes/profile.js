const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');
const path = require('path');
const fs = require('fs');

const router = express.Router();
router.use(authMiddleware);

// PUT /api/profile - Update name and avatar
router.put('/', async (req, res) => {
    try {
        const { name } = req.body;
        let avatarUrl = null;

        // Handle file upload if present
        if (req.files && req.files.avatar) {
            const avatar = req.files.avatar;
            const uploadDir = path.join(__dirname, '../../uploads');
            if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

            const ext = path.extname(avatar.name) || '.jpg';
            const filename = `avatar_${req.user.id}${ext}`;
            const uploadPath = path.join(uploadDir, filename);
            await avatar.mv(uploadPath);
            avatarUrl = `/uploads/${filename}`;
        }

        const updates = [];
        const values = [];
        let idx = 1;

        if (name) {
            updates.push(`name = $${idx++}`);
            values.push(name);
        }
        if (avatarUrl) {
            updates.push(`avatar_url = $${idx++}`);
            values.push(avatarUrl);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'Nenhum dado para atualizar' });
        }

        values.push(req.user.id);
        const result = await pool.query(
            `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx} RETURNING id, name, email, role, avatar_url, active_plan, created_at`,
            values
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Profile update error:', err);
        res.status(500).json({ error: 'Erro ao atualizar o perfil' });
    }
});

module.exports = router;
