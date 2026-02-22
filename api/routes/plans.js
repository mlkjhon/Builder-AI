const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');
const { generateBusinessPlan } = require('../services/gemini');
const { generatePDF } = require('../services/pdf');

const router = express.Router();

// POST /api/plans/generate
router.post('/generate', authMiddleware, async (req, res) => {
    try {
        const { idea } = req.body;

        if (!idea || idea.trim().length < 10) {
            return res.status(400).json({ error: 'Descreva sua ideia com pelo menos 10 caracteres' });
        }

        const result = await generateBusinessPlan(idea.trim());

        const saved = await pool.query(
            'INSERT INTO business_plans (user_id, idea, result) VALUES ($1, $2, $3) RETURNING id, created_at',
            [req.user.id, idea.trim(), JSON.stringify(result)]
        );

        res.json({
            id: saved.rows[0].id,
            idea: idea.trim(),
            result,
            createdAt: saved.rows[0].created_at,
        });
    } catch (err) {
        console.error('Generate plan error:', err);
        if (err.name === 'SyntaxError') {
            return res.status(500).json({ error: 'Erro ao processar resposta da IA. Tente novamente.' });
        }
        res.status(500).json({ error: 'Erro ao gerar plano. Tente novamente.' });
    }
});

// GET /api/plans/history
router.get('/history', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, idea, result, created_at FROM business_plans WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('History error:', err);
        res.status(500).json({ error: 'Erro ao buscar histórico' });
    }
});

// GET /api/plans/:id
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM business_plans WHERE id = $1 AND user_id = $2',
            [req.params.id, req.user.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Plano não encontrado' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Get plan error:', err);
        res.status(500).json({ error: 'Erro ao buscar plano' });
    }
});

// GET /api/plans/:id/pdf
router.get('/:id/pdf', authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM business_plans WHERE id = $1 AND user_id = $2',
            [req.params.id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Plano não encontrado' });
        }

        const plan = result.rows[0];
        const pdf = await generatePDF(plan.result, plan.idea);

        const filename = `startup-plan-${plan.result.companyName?.replace(/\s+/g, '-') || 'plano'}.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(pdf);
    } catch (err) {
        console.error('PDF error:', err);
        res.status(500).json({ error: 'Erro ao gerar PDF' });
    }
});

module.exports = router;
