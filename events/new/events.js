const { makeid, move } = require("../../utils")
const rooms = require("../../states")
const questions = require("../../resources/questions")

function getRoom(id) {
    return rooms.find(r => r.players.find(p => p._id === id))
}

function getRoomAndIndex(id) {
    let room = rooms.find(r => r.players.find(p => p._id === id))
    let player_idx = room.players.findIndex(p => p._id === id)
    return [room, player_idx]
}

module.exports = (socket, client) => {

    client.on('game:new', (callback) => {
        let code = makeid(5)

        let room = {
            code,
            scene: 'lobby',
            players: [],
        }

        rooms.push(room)

        callback({code})

    })

    client.on('game:join', (data, cb) => {
        
        let room = rooms.find(r => r.code === data.code)
        if (room) {
            
            client.join(room.code)
            room.players.push({
                _id: client.id,
                name: data.name,
            })

            cb({
                ok: true,
                scene: 'lobby',
            })

            socket.in(room.code).emit('game:data:update', room)

        } else {
            cb({
                ok: false
            })
        }
        
    })

    client.on('game:data:fetch', (cb) => {
        let room = getRoom(client.id)     

        if (room) {
            cb({
                ok: true,
                room
            })
        } else {
            cb({
                ok: false
            })
        }
    })

    client.on('game:begin', () => {
        let room = getRoom(client.id)

        room.scene = 'game'
        room.turn = 0

        room.players.forEach((player) => {
            // player._id
            // player.name
            player.score = 0,
            player.position = 1,
            player.is_winner = false
            player.motion = {
                left: `5%`,
                bottom: `5%`
            }
        })

        socket.in(room.code).emit('game:starting')
    })

    client.on('game:diceRoll', () => {

        let [room, player_idx] = getRoomAndIndex(client.id)

        let dice = Math.floor(Math.random() * 6) + 1

        let from = room.players[player_idx].position
        room.players[player_idx].position += dice // move player
        room.turn = (room.turn + 1) % room.players.length // change turn
        room.players[player_idx].motion = move(from, room.players[player_idx].position, false)

        if (room.players[player_idx].position > 100) {
            room.players[player_idx].position = 200 - room.players[player_idx].position
        }

        socket.in(room.code).emit('game:data:update', room)
        console.log(`server received game:diceRoll from ${client.id}`)
    })

}