const { 
    makeid,
	getRoom,
    move,
    getRoomAndIndex,
} = require("../utils")
const rooms = require("../../store")
const questions = require("../../resources/questions")

module.exports = (socket, client) => {

    // Checked
    client.on('game:set', ({event, payload}) => {
        let [room, playerIdx] = getRoomAndIndex(client.id)

        if (!room) {
            console.log(room + ' not found')
            socket.emit('game:disconnected')
            return
        }
        
        switch (event) {
            case 'GAME_PLAYER_READY':
                console.log('GAME_PLAYER_READY')
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
                break

            case 'GAME_DICE_ROLLED':
                console.log('GAME_DICE_ROLLED')

                //room.disableGame = true // disable UI until next turn

                let rolled = payload
                let from = room.players[playerIdx].position

                // move player
                room.players[playerIdx].position += rolled
                // create motion
                room.players[playerIdx].motion = move(from, room.players[playerIdx].position, false)

                // if >100, move back
                if (room.players[playerIdx].position > 100) {
                    room.players[playerIdx].position = 200 - room.players[playerIdx].position
                }

                // check if won
                if (room.players[playerIdx].position === 100) {
                    room.players[playerIdx].is_winner = true
                    room.podium.push(playerIdx)
                    if (room.podium.length === room.players.length) {
                        room.scene = 'end'
                    }
                }

                socket.in(room.code).emit('game:disable')
                socket.in(room.code).emit('game:update', {
                    event: 'GAME_DICE_ROLLED',
                    room
                })
                break
            case 'GAME_MOVE_COMPLETED':
                console.log('GAME_MOVE_COMPLETED from ' + client.id)
                // landed on question?
                
                let question = false

                if (question) {
                    // emit question event
                } else {
                    // next turn
                    // enable game
                    do {
                        room.turn = (room.turn + 1) % room.players.length
                    } while (room.players[room.turn].is_winner || !room.players[room.turn].active)

                    socket.in(room.code).emit('game:enable')
                    socket.in(room.code).emit('game:update', {
                        event: 'GAME_NEXT_TURN',
                        turn: room.turn
                    })
                }
                
                break
            default:
                break
        }

    })
}