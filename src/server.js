const express = require('express');
const rateLimit = require('express-rate-limit');

const app = express();

// Habilita o trust proxy
app.set('trust proxy', 1);

// Configuração do limitador de requisições
const limiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 horas
    max: 2, // Máximo de 2 tentativas por IP por dia
    message: 'Limite de tentativas diárias excedido. Tente novamente amanhã.',
    keyGenerator: (req) => req.ip,
});

// Aplica o limitador na rota específica
app.use('/verificar-codigo', limiter); // Substitua '/verificar-codigo' pela rota correta

// Sua lógica de verificação de código
app.post('/verificar-codigo', (req, res) => {
    const { codigo } = req.body;
    if (codigo === '123456') { // Substitua pela lógica de verificação do código
        return res.json({ message: 'Vaga confirmada!' });
    }
    return res.status(400).json({ message: 'Código inválido.' });
});

// Inicia o servidor
app.listen(10000, () => {
    console.log('Servidor rodando na porta 10000');
});
