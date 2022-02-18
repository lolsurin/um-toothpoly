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

function getRandomQuestion() {
    return questions[Math.floor(Math.random() * questions.length)]
}

module.exports = (socket, client) => {

    client.on('game:new', (callback) => {
        let code = makeid(5)

        let room = {
            code,
            scene: 'lobby',
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
        console.log(`game:diceRoll from ${client.id}`)
        let [room, player_idx] = getRoomAndIndex(client.id)

        room.scene = 'moving'

        let dice = Math.floor(Math.random() * 6) + 1

        let from = room.players[player_idx].position
        room.players[player_idx].position += dice // move player
        room.players[player_idx].motion = move(from, room.players[player_idx].position, false)

        //room.turn = (room.turn + 1) % room.players.length

        if (room.players[player_idx].position > 100) {
            room.players[player_idx].position = 200 - room.players[player_idx].position
        }

        if (room.players[player_idx].position === 100) room.players[player_idx].is_winner = true

        socket.in(room.code).emit('game:data:update', room)
        
    })

    ///////////////////MOVE TO 14///////
    client.on('game:dev:14', () => {
        console.log(`game:dev:14 from ${client.id}`)
        let [room, player_idx] = getRoomAndIndex(client.id)

        room.scene = 'moving'

        room.players[player_idx].position = 20 // move player
        room.players[player_idx].motion = move(1, 20, true)


        socket.in(room.code).emit('game:data:update', room)
        
    })

    client.on('game:nextTurn', () => {
        console.log(`game:diceRollComplete from ${client.id}`)
        let [room, player_idx] = getRoomAndIndex(client.id)
        room.scene = 'game'

        room.turn = (room.turn + 1) % room.players.length
        
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

        

        // if wrong, manually send nextTurn on client

        
    })
}