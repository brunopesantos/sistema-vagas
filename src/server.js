const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

// Dados para armazenamento temporário de tentativas por IP
let accessData = {};

// Função de middleware para limitar o acesso baseado em IP
app.use((req, res, next) => {
    const ip = req.ip; 
    const maxAttempts = 2; // Limite de tentativas
    const timeWindow = 24 * 60 * 60 * 1000; // Janela de tempo de 24 horas

    console.log(`\n--- Verificação de acesso ---`);
    console.log(`IP do usuário: ${ip}`);

    // Verificação por IP
    if (!accessData[ip]) {
        accessData[ip] = { attempts: 1, timestamp: Date.now() };
        console.log(`Primeira tentativa registrada para o IP ${ip}`);
    } else {
        const elapsedTime = Date.now() - accessData[ip].timestamp;
        if (elapsedTime < timeWindow) {
            if (accessData[ip].attempts >= maxAttempts) {
                console.log(`Limite de tentativas por IP excedido para IP ${ip}`);
                return res.status(429).json({ message: 'Limite de tentativas excedido para este IP.' });
            }
            accessData[ip].attempts += 1;
            console.log(`Tentativa incrementada para o IP ${ip}, número de tentativas: ${accessData[ip].attempts}`);
        } else {
            accessData[ip] = { attempts: 1, timestamp: Date.now() };
            console.log(`Janela de tempo renovada para o IP ${ip}`);
        }
    }

    next();
});

// Endpoint para verificar o código e permitir acesso
app.post('/api/verify-code', (req, res) => {
    const { codigo } = req.body;
    const codigoCorreto = '123456'; // Código correto para teste

    if (codigo === codigoCorreto) {
        console.log(`Código correto inserido para IP ${req.ip}`);
        return res.json({ message: 'Vaga confirmada! Redirecionando para a página de venda...' });
    } else {
        console.log(`Código incorreto inserido para IP ${req.ip}`);
        return res.status(400).json({ message: 'Código incorreto. Tente novamente.' });
    }
});

// Endpoint para exibir o número de vagas restantes
app.get('/api/vagas-restantes', (req, res) => {
    const vagasRestantes = 10; // Valor fixo para exemplo
    console.log(`Número de vagas restantes solicitado: ${vagasRestantes}`);
    res.json({ vagasRestantes });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
