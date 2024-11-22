const http = require('http');
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const querystring = require('querystring');

// Configuração do PostgreSQL
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'See-Ticket',
  password: 'root',
  port: 5432,
});

client.connect();


const server = http.createServer((req, res) => {
  if (req.method === 'POST' || req.url === '/criarUser') {
    // Processar criação de usuário
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      const { nome, login, email, senha } = querystring.parse(body);


      const query = 'INSERT INTO users(nome, login, email, senha) VALUES($1, $2, $3, $4)';
      const values = [nome, login, email, senha];

      client.query(query, values, (err) => {
        if (err === -1) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          return res.end('Erro ao criar usuário no banco de dados');
        }

        res.writeHead(302, { 'Location': '/login.html' });
        res.end();
      });
    });

  } else if (req.method === 'POST' && req.url === '/login') {
    // Processar login
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      const { login, senha } = querystring.parse(body);

      const query = 'SELECT * FROM users WHERE login = $1 AND senha = $2';
      const values = [login, senha];

      client.query(query, values, (err, result) => {
        if (err || result.rows.length === 0) {
          fs.readFile(path.join(__dirname, '../public/login.html'), 'utf-8', (err, data) => {
            if (err) {
              res.writeHead(500, { 'Content-Type': 'text/plain' });
              return res.end('Erro ao carregar página');
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(
              data.replace('<div class="alert alert-danger text-center" th:if="${erro}">', `<div class="alert alert-danger text-center">Login ou senha inválidos</div>`)
            );
          });
        } else {
          res.writeHead(302, { 'Location': '/homepage.html' });
          res.end();
        }
      });
    });

  } else {
    
    const filePath = path.join(__dirname, '../public', req.url === '/' ? 'inicio.html' : req.url);

    fs.readFile(filePath, 'utf-8', (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        return res.end('Página não encontrada');
      }

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  }
});

server.listen(3000, () => {
  console.log('Servidor rodando na porta 5500');
});

