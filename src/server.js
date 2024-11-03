const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Configuração inicial de vagas e tentativas
let vagasRestantes = 3; // Número de vagas deve ser atualizado manualmente
const codigoDoDia = "1777";
const tentativasPorIP = {};

// Função para obter o IP do cliente mesmo através de proxies
function obterIP(req) {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    return ip.split(',')[0].trim(); // pega apenas o primeiro IP no caso de múltiplos IPs no cabeçalho
}

// Rota para verificar o código e disponibilidade de vagas
app.post('/api/verify-code', (req, res) => {
    const { codigo } = req.body;
    const ip = obterIP(req);

    if (!tentativasPorIP[ip]) {
        tentativasPorIP[ip] = 0;
    }

    if (tentativasPorIP[ip] >= 2) {
        console.log(`IP ${ip} excedeu o limite diário de tentativas.`);
        return res.status(429).json({ message: "Limite de tentativas diárias excedido" });
    }

    if (codigo !== codigoDoDia) {
        tentativasPorIP[ip] += 1;
        console.log(`Tentativa com código incorreto para IP ${ip}. Tentativas: ${tentativasPorIP[ip]}`);
        return res.json({ message: "Código incorreto. Tente novamente." });
    }

    if (vagasRestantes <= 0) {
        console.log(`Vagas esgotadas. Tentativa de acesso bloqueada para IP ${ip}`);
        return res.status(403).json({ message: "Vagas esgotadas." });
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
