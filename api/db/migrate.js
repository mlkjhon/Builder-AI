const fs = require('fs');
const path = require('path');
const pg = require('pg');

async function autoMigrate() {
    // Se não houver DATABASE_URL ou estiver com o placeholder padrão, não tente migrar
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('sua_senha')) {
        console.warn('⚠️  DATABASE_URL não configurada corretamente. Ignorando migração automática.');
        return;
    }

    const pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const schemaPath = path.join(__dirname, 'schema.sql');
        const sql = fs.readFileSync(schemaPath, 'utf8');

        console.log('📦 Executando migração do banco de dados...');
        // 1. Create tables first
        await pool.query(sql);
        // 2. Then apply ALTER TABLE for columns added after initial schema
        await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user'");
        await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT");
        await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS active_plan VARCHAR(50) DEFAULT 'free'");
        await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS preferences TEXT");
        await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active'");
        console.log('✅ Banco de dados sincronizado (tabelas criadas com sucesso).');
    } catch (err) {
        console.error('❌ Erro na migração do banco:', err.message);
    } finally {
        await pool.end();
    }
}

module.exports = autoMigrate;
