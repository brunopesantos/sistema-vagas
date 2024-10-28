// Importa o módulo express
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Middleware para interpretar JSON
app.use(express.json());

// Rota para a URL raiz
app.get('/', (req, res) => {
    res.send('Servidor está funcionando!');
});

// Exemplo de rota POST para registro de acesso
app.post('/api/register-access', (req, res) => {
    // Coloque aqui a lógica de registro de acesso
    res.send('Acesso registrado com sucesso!');
});

// Inicia o servidor na porta especificada
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
