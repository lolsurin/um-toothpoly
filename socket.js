const { cleanupUponDisconnect, getRoomAndIndex } = require('./events/utils');

console.log('socket started')

const gameSocket = (socket) => {
    socket.on('connection', (client) => {

        console.log(`connected    : <${client.id}>`)

        require('./events/new/session')(socket, client);
        require('./events/new/game')(socket, client);
        // require('./events/new/events')(socket, client)
        require('./events/new/validators')(socket, client)

        client.on('disconnect', () => {
            // console.log(`disconnected : <${client.id}>`)
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