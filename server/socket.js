const { cleanupUponDisconnect } = require('./events/utils');

const gameSocket = (io) => {
  io.on('connection', (client) => {
    console.log(`Client connected: ${client.id}`);

    // Import and initialize event handlers
    require('./events/new/session')(io, client);
    require('./events/new/game')(io, client);
    require('./events/new/validators')(io, client);

    // Handle disconnection
    client.on('disconnect', () => {
      console.log(`Client disconnected: ${client.id}`);
      cleanupUponDisconnect(client, io);
    });

    // Optionally handle reconnections
    client.on('reconnect', () => {
      console.log(`Client reconnected: ${client.id}`);
    });

    // Handle errors
    client.on('error', (err) => {
      console.error(`Error with client ${client.id}:`, err);
    });
  });
};

module.exports = gameSocket;
