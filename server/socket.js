const { cleanupUponDisconnect, getRoomAndIndex } = require('./events/utils');



const gameSocket = (socket) => {
    socket.on('connection', (client) => {

        

        require('./events/new/session')(socket, client);
        require('./events/new/game')(socket, client);
        require('./events/new/validators')(socket, client)

        client.on('disconnect', () => {
            console.log(`${client.id} disconnected`)
            cleanupUponDisconnect(client, socket)
        })        
    });

    socket.on('reconnect', (client) => {
        
    })

    socket.on('error', function (err) {
        
    });
}


module.exports = gameSocket