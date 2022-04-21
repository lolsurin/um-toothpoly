const states = require("../states")

module.exports = function(socket, client) {
    client.on('join_game', (data, cb) => {
        console.log('[:server] joining game...')

        let playerName = data.playerName
        let roomName = data.roomName

        //console.log(socket.sockets.adapter.rooms)
        if (!socket.sockets.adapter.rooms.get(roomName)) {
            console.error('room not found')
            cb({
                code: 404,
                msg: 'Room not found'
            })
            return
        }

        let idx = states.rooms.findIndex(room => room.roomName == roomName) // find room index
        client.join(roomName) // join room
        states.clients[client.id] = roomName;
        
        states.rooms[idx].playerCount++ // increment player count for room
        states.rooms[idx].players.push({id: client.id, name: playerName}) // add player to room

        cb({
            code: 200,
            msg: 'OK',
        })

        //console.log(states.rooms)
        socket.to(roomName).emit('update_room', states.rooms[idx]) // emit to room that a new player has joined

    })
}