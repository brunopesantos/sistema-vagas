// Importa o módulo express
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Middleware para interpretar JSON
app.use(express.json());

// Configurações iniciais (exemplo simples para controle de vagas e código do dia)
let vagasRestantes = 10; // Defina o número de vagas
const codigoDoDia = "123456"; // Exemplo de código, pode ser dinâmico

// Rota para verificar o código e disponibilidade de vagas
app.post('/api/verify-code', (req, res) => {
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

// Inicia o servidor na porta especificada
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
