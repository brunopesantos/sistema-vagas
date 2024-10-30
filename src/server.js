const express = require('express');
const rateLimit = require('express-rate-limit');

const app = express();

// Configure o trust proxy
app.set('trust proxy', 1);

// Limite de requisições por IP para duas tentativas por dia
const limiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 horas
    max: 2, // Permite 2 requisições
    message: 'Limite de tentativas diárias excedido. Tente novamente amanhã.',
    handler: (req, res) => {
        res.status(429).json({ message: 'Limite de tentativas diárias excedido. Tente novamente amanhã.' });
    },
    keyGenerator: (req) => req.ip,
});

app.use('/sua-rota-de-verificacao', limiter);

// Resto do seu código do servidor

app.listen(10000, () => {
    console.log('Servidor rodando na porta 10000');
});
