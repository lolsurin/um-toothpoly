const { createServer } = require('http')
const { Server } = require('socket.io')

const httpServer = createServer()
const io = new Server(httpServer, {
  cors: {
    origin: ["ws://localhost:3000"],
    methods: ["GET", "POST"]
  }
})

// the count state
let count = 0;

console.log('started')

io.on('connection', (socket) => {
  // emit to the newly connected client the existing count 
  console.log('connected')
  socket.emit('counter updated', count);

  // we listen for this event from the clients
  socket.on('counter clicked', () => {
    // increment the count
    count++;
    // emit to EVERYONE the updated count
    io.emit('counter updated', count);
  });
});

httpServer.listen(5000)