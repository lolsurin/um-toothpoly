const { makeid, move, cleanupUponDisconnect } = require("../../utils")
const rooms = require("../../states")
const questions = require("../../resources/questions")

function getRoom(id) {
    return rooms.find(r => r.players.find(p => p._id === id))
}

function getRoomAndIndex(id) {
    let room = rooms.find(r => r.players.find(p => p._id === id))

    if (!room) return [null, null]

    let player_idx = room.players.findIndex(p => p._id === id)
    return [room, player_idx]
}

function getRandomQuestion() {
    return questions[Math.floor(Math.random() * questions.length)]
}

module.exports = (socket, client) => {

    client.on('game:new', (callback) => {
        let code = makeid(5)

        let room = {
            code,
            scene: 'lobby',
            podium: [],
            question: getRandomQuestion(),
            rule: null,
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
                number: room.players.length,
                active: true,
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
            // player.number = 0,
            player.position = 1,
            player.is_winner = false
            player.podium = 0
            player.motion = {
                left: `5%`,
                bottom: `5%`
            }
        })

        socket.in(room.code).emit('game:starting')
    })

    client.on('game:diceRoll', (roll) => {
        console.log(`game:diceRoll from ${client.id} (${roll})`)

        // to check if connected
        let [room, player_idx] = getRoomAndIndex(client.id)

        if (!room) {
            console.log(`${client.id} is not in a room`)
            socket.emit('game:disconnected')
            return
        }

        room.scene = 'moving'

        //let dice = Math.floor(Math.random() * 6) + 1
        let dice = roll

        let from = room.players[player_idx].position
        room.players[player_idx].position += dice // move player
        console.log(`moving from ${from} to ${room.players[player_idx].position}`)
        room.players[player_idx].motion = move(from, room.players[player_idx].position, false)

        //room.turn = (room.turn + 1) % room.players.length

        if (room.players[player_idx].position > 100) {
            room.players[player_idx].position = 200 - room.players[player_idx].position
        }

        if (room.players[player_idx].position === 100) {
            room.players[player_idx].is_winner = true
            room.podium.push(player_idx)
            if (room.podium.length === room.players.length) {
                room.scene = 'end'
            }
        }

        console.log(room)
        socket.in(room.code).emit('game:data:update', room)
        
    })

    ///////////////////MOVE TO 14///////
    client.on('game:dev:14', () => {
        console.log(`game:dev:14 from ${client.id}`)
        let [room, player_idx] = getRoomAndIndex(client.id)

        room.scene = 'moving'

        room.players[player_idx].position = 100 // move player
        room.players[player_idx].motion = move(1, 100, true)


        socket.in(room.code).emit('game:data:update', room)
        
    })

    client.on('game:nextTurn', () => {
        console.log(`game:nextTurn from ${client.id}`)
        let [room, player_idx] = getRoomAndIndex(client.id)
        room.scene = 'game'

        do {
            room.turn = (room.turn + 1) % room.players.length
        } while (room.players[room.turn].is_winner || !room.players[room.turn].active)

        socket.in(room.code).emit('game:data:update', room)
    })

    client.on('game:event', rule => {
        console.log(`game:event from ${client.id}`)
        let [room, player_idx] = getRoomAndIndex(client.id) // get room and player index
        
        room.scene = 'event' // set scene to event
        room.question = getRandomQuestion() // get random question
        room.rule = rule // set rule

        socket.in(room.code).emit('game:data:update', room) // emit event to all players (so question can be shown)
    })

    client.on('game:submitAnswer', (correct, callback) => {
        console.log(`game:submitAnswer from ${client.id}`)
        let [room, player_idx] = getRoomAndIndex(client.id) // get room and player index

        if (correct && room.rule.event === 'challenge' || !correct && room.rule.event === 'chance') {
            room.players[player_idx].motion = move(room.players[player_idx].position, room.rule.to, true)
            room.players[player_idx].position = room.rule.to

            room.scene = 'game' // set scene to game
            socket.in(room.code).emit('game:data:update', room)
        } else {
            callback({
                ok:true
            })
        }        
    })

    client.on('game:leave_', () => {
        console.log(`game:leave from ${client.id}`)

        // let [room, player_idx] = getRoomAndIndex(client.id)
        

        // room.players.splice(player_idx, 1)

        // if (room.players.length === 0) {
        //     let roomIdx = rooms.findIndex(r => r.code !== room.code)
        //     rooms.splice(roomIdx, 1)
        // } else {
        //     if (room.turn === player_idx) {
        //         room.scene = 'game'
        //         do {
        //             room.turn = (room.turn + 1) % room.players.length
        //         } while (room.players[room.turn].is_winner)
        //     }
        //     socket.in(room.code).emit('game:data:update', room)
            
        // }

        // client.leave(room.code)
        cleanupUponDisconnect(client, socket)
    })
}