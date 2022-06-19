const { makeid } = require("../utils")
const states = require("../states")

module.exports = function(client) {
    client.on('new_game', data => {
        

        let playerName = data.playerName
        let roomName = makeid(5) // generate a random room name

        states.clients[client.id] = roomName; // set room code to client id
            
        let room = {
            roomName: roomName,
            playerCount: 1,
            state: 'lobby',
            players: [ {id: client.id, name: playerName} ],
        }

        states.rooms.push(room)

        
        

        client.emit('new_room_code', roomName)        
        client.join(roomName)
        //client.number = 1    
    })
}