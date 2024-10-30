const express = require('express');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const app = express();
const PORT = 10000;

app.use(express.json());
app.use(cookieParser());

// Variáveis de controle
let vagasRestantes = 10;
const codigoDoDia = '123456';
const maxTentativasPorIP = 5;

// Configuração do limitador por IP
const accessLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 horas
  max: maxTentativasPorIP, // número máximo de tentativas por IP por dia
  message: 'Número de tentativas excedido para este IP. Tente novamente amanhã.',
  keyGenerator: (req) => req.ip, // usa o IP do usuário para limitar
});

// Middleware para verificar o limite de tentativas com cookies
function limitarAcessoCookie(req, res, next) {
  const tentativasCookie = req.cookies.tentativas || 0;

  if (tentativasCookie >= 2) {
    return res.status(429).json({ message: 'Tentativas diárias excedidas.' });
  } else {
    res.cookie('tentativas', Number(tentativasCookie) + 1, { maxAge: 24 * 60 * 60 * 1000 }); // incrementa tentativas
    next();
  }
}

// Rota para verificar o código e reduzir as vagas
app.post('/api/verify-code', [accessLimiter, limitarAcessoCookie], (req, res) => {
  const { codigo } = req.body;

  if (codigo === codigoDoDia && vagasRestantes > 0) {
    vagasRestantes -= 1;
    res.json({ message: 'Vaga confirmada! Redirecionando para a página de venda...' });
  } else if (vagasRestantes <= 0) {
    res.json({ message: 'Vagas esgotadas para hoje.' });
  } else {
    res.json({ message: 'Código incorreto. Tente novamente.' });
  }
});

// Rota para retornar o número de vagas restantes
app.get('/api/vagas-restantes', (req, res) => {
  res.json({ vagasRestantes });
});

// Rota para resetar as vagas (pode ser chamada manualmente ou por cron job)
app.post('/api/reset-vagas', (req, res) => {
  vagasRestantes = 10;
  res.json({ message: 'Vagas resetadas para o novo dia.' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
