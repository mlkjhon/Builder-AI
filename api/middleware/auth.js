const jwt = require('jsonwebtoken');

async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Verifica status no banco para bloqueio imediato
        const pool = require('../db');
        const userCheck = await pool.query('SELECT status FROM users WHERE id = $1', [decoded.id]);

        if (userCheck.rows.length === 0 || (userCheck.rows[0].status && userCheck.rows[0].status !== 'active')) {
            return res.status(403).json({ error: 'Sua conta está inativa ou bloqueada.' });
        }

        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token inválido ou expirado' });
    }
}

module.exports = authMiddleware;
