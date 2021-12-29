const states = require("../states")

module.exports = function(socket, client) {
    client.on('game:move', data => {
        let currRoom = states.rooms.find(room => room.players.find(player => player.id == client.id))
        let playIdx = currRoom.players.findIndex(player => player.id == client.id)

        console.log(`[:server] player is from ${currRoom.roomName}, at idx ${playIdx} `)
        //let steps = Math.floor(Math.random() * 6) + 1
        
    })
}