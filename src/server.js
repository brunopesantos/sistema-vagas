const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser'); // Importa o cookie-parser

const app = express();
const port = process.env.PORT || 3000;

// Configuração inicial
app.use(cors());
app.use(express.json());
app.use(cookieParser()); // Habilita o cookie-parser

// Variáveis de controle
let vagasRestantes = 10;
const codigoDoDia = "123456";
const maxTentativasPorIP = 2;
const maxTentativasPorCookie = 2;

// Função para resetar o número de vagas diariamente
function resetarVagasDiarias() {
    vagasRestantes = 10;
    console.log("Vagas resetadas para o novo dia!");
}
setInterval(resetarVagasDiarias, 86400000); // Reseta a cada 24 horas

// Rota para verificar o código
app.post('/api/verify-code', (req, res) => {
    const { codigo } = req.body;
    const userIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const cookieTentativas = req.cookies['tentativas'] || 0;

    // Verifica se o código está correto
    if (codigo !== codigoDoDia) {
        return res.json({ message: "Código incorreto. Tente novamente." });
    }

    // Verifica o limite de tentativas baseado no IP
    if (req.session[userIP] && req.session[userIP] >= maxTentativasPorIP) {
        return res.json({ message: "Limite diário de tentativas excedido pelo IP." });
    }

    // Verifica o limite de tentativas baseado no cookie
    if (cookieTentativas >= maxTentativasPorCookie) {
        return res.json({ message: "Limite diário de tentativas excedido no dispositivo." });
    }

    // Reduz o número de vagas e incrementa tentativas
    if (vagasRestantes > 0) {
        vagasRestantes -= 1;
        req.session[userIP] = (req.session[userIP] || 0) + 1;
        res.cookie('tentativas', parseInt(cookieTentativas) + 1, { maxAge: 86400000 }); // Incrementa o cookie e define expiração em 24h
        res.json({ message: "Vaga confirmada! Redirecionando para a página de venda..." });
    } else {
        res.json({ message: "Vagas esgotadas." });
    }
});

// Rota para retornar o número de vagas restantes
app.get('/api/vagas-restantes', (req, res) => {
    res.json({ vagasRestantes });
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
