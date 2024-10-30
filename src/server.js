const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit'); // Limite de tentativas por IP

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Configuração para confiar no proxy da Render
app.set('trust proxy', 1);

// Configurações iniciais
let vagasRestantes = 10;
const codigoDoDia = "123456";

// Função para resetar as vagas diariamente
function resetarVagasDiarias() {
    vagasRestantes = 10;
    console.log("Vagas resetadas para o novo dia!");
}

// Executa a função de reset a cada 24 horas (86400000 ms)
setInterval(resetarVagasDiarias, 86400000);

// Limite de tentativas por IP para a rota de verificação de código
const limiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 horas
    max: 2, // Limite de 2 tentativas por dia
    message: 'Limite de tentativas diárias excedido.',
    keyGenerator: (req) => req.ip // Garante que o IP do cliente é usado como chave
});

// Rota para verificar o código e disponibilidade de vagas com limite de tentativas
app.post('/api/verify-code', limiter, (req, res) => {
    const { codigo } = req.body;

    // Verifica se o código está correto
    if (codigo !== codigoDoDia) {
        return res.json({ message: "Código incorreto. Tente novamente." });
    }

    // Verifica se ainda há vagas
    if (vagasRestantes <= 0) {
        return res.json({ message: "Vagas esgotadas." });
    }

    // Reduz o número de vagas e confirma
    vagasRestantes -= 1;
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
