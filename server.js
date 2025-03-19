const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8080 });

let clients = [];

server.on('connection', (socket) => {
  console.log('A user connected.');

  // Add the client to the list
  clients.push(socket);

  // Broadcast message to all clients
  socket.on('message', (message) => {
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  // Remove the client when disconnected
  socket.on('close', () => {
    clients = clients.filter((client) => client !== socket);
    console.log('A user disconnected.');
  });
});

console.log('WebSocket server is running on ws://localhost:8080');
