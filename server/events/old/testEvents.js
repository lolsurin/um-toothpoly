module.exports = function(socket, client) {
    client.on('test:switch_toggle', (data) => {
        
        client.to(data.roomCode).emit('test:switch_toggle', { enabled: data.enabled })
    })
}