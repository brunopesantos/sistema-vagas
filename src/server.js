// Importa os módulos necessários
const express = require('express');
const cors = require('cors'); // Middleware para habilitar CORS
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Configuração de vagas e código
let vagasRestantes = 10;
const codigoDoDia = "123456";

// Objeto para armazenar tentativas por IP
let tentativasPorIP = {};

// Função para resetar vagas e tentativas diariamente
function resetarDiariamente() {
    vagasRestantes = 10;
    tentativasPorIP = {};
    console.log("Vagas e tentativas resetadas para o novo dia!");
}

// Define o reset diário para todas as 24 horas (86400000 ms)
setInterval(resetarDiariamente, 86400000);

// Rota para verificar código e controlar tentativas
app.post('/api/verify-code', (req, res) => {
    const { codigo } = req.body;
    const ipUsuario = req.ip; // Captura o IP do usuário

    // Inicializa as tentativas para o IP se não existir
    if (!tentativasPorIP[ipUsuario]) {
        tentativasPorIP[ipUsuario] = 0;
    }

    // Verifica se o usuário excedeu as tentativas diárias
    if (tentativasPorIP[ipUsuario] >= 2) {
        return res.json({ message: "Você excedeu o número de tentativas diárias." });
    }

    // Verifica se o código está correto
    if (codigo !== codigoDoDia) {
        tentativasPorIP[ipUsuario] += 1; // Incrementa tentativa
        return res.json({ message: "Código incorreto. Tente novamente." });
    }

    // Verifica se ainda há vagas
    if (vagasRestantes <= 0) {
        return res.json({ message: "Vagas esgotadas." });
    }

    // Reduz vagas, incrementa tentativa e confirma o acesso
    vagasRestantes -= 1;
    tentativasPorIP[ipUsuario] += 1;
    res.json({ message: "Vaga confirmada! Redirecionando para a página de venda..." });
});

// Rota para obter vagas restantes
app.get('/api/vagas-restantes', (req, res) => {
    res.json({ vagasRestantes });
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});


