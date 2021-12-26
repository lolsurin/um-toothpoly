const { makeid } = require("../utils")
const states = require("../states")

module.exports = function(client) {
    client.on('new_game', data => {
        console.log('[:server] creating new game...')

        let playerName = data.playerName
        let roomName = makeid(5) // generate a random room name

        states.clients[client.id] = roomName; // set room code to client id
            
        let room = {
            roomName: roomName,
            playerCount: 1,
            players: [ {id: client.id, name: playerName} ],
        }

        states.rooms.push(room)

        console.log('current state:' + JSON.stringify(states.clients))
        console.log('current rooms:' + JSON.stringify(states.rooms))

        client.emit('new_room_code', roomName)        
        client.join(roomName)
        //client.number = 1    
    })
}