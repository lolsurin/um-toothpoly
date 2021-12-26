const { makeid } = require('./utils')

// the count state
let count = 0;

const roomStates = {}
const clientRooms = {}
const playerList = {}

const rooms = []

console.log('socket started')

const gameSocket = (socket) => {
    socket.on('connection', (client) => {
        // emit to the newly connected client the existing count 
        console.log(`a user is connected <${client.id}>`)
        client.emit('counter updated', count);

        require('./events/newGame')(client)
        require('./events/joinGame')(socket, client)
        require('./events/leaveGame')(socket, client)

        function handleCounter() {
            let roomName = clientRooms[client.id]
            let roomState = Number(roomStates[roomName])
            roomStates[roomName] = roomState + 1
            socket.to(roomName).emit('updateCounter',roomStates[roomName])
        }
        
        
        
        // we listen for this event from the clients
        client.on('counter clicked', () => {
            // increment the count
            count++;
            // emit to EVERYONE the updated count
            socket.emit('counter updated', count);
        });
        
        
        
        client.on('counter', handleCounter)
        
    });
}


module.exports = gameSocket