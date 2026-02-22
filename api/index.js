require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const planRoutes = require('./routes/plans');
const chatRoutes = require('./routes/chat');
const profileRoutes = require('./routes/profile');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:3000'],
    credentials: true,
}));
app.use(express.json());
app.use(require('express-fileupload')({ limits: { fileSize: 5 * 1024 * 1024 }, createParentPath: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);

// ... (previous imports)

// Serve uploaded avatars
const path = require('path');
// No production path needed for Vercel serverless in the same way, 
// but for local dev:
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Startup Builder AI Server running 🚀' });
});

// 404
app.use((req, res) => {
    res.status(404).json({ error: 'Rota não encontrada na API' });
});

const autoMigrate = require('./db/migrate');

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Erro interno do servidor' });
});

// Solo correr listen si no estamos en Vercel
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    autoMigrate().then(() => {
        app.listen(PORT, () => {
            console.log(`🚀 Startup Builder AI Server rodando na porta ${PORT}`);
        });
    }).catch(err => console.error("Migration failed", err));
}

module.exports = app;

