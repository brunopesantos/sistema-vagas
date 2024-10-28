const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors()); // Habilita CORS para permitir acesso do frontend

const maxDailyUses = 4; // Número máximo de acessos diários para todos os usuários
const usageFile = 'usage.json';

// Função para carregar o número de acessos do arquivo
function loadUsage() {
    try {
        const data = fs.readFileSync(usageFile);
        return JSON.parse(data);
    } catch (error) {
        return { date: new Date().toISOString().slice(0, 10), count: 0 };
    }
}

// Função para salvar o número de acessos no arquivo
function saveUsage(data) {
    fs.writeFileSync(usageFile, JSON.stringify(data));
}

// Rota para verificar se ainda há acessos disponíveis
app.get('/api/check-access', (req, res) => {
    const usageData = loadUsage();
    const today = new Date().toISOString().slice(0, 10);

    // Reinicia o contador se for um novo dia
    if (usageData.date !== today) {
        usageData.date = today;
        usageData.count = 0;
        saveUsage(usageData);
    }

    if (usageData.count >= maxDailyUses) {
        res.json({ accessAllowed: false });
    } else {
        res.json({ accessAllowed: true });
    }
});

// Rota para registrar um novo acesso
app.post('/api/register-access', (req, res) => {
    const usageData = loadUsage();
    const today = new Date().toISOString().slice(0, 10);

    // Reinicia o contador se for um novo dia
    if (usageData.date !== today) {
        usageData.date = today;
        usageData.count = 0;
    }

    if (usageData.count < maxDailyUses) {
        usageData.count += 1;
        saveUsage(usageData);
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
