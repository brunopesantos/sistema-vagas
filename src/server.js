const express = require('express');
const rateLimit = require('express-rate-limit');
const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

let vagasRestantes = 10;

// Limite de tentativas por IP: máximo de 2 requisições por dia
const limiteTentativas = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 horas
    max: 2, // limita a 2 tentativas por IP
    message: 'Você excedeu o número de tentativas diárias.',
    keyGenerator: (req) => req.ip,
});

app.get('/api/vagas-restantes', (req, res) => {
    res.json({ vagasRestantes });
});

app.post('/api/verify-code', limiteTentativas, (req, res) => {
    const { codigo } = req.body;
    
    // Verifica o código correto (substitua "123456" pelo código desejado)
    if (codigo === '123456') {
        if (vagasRestantes > 0) {
            vagasRestantes -= 1;
            res.json({ message: 'Vaga confirmada! Redirecionando para a página de venda...', vagasRestantes });
        } else {
            res.json({ message: 'Vagas esgotadas.' });
        }
    } else {
        res.status(400).json({ message: 'Código incorreto.' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
