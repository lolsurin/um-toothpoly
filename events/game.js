const states = require("../states")
const questions = require("../resources/questions")

module.exports = function(socket, client) {

    client.on('game:start', (data) => {
        console.log('[:server] starting game...')

        let room_idx = states.rooms.findIndex(room => room.players.find(player => player.id == client.id)) // find room index
        let room = states.rooms[room_idx]       
        
        room.answered_questions = []
        room.state = 'game'
        room.turn = 0
        room.players = room.players.map(p => ({
            ...p, 
            rank: 1, 
            score: 0,
            position: 0,
            is_winner: false,
        }))

        socket.to(room.roomName).emit('game:init', { room })
    })
    
    client.on('game:move', data => {

        let currRoom = states.rooms.find(room => room.players.find(player => player.id == client.id))
        if (!currRoom) return // handle disconnection

        let steps = Math.floor(Math.random() * 6) + 1 // dice

        ///////////////////////////////////////////////////////
        let room_idx = states.rooms.findIndex(room => room.players.find(player => player.id == client.id)) // find room index
        let room = states.rooms[room_idx]

        let player_idx = room.players.findIndex(player => player.id == client.id)      

        room.players[player_idx].score += steps

        if (data) {
            room.players[player_idx].position = data.to
        } else {
            room.players[player_idx].position += steps
        }
        
        room.players[player_idx].goDirectly = false        

        //room.turn = (room.turn + 1) % room.players.length
        
        socket.to(states.clients[client.id]).emit('game:move', { room })
    })

    client.on(`game:change_turn`, () => {
        let room_idx = states.rooms.findIndex(room => room.players.find(player => player.id == client.id)) // find room index
        let room = states.rooms[room_idx]

        room.turn = (room.turn + 1) % room.players.length
        socket.to(states.clients[client.id]).emit('game:move', { room })
    })

    client.on('game:snake', data => q(data))
    client.on('game:ladder', data => q(data))
    client.on('game:correct', data => a(data, true))
    client.on('game:incorrect', data => a(data, false))

    function q(data) {
        console.log(data.rule)
        let room_idx = states.rooms.findIndex(room => room.players.find(player => player.id == client.id)) // find room index
        let room = states.rooms[room_idx]

        room.state = 'question'
        room.inPlay = data.rule
        room.question = getRandomQuestion()

        socket.to(states.clients[client.id]).emit('game:question', { room })
    }

    function a(data, correct) {
        let room_idx = states.rooms.findIndex(room => room.players.find(player => player.id == client.id)) // find room index
        let room = states.rooms[room_idx]
        let player_idx = room.players.findIndex(player => player.id == client.id)

        if (data.rule.event === 'ladder' && correct || data.rule.event === 'snake' && !correct) {
            room.players[player_idx].position = data.rule.to
            room.players[player_idx].goDirectly = true
        }

        room.state = 'game'
        room.turn = (room.turn + 1) % room.players.length

        socket.to(states.clients[client.id]).emit('game:move', { room })
    }  

}

function getRandomQuestion() {
    let idx = Math.floor(Math.random() * questions.length)
    return questions[idx]
}

// a function that gets a random question from questions minus already answered questions