const { cleanupUponDisconnect, getRoomAndIndex } = require('./utils');

console.log('socket started')

const gameSocket = (socket) => {
    socket.on('connection', (client) => {
        // emit to the newly connected client the existing count 
        console.log(`connected    : <${client.id}>`)

        require('./events/new/events')(socket, client)
        require('./events/new/validators')(socket, client)

        require('./events/newGame')(client)
        require('./events/joinGame')(socket, client)
        require('./events/leaveGame')(socket, client)
        //require('./events/startGame')(socket, client)

        require('./events/game')(socket, client)

        require('./events/testEvents')(socket, client)

        client.on('disconnect', () => {
            console.log(`disconnected : <${client.id}>`)

            // let rooms = require('./states')
            // let [room, player_idx] = getRoomAndIndex(client.id)

            // if(!room) return

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
    });

    socket.on('reconnect', (client) => {
        console.log(`reconnected : <${client.id}>`)
    })

    socket.on('error', function (err) {
        console.log(err);
    });
}


module.exports = gameSocket