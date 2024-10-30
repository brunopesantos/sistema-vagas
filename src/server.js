const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Configurações iniciais
let vagasRestantes = 10;
const codigoDoDia = "123456";
const tentativasPorIp = new Map(); // Armazena o número de tentativas por IP

// Limite de tentativas diárias por IP
const maxTentativas = 2;

// Limita o número de requisições para evitar tentativas excessivas
const limiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 horas
    max: maxTentativas,
    message: "Limite de tentativas diárias excedido. Tente novamente amanhã."
});

app.use('/api/verify-code', limiter);

// Função para resetar as vagas diariamente
function resetarVagasDiarias() {
    vagasRestantes = 10;
    tentativasPorIp.clear(); // Reseta as tentativas diárias de todos os IPs
    console.log("Vagas e tentativas resetadas para o novo dia!");
}

// Reseta as vagas e tentativas diariamente
setInterval(resetarVagasDiarias, 24 * 60 * 60 * 1000);

// Endpoint para verificar o código e disponibilidade de vagas
app.post('/api/verify-code', (req, res) => {
    const ip = req.ip;
    const { codigo } = req.body;

    // Log de IP e código inserido
    console.log(`Tentativa de acesso do IP: ${ip} com o código: ${codigo}`);

    // Verifica o código do dia
    if (codigo !== codigoDoDia) {
        console.log("Código incorreto inserido");
        return res.json({ message: "Código incorreto. Tente novamente." });
    }

    // Verifica se ainda há vagas
    if (vagasRestantes <= 0) {
        console.log("Vagas esgotadas");
        return res.json({ message: "Vagas esgotadas." });
    }

    // Atualiza as tentativas do IP
    const tentativas = tentativasPorIp.get(ip) || 0;
    if (tentativas >= maxTentativas) {
        console.log(`IP ${ip} excedeu o número de tentativas diárias.`);
        return res.status(429).json({ message: "Limite de tentativas diárias excedido." });
    }

    tentativasPorIp.set(ip, tentativas + 1);

    // Reduz o número de vagas e confirma o acesso
    vagasRestantes -= 1;
    console.log(`Vaga confirmada para IP ${ip}. Vagas restantes: ${vagasRestantes}`);
    res.json({ message: "Vaga confirmada! Redirecionando para a página de venda..." });
});

// Endpoint para obter o número de vagas restantes
app.get('/api/vagas-restantes', (req, res) => {
    res.json({ vagasRestantes });
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
