const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser'); // Importando o cookie-parser

const app = express();
app.set('trust proxy', 1);
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(cookieParser()); // Usando o cookie-parser

// Configuração de limite de tentativas por IP
const limiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 horas
    max: 2, // Limite de tentativas por dia
    message: "Você excedeu o limite diário de tentativas."
});

// Middleware para limitar tentativas
app.use('/api/verify-code', limiter);

// Variáveis iniciais
let vagasRestantes = 10;
const codigoDoDia = "123456";

// Rota para verificar o código e disponibilidade de vagas
app.post('/api/verify-code', (req, res) => {
    const { codigo } = req.body;

    if (codigo !== codigoDoDia) {
        return res.status(400).json({ message: "Código incorreto. Tente novamente." });
    }

    if (vagasRestantes <= 0) {
        return res.status(400).json({ message: "Vagas esgotadas." });
    }

    vagasRestantes -= 1;
    res.cookie('access_granted', 'true', { maxAge: 24 * 60 * 60 * 1000, httpOnly: true }); // Define cookie para controle
    res.json({ message: "Vaga confirmada! Redirecionando para a página de venda..." });
});

// Rota para retornar o número de vagas restantes
app.get('/api/vagas-restantes', (req, res) => {
    res.json({ vagasRestantes });
});

// Inicialização do servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
