// server.js atualizado com logs detalhados
const express = require('express');
const cors = require('cors');
const db = require('./db');
const app = express();

app.use(express.json());

// Configure o CORS para permitir o seu domínio
app.use(cors({
    origin: 'https://robodevendasautomaticas.com.br', // Substitua pelo domínio da sua página de cadastro
    methods: 'GET,POST',
    allowedHeaders: 'Content-Type',
}));

// Função para obter o IP do usuário
function getClientIp(req) {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    return ip.split(',')[0]; // Caso haja múltiplos IPs, pegue o primeiro
}

// Rota para verificar vagas restantes
app.get('/api/vagas-restantes', async (req, res) => {
    try {
        console.log(`[LOG] Requisição recebida: Método: GET, URL: /api/vagas-restantes, IP: ${getClientIp(req)}`);
        const [results] = await db.query('SELECT vagasRestantes FROM vagas WHERE id = 1');
        if (results.length === 0) {
            console.warn('[AVISO] Nenhuma vaga encontrada no banco de dados.');
            return res.status(404).json({ message: 'Nenhuma vaga encontrada.' });
        }
        console.log(`[LOG] Vagas restantes: ${results[0].vagasRestantes}`);
        res.json({ vagasRestantes: results[0].vagasRestantes });
    } catch (error) {
        console.error('Erro ao buscar vagas:', error);
        res.status(500).json({ message: 'Erro ao buscar vagas.' });
    }
});

// Rota para verificar o código e atualizar as vagas
app.post('/api/verify-code', async (req, res) => {
    const { codigo } = req.body;
    const codigoDoDia = "2323";
    const ip = getClientIp(req);

    console.log(`[LOG] Requisição recebida: Método: POST, URL: /api/verify-code, IP: ${ip}`);
    if (codigo !== codigoDoDia) {
        console.warn(`[AVISO] Código incorreto inserido por IP: ${ip}`);
        return res.status(400).json({ message: "Código incorreto. Tente novamente." });
    }

    try {
        // Verifique se o IP já atingiu o limite de tentativas diárias
        const [tentativaResults] = await db.query('SELECT * FROM tentativas WHERE ip = ? AND data = CURDATE()', [ip]);
        if (tentativaResults.length > 0 && tentativaResults[0].tentativas >= 3) {
            console.warn(`[AVISO] IP ${ip} atingiu o limite de tentativas diárias.`);
            return res.status(429).json({ message: 'Limite de tentativas diárias atingido. Tente novamente amanhã.' });
        }

        // Atualize ou insira o registro de tentativas
        if (tentativaResults.length > 0) {
            await db.query('UPDATE tentativas SET tentativas = tentativas + 1 WHERE ip = ? AND data = CURDATE()', [ip]);
            console.log(`[LOG] Tentativas atualizadas para IP ${ip}. Total de tentativas hoje: ${tentativaResults[0].tentativas + 1}`);
        } else {
            await db.query('INSERT INTO tentativas (ip, data, tentativas) VALUES (?, CURDATE(), 1)', [ip]);
            console.log(`[LOG] Nova tentativa registrada para IP ${ip}.`);
        }

        // Verifique e atualize as vagas
        const [results] = await db.query('SELECT vagasRestantes FROM vagas WHERE id = 1');
        if (results.length === 0 || results[0].vagasRestantes <= 0) {
            console.warn(`[AVISO] Vagas esgotadas. IP ${ip} tentou acessar sem sucesso.`);
            return res.json({ message: "Vagas esgotadas." });
        }

        const novasVagas = results[0].vagasRestantes - 1;
        await db.query('UPDATE vagas SET vagasRestantes = ? WHERE id = 1', [novasVagas]);
        console.log(`[SUCESSO] Vaga confirmada para IP ${ip}. Vagas restantes: ${novasVagas}`);

        res.json({ message: "Vaga confirmada! Redirecionando para a página de venda..." });
    } catch (error) {
        console.error('Erro ao buscar ou atualizar vagas:', error);
        res.status(500).json({ message: 'Erro ao buscar ou atualizar vagas.' });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
