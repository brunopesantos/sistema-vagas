const express = require('express');
const rateLimit = require('express-rate-limit');
const app = express();
const port = 10000;

app.use(express.json());

// Variável de vagas restantes
let vagasRestantes = 10;

// Limitador de tentativas diárias por IP
const dailyAccessLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 horas
    max: 2, // Limite de 2 tentativas por dia
    message: 'Limite diário de tentativas excedido'
});

// Endpoint para verificar o código
app.post('/api/verify-code', dailyAccessLimiter, (req, res) => {
    const { codigo } = req.body;
    
    if (codigo === '123456' && vagasRestantes > 0) {
        vagasRestantes -= 1;
        res.json({ message: 'Vaga confirmada! Redirecionando para a página de venda...', vagasRestantes });
    } else if (vagasRestantes <= 0) {
        res.json({ message: 'Vagas esgotadas.' });
    } else {
        res.json({ message: 'Código incorreto.' });
    }
});

// Endpoint para consultar o número de vagas restantes
app.get('/api/vagas-restantes', (req, res) => {
    res.json({ vagasRestantes });
});

// Inicialização do servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
