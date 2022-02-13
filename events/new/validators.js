const states = require("../../states")

module.exports = (socket, client) => {

    client.on('validate:room', (data, cb) => {
        let room = states.rooms.find(r => r.code === data.code)
        
        if (room) {
            room.players.push({
                _id: client.id,
                state: 'joining'
            })

            cb({
                ok: true,
                scene: 'lobby',
            })
        } else {
            cb({
                ok: false
            })
        }

    })

}