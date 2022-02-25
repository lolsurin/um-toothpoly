const states = require("../../states")

module.exports = (socket, client) => {

    client.on('validate:room', (data, cb) => {
        let room = states.find(r => r.code === data.code)
        
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

}