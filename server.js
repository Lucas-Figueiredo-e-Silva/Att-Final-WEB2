const WebSocket = require('ws');
const express = require('express');
const path = require('path');

const app = express();
const PORT = 8080;

app.use(express.static(path.join(__dirname, 'public')));

const server = app.listen(PORT, () => {
    console.log(`Servidor HTTP iniciado em http://localhost:${PORT}`);
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('Novo cliente conectado');

    ws.on('message', (message) => {
        console.log('Mensagem recebida: %s', message);
        ws.send(`Echo: ${message}`);
    });

    ws.on('close', () => {
        console.log('Cliente desconectado');
    });
});




