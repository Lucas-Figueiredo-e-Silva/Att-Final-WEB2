const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');

// Configuração do servidor
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// Servindo arquivos estáticos (HTML, CSS, JS)
app.use(express.static(__dirname + '/public'));

// Carregar perguntas e respostas
const questions = JSON.parse(fs.readFileSync('questions.json', 'utf8'));

// Armazenar pontuações de todos os clientes
let clients = {};

// Lógica do servidor WebSocket
io.on('connection', (socket) => {
    console.log('Novo cliente conectado: ', socket.id);

    // Armazenar o nome do cliente e pontuação
    let clientName = '';
    let score = { correct: 0, incorrect: 0 };

    socket.on('set_name', (name) => {
        clientName = name;
        clients[socket.id] = { name: clientName, score: score, currentQuestion: 0 };
        socket.emit('welcome', `Bem-vindo ao Quiz, ${clientName}! Prepare-se para responder às perguntas.`);
        sendQuestion(socket);
    });

    const sendQuestion = (socket) => {
        const clientData = clients[socket.id];
        if (clientData.currentQuestion < questions.length) {
            socket.emit('question', {
                question: questions[clientData.currentQuestion].question,
                options: questions[clientData.currentQuestion].options
            });
        } else {
            endQuiz(socket);
        }
    };

    const endQuiz = (socket) => {
        socket.emit('end', {
            message: 'Fim do quiz! Obrigado por participar.',
            scores: Object.values(clients)
        });
    };

    // Receber resposta do cliente
    socket.on('answer', (answer) => {
        const clientData = clients[socket.id];
        if (answer === questions[clientData.currentQuestion].answer) {
            clientData.score.correct++;
            socket.emit('result', 'Correto!');
        } else {
            clientData.score.incorrect++;
            socket.emit('result', 'Errado!');
        }
        clientData.currentQuestion++;
        clients[socket.id] = clientData;
        sendQuestion(socket);
        // Enviar pontuação atualizada
        socket.emit('score', clientData.score);
    });

    socket.on('disconnect', () => {
        console.log('Cliente desconectado: ', socket.id);
        delete clients[socket.id];
    });
});

// Iniciar o servidor
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
