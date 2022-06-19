const states = require("../states")

module.exports = function(socket, client) {
    client.on('start_game', (data) => {
        

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

        

        socket.to(data.roomCode).emit('start_game', { code: data.roomCode })
    })
}