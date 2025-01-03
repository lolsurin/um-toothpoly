const { 
    makeid,
	getRoom,
    getRandomQuestion,
    move,
    getRoomAndIndex,
    getEventAt
} = require("../utils")

const rooms = require("../../store")
const questions = require("../../resources/questions")
const events = require("../../resources/events")

module.exports = (socket, client) => {

    // Checked
    client.on('game:set', ({event, payload}) => {
        let [room, playerIdx] = getRoomAndIndex(client.id)

        if (!room) {
            
            socket.emit('game:disconnected')
            return
        }
        
        switch (event) {
            case 'GAME_PLAYER_READY':
                
                room.players.forEach((player) => {
                    if (player._id === client.id) {
                        player.state = 'ready'
                    }
                })
        
                room.disableGame = !(room.players.every(p => p.state === 'ready'))
                // 
                socket.in(room.code).emit('game:update', {
                    event: 'GAME_PLAYER_READY', room
                })
                break
            case 'GAME_DICE_ROLLED':
                

                //room.disableGame = true // disable UI until next turn
                let forceUpdate = false

                let rolled = payload
                let from = room.players[playerIdx].position

                // move player
                room.players[playerIdx].position += rolled
                // create motion
                room.players[playerIdx].motion = move(from, room.players[playerIdx].position, false)

                // if >100, move back
                if (room.players[playerIdx].position > 100) {
                    room.players[playerIdx].position = 200 - room.players[playerIdx].position
                }

                // check if won
                if (room.players[playerIdx].position === 100) {
                    room.players[playerIdx].is_winner = true
                    room.podium.push(playerIdx)
                    if (room.podium.length === room.players.length) {
                        room.scene = 'end'
                    }
                }

                socket.in(room.code).emit('game:disable')
                socket.in(room.code).emit('game:update', {
                    event: 'GAME_DICE_ROLLED',
                    room,
                    rolled
                })
                break
            case 'GAME_MOVE_COMPLETED':
                
                // landed on question?
                let landedOnEvent = getEventAt(room.players[playerIdx].position)

                if (landedOnEvent) {
                    
                    // emit question event
                    // choose not chosen question

                    if (room.questions.available.length === 0) {
                        // empty chosen array and refill available array
                        room.questions.available = room.questions.chosen
                        room.questions.chosen = []
                    }

                    let randIndex = Math.floor(Math.random() * room.questions.available.length)
                    let question = room.questions.available[randIndex]
                    // add chosen question to chosen array
                    room.questions.chosen.push(question)
                    // remove chosen question from available
                    room.questions.available.splice(randIndex, 1)

                    socket.in(room.code).emit('game:update', {
                        event: 'GAME_QUESTION',
                        // question: getRandomQuestion()
                        question
                    })
                } else {
                    // next turn
                    // enable game
                    // do {
                    //     room.turn = (room.turn + 1) % room.players.length
                    // } while (room.players[room.turn].is_winner || !room.players[room.turn].active)

                    // socket.in(room.code).emit('game:enable')
                    // socket.in(room.code).emit('game:update', {
                    //     event: 'GAME_NEXT_TURN',
                    //     turn: room.turn
                    // })
                    socket.in(room.code).emit('game:update', {
                        event: 'GAME_MOVE_COMPLETED'
                    })
                }
                break
            // RETHINK THIS
            case 'GAME_NEXT_TURN':
                

                //

                const gameOver = room.players.every(player => player.is_winner)

                if (gameOver) {
                    
                    room.gameOver = true
                    socket.in(room.code).emit('game:update', {
                        event: 'GAME_OVER',
                        room
                    })
                    break
                }

                process.stdout.write('> ')
                do {
                    process.stdout.write('#')
                    room.turn = (room.turn + 1) % room.players.length
                } while (room.players[room.turn].is_winner || !room.players[room.turn].active)
                process.stdout.write('\n')
                // room.players.forEach(player => delete player.motion)

                socket.in(room.code).emit('game:enable')
                socket.in(room.code).emit('game:update', {
                    event: 'GAME_NEXT_TURN',
                    turn: room.turn
                    //room
                })
                break
            case 'GAME_QUESTION_ANSWERED':
                
                let tileEvent = getEventAt(room.players[playerIdx].position)
                let isChallenge = tileEvent.event === 'challenge'
                let isChance = tileEvent.event === 'chance'
                let correct = payload

                // 
                // 

                if (isChallenge) {
                    if (correct) {
                        // move up
                        
                        room.players[playerIdx].motion = move(room.players[playerIdx].position, tileEvent.to, true)
                        room.players[playerIdx].position = tileEvent.to

                        
                        socket.in(room.code).emit('game:update', {
                            event: 'GAME_QUESTION_ANSWERED_CORRECT',
                            move: true,
                            playerNumber: playerIdx,
                            player: room.players[playerIdx],
                        })
                    } else {
                        // stay
                        
                        socket.in(room.code).emit('game:update', {
                            event: 'GAME_QUESTION_ANSWERED_INCORRECT'
                        })
                    }
                } else if (isChance) {
                    if (correct) {
                        // stay
                        
                        socket.in(room.code).emit('game:update', {
                            event: 'GAME_QUESTION_ANSWERED_CORRECT',
                            move: false
                        })
                    } else {
                        // move down
                        room.players[playerIdx].motion = move(room.players[playerIdx].position, tileEvent.to, true)
                        room.players[playerIdx].position = tileEvent.to
                        
                        socket.in(room.code).emit('game:update', {
                            event: 'GAME_QUESTION_ANSWERED_INCORRECT',
                            move: true,
                            playerNumber: playerIdx,
                            player: room.players[playerIdx],
                        })
                    }
                } else {
                    if (correct) {
                        // stay
                        
                        socket.in(room.code).emit('game:update', {
                            event: 'GAME_QUESTION_ANSWERED_CORRECT',
                            move: false
                        })
                    } else {
                        // stay
                        
                        socket.in(room.code).emit('game:update', {
                            event: 'GAME_QUESTION_ANSWERED_INCORRECT'
                        })
                    }
                }
                break
            case 'GAME_QUESTION_UNANSWERED':
                

                let unansweredTileEvent = getEventAt(room.players[playerIdx].position)
                let unansweredIsChance = unansweredTileEvent?.event === 'chance'

                if (unansweredIsChance) {
                    room.players[playerIdx].motion = move(room.players[playerIdx].position, unansweredTileEvent.to, true)
                    room.players[playerIdx].position = unansweredTileEvent.to
                    
                    socket.in(room.code).emit('game:update', {
                        event: 'GAME_QUESTION_UNANSWERED',
                        move: true,
                        playerNumber: playerIdx,
                        player: room.players[playerIdx],
                    })
                } else {
                    
                    socket.in(room.code).emit('game:update', {
                        event: 'GAME_QUESTION_UNANSWERED'
                    })
                }

                // socket.in(room.code).emit('game:update', {
                //     event: 'GAME_QUESTION_UNANSWERED',
                //     turn: room.turn
                // })
                break
            default:
                break
        }

    })
}