// server.js
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db'); // Importando o db.js atualizado com o pool de conexões

const app = express();
const PORT = process.env.PORT || 10000;

app.use(bodyParser.json());

// Rota para verificar o código e disponibilidade de vagas
app.post('/api/verify-code', (req, res) => {
    const { codigo } = req.body;
    const codigoDoDia = "1777";

    if (codigo !== codigoDoDia) {
        return res.status(400).json({ message: "Código incorreto. Tente novamente." });
    }

    db.query('SELECT vagasRestantes FROM vagas WHERE id = 1', (err, results) => {
        if (err) {
            console.error('Erro ao buscar vagas:', err);
            return res.status(500).json({ message: 'Erro ao buscar vagas.' });
        }

        if (results.length === 0 || results[0].vagasRestantes <= 0) {
            return res.json({ message: "Vagas esgotadas." });
        }

        const vagasRestantes = results[0].vagasRestantes - 1;
        
        db.query('UPDATE vagas SET vagasRestantes = ? WHERE id = 1', [vagasRestantes], (err) => {
            if (err) {
                console.error('Erro ao atualizar vagas:', err);
                return res.status(500).json({ message: 'Erro ao atualizar vagas.' });
            }
            res.json({ message: "Vaga confirmada! Redirecionando para a página de venda..." });
        });
    });
});

// Rota para verificar o número de vagas restantes
app.get('/api/vagas-restantes', (req, res) => {
    db.query('SELECT vagasRestantes FROM vagas WHERE id = 1', (err, results) => {
        if (err) {
            console.error('Erro ao buscar vagas:', err);
            return res.status(500).json({ message: 'Erro ao buscar vagas.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Nenhuma informação de vagas encontrada.' });
        }

        res.json({ vagasRestantes: results[0].vagasRestantes });
    });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
