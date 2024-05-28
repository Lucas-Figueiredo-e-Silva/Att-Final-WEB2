const socket = io();

const nameForm = document.getElementById('name-form');
const nameInput = document.getElementById('name');
const startButton = document.getElementById('start');

const messageDiv = document.getElementById('message');
const questionDiv = document.getElementById('question');
const optionsDiv = document.getElementById('options');
const scoreDiv = document.getElementById('score');
const correctSpan = document.getElementById('correct');
const incorrectSpan = document.getElementById('incorrect');
const finalScoresDiv = document.getElementById('final-scores');
const scoresList = document.getElementById('scores-list');

startButton.addEventListener('click', () => {
    const name = nameInput.value.trim();
    if (name) {
        socket.emit('set_name', name);
        nameForm.classList.add('hidden');
        messageDiv.classList.remove('hidden');
        questionDiv.classList.remove('hidden');
        optionsDiv.classList.remove('hidden');
        scoreDiv.classList.remove('hidden');
    } else {
        alert('Por favor, insira seu nome.');
    }
});

socket.on('welcome', (message) => {
    messageDiv.textContent = message;
});

socket.on('question', (data) => {
    questionDiv.textContent = data.question;
    optionsDiv.innerHTML = '';
    data.options.forEach((option) => {
        const button = document.createElement('button');
        button.textContent = option;
        button.classList.add('option');
        button.addEventListener('click', () => {
            socket.emit('answer', option);
        });
        optionsDiv.appendChild(button);
    });
});

socket.on('result', (result) => {
    messageDiv.textContent = result;
});

socket.on('score', (score) => {
    correctSpan.textContent = score.correct;
    incorrectSpan.textContent = score.incorrect;
});

socket.on('end', (data) => {
    questionDiv.textContent = '';
    messageDiv.textContent = data.message;
    optionsDiv.innerHTML = '';

    finalScoresDiv.classList.remove('hidden');
    scoresList.innerHTML = '';
    data.scores.forEach(client => {
        const listItem = document.createElement('li');
        listItem.textContent = `${client.name}: Acertos: ${client.score.correct}, Erros: ${client.score.incorrect}`;
        scoresList.appendChild(listItem);
    });
});
