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

    socket.on('set_name', (name) => {
        clients[socket.id] = { name: name, score: { correct: 0, incorrect: 0 }, currentQuestion: 0 };
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
            message: 'Fim do quiz! Obrigado por jogar.',
            scores: Object.values(clients)
        });
        io.emit('update_scores', Object.values(clients)); // Atualiza o placar geral para todos
    };

    socket.on('answer', (answer) => {
        const clientData = clients[socket.id];
        if (answer === questions[clientData.currentQuestion].answer) {
            clientData.score.correct++;
        } else {
            clientData.score.incorrect++;
        }
        clientData.currentQuestion++;
        clients[socket.id] = clientData;
        sendQuestion(socket);
        socket.emit('score', clientData.score);
        io.emit('update_scores', Object.values(clients)); // Atualiza o placar geral para todos
    });

    socket.on('restart_quiz', () => {
        if (clients[socket.id]) {
            clients[socket.id].score = { correct: 0, incorrect: 0 };
            clients[socket.id].currentQuestion = 0;
            sendQuestion(socket);
            socket.emit('quiz_restarted');
        }
    });

    socket.on('disconnect', () => {
        console.log('Cliente desconectado: ', socket.id);
        delete clients[socket.id];
        io.emit('update_scores', Object.values(clients)); // Atualiza o placar geral para todos
    });
});

// Iniciar o servidor
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
