const { 
    makeid,
	getRoom
} = require("../utils")
const rooms = require("../../store")
const questions = require("../../resources/questions")

module.exports = (socket, client) => {

    // Checked
    client.on('game:set', ({event}) => {
        let room = getRoom(client.id)

        if (!room) {
            console.log(room + ' not found')
        }

        switch (event) {
            case 'GAME_PLAYER_READY':
                room.players.forEach((player) => {
                    if (player._id === client.id) {
                        player.state = 'ready'
                    }
                })
        
                room.disableGame = !(room.players.every(p => p.state === 'ready'))
                console.log(room)
                socket.in(room.code).emit('game:update', {
                    event: 'GAME_PLAYER_READY', room
                })

        }

    })
}