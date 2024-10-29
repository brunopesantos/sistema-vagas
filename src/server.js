const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Configurações iniciais
let vagasRestantes = 10;
const codigoDoDia = "123456";
const tentativasDiarias = {}; // Objeto para armazenar tentativas por IP

app.use(cors());
app.use(express.json());

// Função para resetar as vagas diariamente
function resetarVagasDiarias() {
    vagasRestantes = 10;
    console.log("Vagas resetadas para o novo dia!");
}

// Executa a função de reset a cada 24 horas (86400000 ms)
setInterval(resetarVagasDiarias, 86400000);

// Rota para verificar o código e disponibilidade de vagas
app.post('/api/verify-code', (req, res) => {
    const { codigo } = req.body;
    const ip = req.ip;

    // Verifica se o IP já atingiu o limite diário de tentativas
    if (!tentativasDiarias[ip]) {
        tentativasDiarias[ip] = 0;
    }
    if (tentativasDiarias[ip] >= 2) {
        return res.json({ message: "Você já atingiu o limite de tentativas diárias." });
    }

    // Verifica se o código está correto
    if (codigo !== codigoDoDia) {
        tentativasDiarias[ip] += 1;
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

// Inicia o servidor na porta especificada
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
