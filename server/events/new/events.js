const {
    makeid,
	removeFromAll,
	getRoom,
	getRoomAndIndex,
	getRandomQuestion,
	cleanupUponDisconnect,
	move
} = require("../utils")
const rooms = require("../../store")
const questions = require("../../resources/questions")



module.exports = (socket, client) => {

    // Checked
    client.on('game:new', (callback) => {
        let code = makeid(5)

        let room = {
            code,
            scene: 'lobby',
            availableSlots: [0, 1, 2, 3],
            podium: [],
            question: getRandomQuestion(),
            rule: null,
            players: [],
        }

        rooms.push(room)
        callback({code})
    })

    // Checked
    client.on('game:join', (data, cb) => {
        
        let room = rooms.find(r => r.code === data.code)
        if (room) {

            let slot = Math.floor(Math.random() * room.availableSlots.length) // assign a slot

            client.join(room.code)
            room.players.push({
                _id: client.id,
                slot: room.availableSlots[slot],
                number: room.players.length ? Math.max(...room.players.map(p => p.number)) + 1 : 0,
                state: 'waiting',  // everyone starts with waiting state screen
                active: true,
                name: data.name,
            })

            room.availableSlots.splice(slot, 1) // remove slot from available slots

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

    // To remove
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

    // Checked
    client.on('game:fetch', () => {
        let room = getRoom(client.id)
        if (room) socket.in(room.code).emit('game:update', room)
    })

    // Checked
    client.on('game:begin', () => {
        let room = getRoom(client.id)

        room.disableGame = true
        room.scene = 'game'
        room.turn = 0

        room.players.forEach((player) => {
            // player._id
            // player.name
            // player.number = 0,
            player.state = 'tutorial',
            player.position = 1,
            player.is_winner = false
            player.podium = 0
            player.motion = {
                left: `5%`,
                bottom: `5%`
            }
        })

        socket.in(room.code).emit('game:starting', room)
    })

    // Checked
    client.on('game:playerReady', () => {
        let room = getRoom(client.id)

        room.players.forEach((player) => {
            if (player._id === client.id) {
                player.state = 'ready'
            }
        })

        room.disableGame = !(room.players.every(p => p.state === 'ready'))
        
        socket.in(room.code).emit('game:update', room)
    })

    client.on('game:roll', (roll) => {
        let room = getRoom(client.id)

        if (!room) return

        room.players.forEach((player) => {
            if (player._id === client.id) {
                player.state = 'rolling'
            }
        })

        socket.in(room.code).emit('game:update', room)
    })


    ////////////////////////////////////////////////////////////

    // Checked
    // client.on('game:updatePlayerState', (payload) => {
    //     let room = getRoom(client.id)

    //     

    //     if (!room) return

    //     room.players.forEach((player) => {
    //         if (player._id === client.id) {
    //             player.state = payload
    //         }
    //     })

    //     socket.in(room.code).emit('game:data:update', room)
    // })

    


    client.on('game:diceRoll', (roll) => {
        

        // to check if connected
        let [room, player_idx] = getRoomAndIndex(client.id)

        if (!room) {
            
            socket.emit('game:disconnected')
            return
        }

        room.scene = 'moving'
        room.disableGame = true

        //let dice = Math.floor(Math.random() * 6) + 1
        let dice = roll

        let from = room.players[player_idx].position
        room.players[player_idx].position += dice // move player
        //
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
        socket.in(room.code).emit('game:update', room)
        
    })

    ///////////////////MOVE TO 14///////
    client.on('game:dev:14', () => {
        
        let [room, player_idx] = getRoomAndIndex(client.id)

        room.scene = 'moving'

        room.players[player_idx].position = 100 // move player
        room.players[player_idx].motion = move(1, 100, true)


        socket.in(room.code).emit('game:data:update', room)
        
    })

    client.on('game:nextTurn', () => {
        
        let [room, player_idx] = getRoomAndIndex(client.id)
        
        room.scene = 'game'
        room.disableGame = false

        do {
            room.turn = (room.turn + 1) % room.players.length
        } while (room.players[room.turn].is_winner || !room.players[room.turn].active)

        socket.in(room.code).emit('game:data:update', room)
    })

    client.on('game:event', rule => {
        
        let [room, player_idx] = getRoomAndIndex(client.id) // get room and player index
        
        room.scene = 'event' // set scene to event
        room.question = getRandomQuestion() // get random question
        room.rule = rule // set rule

        socket.in(room.code).emit('game:data:update', room) // emit event to all players (so question can be shown)
    })

    client.on('game:submitAnswer', (correct, callback) => {
        
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