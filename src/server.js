// server.js (Atualizado)
const express = require('express');
const cors = require('cors'); // Adicione isso
const db = require('./db');
const app = express();

app.use(express.json());

// Configure o CORS para permitir o seu domínio
app.use(cors({
    origin: 'https://robodevendasautomaticas.com.br', // Substitua pelo domínio da sua página de cadastro
    methods: 'GET,POST',
    allowedHeaders: 'Content-Type',
}));

// Rota para verificar vagas restantes
app.get('/api/vagas-restantes', async (req, res) => {
    try {
        const [results] = await db.query('SELECT vagasRestantes FROM vagas WHERE id = 1');
        if (results.length === 0) {
            return res.status(404).json({ message: 'Nenhuma vaga encontrada.' });
        }
        res.json({ vagasRestantes: results[0].vagasRestantes });
    } catch (error) {
        console.error('Erro ao buscar vagas:', error);
        res.status(500).json({ message: 'Erro ao buscar vagas.' });
    }
});

// Rota para verificar o código e atualizar as vagas
app.post('/api/verify-code', async (req, res) => {
    const { codigo } = req.body;
    const codigoDoDia = "1777";

    if (codigo !== codigoDoDia) {
        return res.status(400).json({ message: "Código incorreto. Tente novamente." });
    }

    try {
        const [results] = await db.query('SELECT vagasRestantes FROM vagas WHERE id = 1');
        if (results.length === 0 || results[0].vagasRestantes <= 0) {
            return res.json({ message: "Vagas esgotadas." });
        }

        const novasVagas = results[0].vagasRestantes - 1;
        await db.query('UPDATE vagas SET vagasRestantes = ? WHERE id = 1', [novasVagas]);

        res.json({ message: "Vaga confirmada! Redirecionando para a página de venda..." });
    } catch (error) {
        console.error('Erro ao buscar ou atualizar vagas:', error);
        res.status(500).json({ message: 'Erro ao buscar ou atualizar vagas.' });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
