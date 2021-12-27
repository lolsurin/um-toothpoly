module.exports = function(socket, client) {
    client.on('start_game', (data) => {
        console.log('[:server] starting game...')
        socket.to(data.roomCode).emit('start_game', { code: data.roomCode })
    })
}