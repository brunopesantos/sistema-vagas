const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'srv1080.hstgr.io', // Host correto
    user: 'u293050340_sistemacontrol', // Usuário MySQL
    password: 'Rayane141015', // Senha do usuário
    database: 'u293050340_sistema' // Nome do banco de dados
});

connection.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        return;
    }
    console.log('Conectado ao banco de dados MySQL da Hostinger');
});

module.exports = connection;
