const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser'); // Importa o cookie-parser
const rateLimit = require('express-rate-limit');

const app = express();
const port = process.env.PORT || 3000;

// Configuração do CORS e cookies
app.use(cors());
app.use(express.json());
app.use(cookieParser()); // Habilita o uso de cookies

// Limite de tentativas diárias por IP
const dailyAccessLimit = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 horas
    max: 2, // Limita a 2 tentativas por IP
    message: { message: 'Você excedeu o limite diário de tentativas.' },
    keyGenerator: (req) => req.ip
});

app.use('/api/verify-code', dailyAccessLimit);

// Configurações iniciais de vagas
let vagasRestantes = 10;
const codigoDoDia = "123456"; // Código do dia

// Rota para verificar o código e reduzir vagas
app.post('/api/verify-code', (req, res) => {
    const { codigo } = req.body;
    const userIP = req.ip;

    // Verifica o código do dia
    if (codigo !== codigoDoDia) {
        return res.status(400).json({ message: "Código incorreto. Tente novamente." });
    }

    // Verifica se há vagas disponíveis
    if (vagasRestantes <= 0) {
        return res.status(400).json({ message: "Vagas esgotadas." });
    }

    // Reduz uma vaga e armazena o status de acesso diário por IP
    vagasRestantes -= 1;
    res.cookie(`access_${userIP}`, true, { maxAge: 24 * 60 * 60 * 1000 }); // Cookie de controle de acesso diário
    res.json({ message: "Vaga confirmada! Redirecionando para a página de venda..." });
});

// Rota para retornar o número de vagas restantes
app.get('/api/vagas-restantes', (req, res) => {
    res.json({ vagasRestantes });
});

// Função para resetar as vagas diariamente
function resetarVagasDiarias() {
    vagasRestantes = 10;
    console.log("Vagas resetadas para o novo dia!");
}

// Executa a função de reset a cada 24 horas
setInterval(resetarVagasDiarias, 24 * 60 * 60 * 1000);

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
