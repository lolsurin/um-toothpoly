const { 
    makeid,
	getRoom,
    getRoomAndIndex,
    cleanupUponDisconnect,
} = require("../utils")
const rooms = require("../../store")
const questions = require("../../resources/questions")

module.exports = (socket, client) => {

    client.on('session:set', ({event, payload}) => {
        let [room, playerIdx] = getRoomAndIndex(client.id)

        if (!room) {
            console.log(room + ' not found')
            socket.emit('game:disconnected')
            return
        }

        switch(event) {
            case 'GAME_LEAVE':
                console.log('GAME_LEAVE')
                cleanupUponDisconnect(client, socket)
                break
            default:
                break
        }
    })

    /**
     * Creates a new game in and returns the game code
     * @returns {void} - Room Code to Session
     */
    client.on('session:new', (callback) => {
        let code = makeid(5)

        let room = {
            code,
            scene: 'lobby',
            availableSlots: [0, 1, 2, 3], // available slots for players
            podium: [],
            players: [],
        }

        rooms.push(room)
        callback({code})
    })

    /**
     * session:join -> session:update (all)
     * Joins a game
     * 
     */
    client.on('session:join', (data, cb) => {        
        let room = rooms.find(r => r.code === data.code)
        if (room) {

            let slot = Math.floor(Math.random() * room.availableSlots.length) // assign a *random* slot

            client.join(room.code) // join the room

            // add player to room object
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

            socket.in(room.code).emit('session:update', {
                event: 'SESSION_UPDATE_ROSTER',
                room
            }) // update to all players

        } else {
            cb({
                ok: false
            })
        }
        
    })

    /**
     * Fetch current session state
     */
    client.on('session:fetch', () => {
        let room = getRoom(client.id)
        if (room) socket.in(room.code).emit('session:update', {
            event: 'SESSION_UPDATE_ROSTER',
            room
        })
    })

    /**
     * Event triggered by player 1 when they are ready to start the game
     * Triggers SESSION_GAME_STARTING to tell other players that the game is about to start
     */
    client.on('session:initiateGame', () => {
        let room = getRoom(client.id)

        room.disableGame = true
        room.scene = 'game'
        room.turn = 0
        room.questions = {
            available: questions,
            chosen: [],
        }

        room.players.forEach((player) => {
            // player._id
            // player.name
            // player.number = 0,
            player.state = 'tutorial',
            player.position = 0,
            player.is_winner = false
            player.podium = 0
            player.motion = {
                left: `-5%`,
                bottom: `5%`
            }
        })

        socket.in(room.code).emit('session:update', {
            event: 'SESSION_GAME_STARTING',
            room
        })
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
        console.log(room)
        socket.in(room.code).emit('game:update', room)
    })
}