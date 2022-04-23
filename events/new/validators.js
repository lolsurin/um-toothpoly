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

    client.on('validate:clientAlreadyInRoom', (cb) => {
        console.log('validate:clientAlreadyInRoom -> ', client.id)
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