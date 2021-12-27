module.exports = function(socket, client) {
    client.on('test:switch_toggle', (data) => {
        console.log(`[:server] broadcast toggle to ${data.roomCode}...`)
        client.to(data.roomCode).emit('test:switch_toggle', { enabled: data.enabled })
    })
}