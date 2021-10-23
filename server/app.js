const { createServer } = require('http')
const { Server } = require('socket.io')
const { makeid } = require('./utils')

const httpServer = createServer()
const io = new Server(httpServer, {
  cors: {
    origin: ["ws://localhost:3000"],
    methods: ["GET", "POST"]
  }
})

// the count state
let count = 0;

const roomStates = {}
const clientRooms = {}
const playerList = {}

console.log('started')

io.on('connection', (socket) => {
  // emit to the newly connected client the existing count 
  console.log(`a user is connected <${socket.id}>`)
  socket.emit('counter updated', count);



  function handleNewGame() {
    console.log('creating new game')
    let roomName = makeid(5)
    clientRooms[socket.id] = roomName;
    roomStates[roomName] = 0
    playerList[roomName] = ''
    socket.emit('gameCode', roomName)

    socket.join(roomName)
    socket.number = 1
    io.to(roomName).emit('init', 1)
  }

  function handleCounter() {
    let roomName = clientRooms[socket.id]
    let roomState = Number(roomStates[roomName])
    roomStates[roomName] = roomState + 1
    io.to(roomName).emit('updateCounter',roomStates[roomName])
  }
  
  function handleJoinGame(state){

    console.log(state.roomCode)
    let roomName = state.roomCode
    let playerIGN = state.playerName

    //const room = io.sockets.adapter.rooms[roomName] //get room instance
    let numClients = 0
    io.in(roomName).fetchSockets().then(room => {

      numClients = room.length

      if (numClients === 0) {
        socket.emit('invalidCode')
        console.log('invalid room code')
        return
      }
  
      clientRooms[socket.id] = roomName
      //playerList[roomName] = playerList[roomName]+playerIGN+' '
      socket.join(roomName)
      console.log(`${socket.id} joined room ${roomName}`)
      console.log(`${playerIGN} joined room ${roomName}`)
      let roomPlayers = String(playerList[roomName])
      playerList[roomName] = roomPlayers + playerIGN +' '
      console.log(`Player list : ${playerList[roomName]}`)
      console.log(clientRooms)
      io.to(roomName).emit('updatePlayerList',playerList[roomName])
    })

    
  }


  // we listen for this event from the clients
  socket.on('counter clicked', () => {
    // increment the count
    count++;
    // emit to EVERYONE the updated count
    io.emit('counter updated', count);
  });

  

  socket.on('counter', handleCounter)
  socket.on('newGame', handleNewGame )
  socket.on('joinGame', handleJoinGame)

});

httpServer.listen(5000)