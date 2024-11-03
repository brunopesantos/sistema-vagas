const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Função para buscar o número de vagas
function obterVagas(callback) {
    db.get(`SELECT vagasRestantes FROM vagas WHERE id = 1`, (err, row) => {
        if (err) {
            console.error('Erro ao buscar vagas:', err);
            callback(err, null);
        } else {
            callback(null, row.vagasRestantes);
        }
    });
}

// Função para atualizar o número de vagas
function atualizarVagas(novasVagas, callback) {
    db.run(`UPDATE vagas SET vagasRestantes = ? WHERE id = 1`, [novasVagas], (err) => {
        if (err) {
            console.error('Erro ao atualizar vagas:', err);
            callback(err);
        } else {
            callback(null);
        }
    });
}

// Rota para verificar o código e disponibilidade de vagas
app.post('/api/verify-code', (req, res) => {
    const { codigo } = req.body;
    const codigoDoDia = "1777";

    if (codigo !== codigoDoDia) {
        return res.status(400).json({ message: "Código incorreto. Tente novamente." });
    }

    obterVagas((err, vagasRestantes) => {
        if (err) {
            return res.status(500).json({ message: 'Erro ao buscar vagas.' });
        }

        if (vagasRestantes <= 0) {
            return res.json({ message: "Vagas esgotadas." });
        }

        const novasVagas = vagasRestantes - 1;
        atualizarVagas(novasVagas, (err) => {
            if (err) {
                return res.status(500).json({ message: 'Erro ao atualizar vagas.' });
            }
            res.json({ message: "Vaga confirmada! Redirecionando para a página de venda..." });
        });
    });
});

// Rota para obter o número de vagas restantes
app.get('/api/vagas-restantes', (req, res) => {
    obterVagas((err, vagasRestantes) => {
        if (err) {
            return res.status(500).json({ message: 'Erro ao buscar vagas.' });
        }
        res.json({ vagasRestantes });
    });
});

// Rota para redefinir o número de vagas
app.post('/api/redefinir-vagas', (req, res) => {
    const { novasVagas } = req.body;
    if (typeof novasVagas !== 'number' || novasVagas < 0) {
        return res.status(400).json({ message: 'Número de vagas inválido' });
    }

    atualizarVagas(novasVagas, (err) => {
        if (err) {
            return res.status(500).json({ message: 'Erro ao redefinir vagas.' });
        }
        res.json({ message: `Número de vagas redefinido para ${novasVagas}` });
    });
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
