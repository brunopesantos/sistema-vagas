const express = require('express');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(cookieParser()); // Middleware para manipular cookies

// Dados para armazenamento temporário de tentativas por IP
let accessData = {};

// Função de middleware para limitar o acesso baseado em IP e cookies
app.use((req, res, next) => {
    const ip = req.ip; 
    const maxAttempts = 2; // Limite de tentativas
    const timeWindow = 24 * 60 * 60 * 1000; // Janela de tempo de 24 horas

    // Verificação de cookie
    if (!req.cookies.userAttempt) {
        res.cookie('userAttempt', 1, { maxAge: timeWindow });
    } else {
        const cookieAttempts = parseInt(req.cookies.userAttempt, 10);
        if (cookieAttempts >= maxAttempts) {
            return res.status(429).json({ message: 'Limite de tentativas excedido. Tente novamente amanhã.' });
        }
        res.cookie('userAttempt', cookieAttempts + 1, { maxAge: timeWindow });
    }

    // Verificação por IP
    if (!accessData[ip]) {
        accessData[ip] = { attempts: 1, timestamp: Date.now() };
    } else {
        const elapsedTime = Date.now() - accessData[ip].timestamp;
        if (elapsedTime < timeWindow) {
            if (accessData[ip].attempts >= maxAttempts) {
                return res.status(429).json({ message: 'Limite de tentativas excedido para este IP.' });
            }
            accessData[ip].attempts += 1;
        } else {
            accessData[ip] = { attempts: 1, timestamp: Date.now() };
        }
    }

    next();
});

// Endpoint para verificar o código e permitir acesso
app.post('/api/verify-code', (req, res) => {
    const { codigo } = req.body;
    const codigoCorreto = '123456'; // Código correto para teste

    if (codigo === codigoCorreto) {
        return res.json({ message: 'Vaga confirmada! Redirecionando para a página de venda...' });
    } else {
        return res.status(400).json({ message: 'Código incorreto. Tente novamente.' });
    }
});

// Endpoint para exibir o número de vagas restantes
app.get('/api/vagas-restantes', (req, res) => {
    const vagasRestantes = 10; // Valor fixo para exemplo
    res.json({ vagasRestantes });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
