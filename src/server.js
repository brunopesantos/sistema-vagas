const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Configurações iniciais
let vagasRestantes = 10;
const codigoDoDia = "123456";
const tentativasDiarias = {}; // Armazena tentativas diárias por IP

app.use(cors());
app.use(express.json());

// Função para resetar as vagas e tentativas diariamente
function resetarDiariamente() {
    vagasRestantes = 10;
    for (const ip in tentativasDiarias) {
        tentativasDiarias[ip] = 0; // Reseta as tentativas diárias para cada IP
    }
    console.log("Vagas e tentativas resetadas para o novo dia!");
}

// Executa a função de reset a cada 24 horas (86400000 ms)
setInterval(resetarDiariamente, 86400000);

// Rota para verificar o código e disponibilidade de vagas
app.post('/api/verify-code', (req, res) => {
    const { codigo } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    console.log(`Tentativa de acesso do IP: ${ip}`); // Loga o IP para depuração

    // Inicializa as tentativas para o IP, se necessário
    if (!tentativasDiarias[ip]) {
        tentativasDiarias[ip] = 0;
    }

    // Verifica se o IP já atingiu o limite diário de tentativas
    if (tentativasDiarias[ip] >= 2) {
        return res.json({ message: "Você já atingiu o limite de tentativas diárias." });
    }

    // Verifica se o código está correto
    if (codigo !== codigoDoDia) {
        tentativasDiarias[ip] += 1; // Incrementa as tentativas para o IP
        return res.json({ message: "Código incorreto. Tente novamente." });
    }

    // Verifica se ainda há vagas
    if (vagasRestantes <= 0) {
        return res.json({ message: "Vagas esgotadas." });
    }

    // Reduz o número de vagas e confirma
    vagasRestantes -= 1;
    tentativasDiarias[ip] += 1;

    res.json({ message: "Vaga confirmada! Redirecionando para a página de venda..." });
});

// Rota para retornar o número de vagas restantes
app.get('/api/vagas-restantes', (req, res) => {
    res.json({ vagasRestantes });
});

// Rota para resetar tentativas e vagas (para testes temporários)
app.get('/api/reset-tentativas-e-vagas', (req, res) => {
    vagasRestantes = 10; // Define o número de vagas conforme necessário
    for (const ip in tentativasDiarias) {
        tentativasDiarias[ip] = 0; // Reseta tentativas diárias para todos os IPs
    }
    res.json({ message: "Tentativas e vagas resetadas para o teste." });
});

// Inicia o servidor na porta especificada
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
