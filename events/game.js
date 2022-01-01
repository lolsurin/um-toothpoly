const states = require("../states")



module.exports = function(socket, client) {

    client.on('game:start', (data) => {
        console.log('[:server] starting game...')

        let room_idx = states.rooms.findIndex(room => room.players.find(player => player.id == client.id)) // find room index
        let room = states.rooms[room_idx]       
        
        room.state = 'game'
        room.turn = 0
        room.players = room.players.map(p => ({
            ...p, 
            rank: 1, 
            score: 0,
            position: 1,
            is_winner: false,
        }))

        socket.to(room.roomName).emit('game:init', { room })
    })
    
    client.on('game:move', data => {
        let currRoom = states.rooms.find(room => room.players.find(player => player.id == client.id))

        if (!currRoom) return // handle disconnection

        let playIdx = currRoom.players.findIndex(player => player.id == client.id)

        console.log(`[:server] player is from ${currRoom.roomName}, at idx ${playIdx} `)
        let steps = Math.floor(Math.random() * 6) + 1
        ///////////////////////////////////////////////////////
        let room_idx = states.rooms.findIndex(room => room.players.find(player => player.id == client.id)) // find room index
        let room = states.rooms[room_idx]

        let player_idx = room.players.findIndex(player => player.id == client.id)

        room.players[player_idx].score += steps
        room.players[player_idx].position += steps
        room.turn = (room.turn + 1) % room.players.length
        // console.log(states.rooms) 

        // if playes in same position, send flag to client (to shift position)

        //
        
        socket.to(states.clients[client.id]).emit('game:move', { room })
        //socket.emit('game:move', { room: 'this is not it' })
        console.log(`broadcasting to ${room.roomName} ${JSON.stringify(room.players[player_idx])}`)
    })
}