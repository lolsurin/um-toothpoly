const { makeid } = require("../../utils")
const rooms = require("../../states")
const questions = require("../../resources/questions")

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

    client.on('game:data:fetch', (data, cb) => {
        let room = rooms.find(r => r.code === data.code)      

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

    client.on('game:begin', (data) => {

    })

}