// Importa o módulo express e o CORS
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Configurações iniciais
let vagasRestantes = 10; // Defina o número inicial de vagas
const codigoDoDia = "123456"; // Código do dia para acesso

// Middleware para habilitar CORS e interpretar JSON
app.use(cors());
app.use(express.json());

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

    // Reduz o número de vagas e confirma o acesso
    vagasRestantes -= 1;
    res.json({ message: "Vaga confirmada! Redirecionando para a página de venda..." });
});

// Endpoint para obter o número de vagas restantes
app.get('/api/vagas-restantes', (req, res) => {
    res.json({ vagasRestantes });
});


// Função para resetar as vagas diariamente
function resetarVagasDiarias() {
    vagasRestantes = 10; // Define o número de vagas que deseja diariamente
    console.log("Vagas resetadas para o novo dia!");
}

// Executa a função de reset a cada 24 horas (86400000 ms)
setInterval(resetarVagasDiarias, 86400000);

// Inicia o servidor na porta especificada
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});

