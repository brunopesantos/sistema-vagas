const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken'); // Importa o pacote JWT

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let vagasRestantes = 10;
const codigoDoDia = "123456";
const limiteTentativasPorIP = 2;
const tentativasPorIP = {};

// Configura o segredo para o token JWT
const jwtSecret = 'seuSegredoSeguranca';

// Função para resetar as vagas diariamente
function resetarVagasDiarias() {
    vagasRestantes = 10;
    Object.keys(tentativasPorIP).forEach(ip => {
        tentativasPorIP[ip] = 0;
    });
    console.log("Vagas e tentativas resetadas para o novo dia!");
}

setInterval(resetarVagasDiarias, 86400000);

app.post('/api/verify-code', (req, res) => {
    const { codigo } = req.body;
    const ip = req.ip;

    if (tentativasPorIP[ip] === undefined) {
        tentativasPorIP[ip] = 0;
    }

    if (tentativasPorIP[ip] >= limiteTentativasPorIP) {
        return res.status(429).json({ message: "Limite de tentativas atingido. Tente novamente amanhã." });
    }

    if (codigo !== codigoDoDia) {
        tentativasPorIP[ip] += 1;
        return res.json({ message: "Código incorreto. Tente novamente." });
    }

    if (vagasRestantes <= 0) {
        return res.json({ message: "Vagas esgotadas." });
    }

    vagasRestantes -= 1;
    
    // Gera um token JWT com validade de 24 horas
    const token = jwt.sign({ access: 'autorizado' }, jwtSecret, { expiresIn: '24h' });

    res.json({ message: "Vaga confirmada! Redirecionando para a página de venda...", token });
});

app.get('/api/vagas-restantes', (req, res) => {
    res.json({ vagasRestantes });
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});



