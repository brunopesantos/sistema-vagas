const express = require('express');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(express.json());

// Configuração para confiar no proxy
app.set('trust proxy', 1);

// Limitador de taxa baseado no IP
const limiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 horas
    max: 2, // Limite de 2 tentativas por IP por dia
    message: 'Limite de tentativas diárias excedido. Tente novamente amanhã.'
});

// Aplica o limitador de taxa na rota de verificação do código
app.use('/verificar-codigo', limiter);

// Rota de verificação do código
app.post('/verificar-codigo', (req, res) => {
    const { codigo } = req.body;
    
    // Aqui você pode definir o código correto
    const codigoCorreto = '123456'; // Substitua pelo código desejado
    
    if (codigo === codigoCorreto) {
        return res.json({ message: 'Vaga confirmada!' });
    } else {
        return res.status(400).json({ message: 'Código inválido.' });
    }
});

// Inicia o servidor
const PORT = 10000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
