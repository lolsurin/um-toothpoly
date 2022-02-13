const { makeid } = require("../../utils")
const states = require("../../states")
const questions = require("../../resources/questions")

module.exports = (socket, client) => {

    client.on('game:new', (callback) => {
        let code = makeid(5)

        let room = {
            code,
            scene: 'lobby',
            players: [{
                _id: client.id,
                state: 'joining'
            }],
        }

        states.rooms.push(room)

        callback({code})

    })

    client.on('game:join', (data, cb) => {
        let room = states.rooms.find(r => r.code === data.code)

        if (room) {
            room.players.push({
                _id: client.id,
                state: 'joined'
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

    client.on('game:begin', (data) => {

    })

}