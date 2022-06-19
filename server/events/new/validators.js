const rooms = require("../../store")
const { getRoomAndIndex, cleanupUponDisconnect } = require('../utils')

module.exports = (socket, client) => {

    client.on('validate:room', (data, cb) => {
        let room = rooms.find(r => r.code === data.code)
        
        if (!room) {
            cb({
                ok: false,
                error: "Room not found"
            })
            return
        }

        if (room.players.length >= 4) {
            cb({
                ok: false,
                error: "Room is full"
            })
            return
        }

        if (room.scene !== 'lobby') {
            cb({
                ok: false,
                error: "Game has started"
            })
        }

        cb({
            ok: true,
        })


    })

    client.on('validate:forceClientCleanState', () => {
        let [room, playerIdx] = getRoomAndIndex(client.id)

        if (!room) return
        
        
        cleanupUponDisconnect(client, socket)
    })

    client.on('validate:okToEmit', (cb) => {
        let [room, playerIdx] = getRoomAndIndex(client.id)

        // if it is the players turn
        if (room.players[room.turn]._id === client.id) {
            cb({
                ok: true,
            })
        } else {
            cb({
                ok: false,
                error: "It is not your turn"
            })
        }

    })

    client.on('validate:clientAlreadyInRoom', (cb) => {
        
        let room = rooms.find(r => r.players.find(p => p._id === client.id))
        
        if (!room) {
            cb({
                ok: true,
                msg: 'Client not in room'
            })
            return
        }
        
        cb({
            ok: false,
            msg: 'Client already in room ' + room.code,
            code: room.code
        })
    })

}