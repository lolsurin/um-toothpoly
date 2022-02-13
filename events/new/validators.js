const states = require("../../states")

module.exports = (socket, client) => {

    client.on('validate:room', (data, cb) => {
        let room = states.find(r => r.code === data.code)
        
        if (room) {
            cb({
                ok: true,
            })
        } else {
            cb({
                ok: false
            })
        }

    })

}