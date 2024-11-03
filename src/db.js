// db.js
const mysql = require('mysql2');

// Cria e exporta um pool de conexões para gerenciar melhor as conexões
const pool = mysql.createPool({
    host: 'srv1080.hstgr.io', // Atualize com o host correto
    user: 'u293050340_sistemacontrol', // Seu usuário MySQL
    password: 'Rayane@141015', // Substitua pela senha do usuário
    database: 'u293050340_sistema', // Nome do banco de dados
    waitForConnections: true,
    connectionLimit: 10, // Limite de conexões no pool
    queueLimit: 0
});

module.exports = pool.promise();
