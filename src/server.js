const express = require('express');
const cors = require('cors'); // Importa o CORS

const app = express();
const port = process.env.PORT || 3000;

app.use(cors()); // Habilita o CORS para todas as rotas
app.use(express.json());

// Configurações iniciais
let vagasRestantes = 10;
const codigoDoDia = "123456";

// Rota para verificar o código e disponibilidade de vagas
app.post('/api/verify-code', (req, res) => {
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

// Inicia o servidor na porta especificada
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
