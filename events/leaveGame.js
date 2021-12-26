const states = require("../states")

module.exports = function(socket, client) {
    client.on('leave_game', data => {
        console.log('[:server] leaving room ...' + data.roomCode)

        client.leave(states.clients[client.id])

        delete states.clients[client.id]

        let room_idx = states.rooms.findIndex(room => room.roomName == data.roomCode) // find room index
        let room = states.rooms[room_idx]       
        let player_idx = room.players.findIndex(player => player.id == client.id)
        
        room.playerCount-- // decrement player count for room
        room.players.splice(player_idx, 1) // remove player from room

        socket.to(room.roomName).emit('update_room', room) // emit to room that a new player has joined

        if (room.playerCount == 0) states.rooms.splice(room_idx, 1) // remove room if no players left        
    })
}