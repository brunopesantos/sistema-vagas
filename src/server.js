const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Configuração do trust proxy
app.set('trust proxy', 1); // Confia no primeiro proxy para obter o IP correto

// Configuração do limitador de tentativas por IP
const limiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 horas
    max: 2, // Limita a 2 tentativas por IP por dia
    keyGenerator: (req) => req.ip, // Usa o IP diretamente
    handler: (req, res) => {
        res.status(429).json({
            message: 'Você excedeu o limite de tentativas diárias.',
        });
    },
});

// Configurações iniciais
let vagasRestantes = 10;
const codigoDoDia = "123456";

// Rota para verificar o código e disponibilidade de vagas
app.post('/api/verify-code', limiter, (req, res) => {
    const { codigo } = req.body;

    if (codigo !== codigoDoDia) {
        return res.json({ message: "Código incorreto. Tente novamente." });
    }

    if (vagasRestantes <= 0) {
        return res.json({ message: "Vagas esgotadas." });
    }

    vagasRestantes -= 1;
    res.json({ message: "Vaga confirmada! Redirecionando para a página de venda..." });
});

// Rota para obter o número de vagas restantes
app.get('/api/vagas-restantes', (req, res) => {
    res.json({ vagasRestantes });
});

// Função para resetar as vagas diariamente
function resetarVagasDiarias() {
    vagasRestantes = 10;
    console.log("Vagas resetadas para o novo dia!");
}

// Executa a função de reset a cada 24 horas (86400000 ms)
setInterval(resetarVagasDiarias, 86400000);

// Inicia o servidor na porta especificada
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
