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

        let steps = Math.floor(Math.random() * 6) + 1 // dice

        ///////////////////////////////////////////////////////
        let room_idx = states.rooms.findIndex(room => room.players.find(player => player.id == client.id)) // find room index
        let room = states.rooms[room_idx]

        let player_idx = room.players.findIndex(player => player.id == client.id)      

        room.players[player_idx].score += steps

        if (data) {
            room.players[player_idx].position = data.to
        } else {
            room.players[player_idx].position += steps
        }

        

        room.turn = (room.turn + 1) % room.players.length
        
        socket.to(states.clients[client.id]).emit('game:move', { room })
    })

    client.on('game:snake', data => {
        console.log(data.rule)
        let room_idx = states.rooms.findIndex(room => room.players.find(player => player.id == client.id)) // find room index
        let room = states.rooms[room_idx]

        room.state = 'question'
        room.inPlay = data.rule

        socket.to(states.clients[client.id]).emit('game:question', { room })
    })

    client.on('game:ladder', data => {
        console.log(data.rule)
        let room_idx = states.rooms.findIndex(room => room.players.find(player => player.id == client.id)) // find room index
        let room = states.rooms[room_idx]

        room.state = 'question'
        room.inPlay = data.rule

        socket.to(states.clients[client.id]).emit('game:question', { room })
    })

    client.on('game:correct', data => {


        let room_idx = states.rooms.findIndex(room => room.players.find(player => player.id == client.id)) // find room index
        let room = states.rooms[room_idx]
        let player_idx = room.players.findIndex(player => player.id == client.id)

        if (data.rule.event === 'ladder') {
            room.players[player_idx].position = data.rule.to
        }

        room.state = 'game'
        socket.to(states.clients[client.id]).emit('game:move', { room })
    })

    client.on('game:incorrect', data => {

        let room_idx = states.rooms.findIndex(room => room.players.find(player => player.id == client.id)) // find room index
        let room = states.rooms[room_idx]
        let player_idx = room.players.findIndex(player => player.id == client.id)

        if (data.rule.event === 'snake') {
            room.players[player_idx].position = data.rule.to
        }

        room.state = 'game'
        socket.to(states.clients[client.id]).emit('game:move', { room })
    })
}