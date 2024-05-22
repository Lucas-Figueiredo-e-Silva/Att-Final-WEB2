const ws = new WebSocket(`ws://localhost:8080`);

ws.on('open', function open() {
  console.log('Conectado ao servidor WebSocket');

});

ws.on('message', function incoming(data) {
  console.log('Resposta do servidor: %s', data);
});

ws.on('close', function close() {
  console.log('Desconectado do servidor WebSocket');
});
