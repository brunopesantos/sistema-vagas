const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let vagasRestantes = 10;
const codigoDoDia = "123456";
const tentativasPorIP = {};

// Função para resetar as vagas diariamente
function resetarVagasDiarias() {
    vagasRestantes = 10;
    for (let ip in tentativasPorIP) {
        tentativasPorIP[ip] = 0;
    }
    console.log("Vagas e tentativas resetadas para o novo dia!");
}

// Executa a função de reset a cada 24 horas (86400000 ms)
setInterval(resetarVagasDiarias, 86400000);

// Middleware de limite de tentativas por IP
app.use((req, res, next) => {
    const ip = req.ip;
    if (!tentativasPorIP[ip]) {
        tentativasPorIP[ip] = 0;
    }
    next();
});

// Rota para verificar o código e disponibilidade de vagas
app.post('/api/verify-code', (req, res) => {
    const { codigo } = req.body;
    const ip = req.ip;

    if (tentativasPorIP[ip] >= 2) {
        return res.status(429).json({ message: "Limite de tentativas diárias excedido" });
    }

    if (codigo !== codigoDoDia) {
        tentativasPorIP[ip] += 1;
        console.log(`Tentativa com código incorreto para IP ${ip}. Tentativas: ${tentativasPorIP[ip]}`);
        return res.json({ message: "Código incorreto. Tente novamente." });
    }

    if (vagasRestantes <= 0) {
        return res.json({ message: "Vagas esgotadas." });
    }

    vagasRestantes -= 1;
    tentativasPorIP[ip] += 1;
    console.log(`Vaga confirmada para IP ${ip}. Vagas restantes: ${vagasRestantes}. Tentativas: ${tentativasPorIP[ip]}`);
    res.json({ message: "Vaga confirmada! Redirecionando para a página de venda..." });
});

// Rota para obter o número de vagas restantes
app.get('/api/vagas-restantes', (req, res) => {
    res.json({ vagasRestantes });
});

// Inicia o servidor na porta especificada
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
