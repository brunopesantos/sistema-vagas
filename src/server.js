const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let vagasRestantes = 50;
const codigoDoDia = "1777";
let tentativasPorIP = {};

console.log("Tentativas diárias resetadas ao iniciar o servidor.");

function obterIP(req) {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    return ip.split(',')[0].trim();
}

app.use((req, res, next) => {
    // Log para cada requisição recebida com detalhes do método e URL
    console.log(`[LOG] Requisição recebida: Método: ${req.method}, URL: ${req.originalUrl}, IP: ${obterIP(req)}`);
    next();
});

app.post('/api/verify-code', (req, res) => {
    const { codigo } = req.body;
    const ip = obterIP(req);

    console.log(`[DEBUG] Verificando IP ${ip}`);

    if (!tentativasPorIP[ip]) {
        tentativasPorIP[ip] = 0;
    }

    if (tentativasPorIP[ip] >= 4) {
        console.log(`[AVISO] IP ${ip} excedeu o limite diário de tentativas.`);
        return res.status(429).json({ message: "Limite de tentativas diárias excedido" });
    }

    if (codigo !== codigoDoDia) {
        tentativasPorIP[ip] += 1;
        console.log(`[ERRO] Tentativa com código incorreto para IP ${ip}. Tentativas: ${tentativasPorIP[ip]}`);
        return res.json({ message: "Código incorreto. Tente novamente." });
    }

    if (vagasRestantes <= 0) {
        console.log(`[INFO] Tentativa de acesso bloqueada para IP ${ip} por falta de vagas.`);
        return res.json({ message: "Vagas esgotadas." });
    }

    vagasRestantes -= 1;
    tentativasPorIP[ip] += 1;
    console.log(`[SUCESSO] Vaga confirmada para IP ${ip}. Vagas restantes: ${vagasRestantes}. Tentativas: ${tentativasPorIP[ip]}`);
    res.json({ message: "Vaga confirmada! Redirecionando para a página de venda..." });
});

app.get('/api/vagas-restantes', (req, res) => {
    res.json({ vagasRestantes });
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
