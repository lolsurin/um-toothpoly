const rooms = require("../store")
const questions = require("../resources/questions")
const events = require("../resources/events")

module.exports = {
	makeid,
	removeFromAll,
	getRoom,
	getRoomAndIndex,
	getRandomQuestion,
	cleanupUponDisconnect,
	getEventAt,
	move
}

function getEventAt(position) {
	return events.find(e => e.tile === position)
}

function getRoom(id) {
    return rooms.find(r => r.players.find(p => p._id === id))
}

function getRoomAndIndex(id) {
    let room = rooms.find(r => r.players.find(p => p._id === id))

    if (!room) return [null, null]

    let player_idx = room.players.findIndex(p => p._id === id)
    return [room, player_idx]
}

function getRandomQuestion() {
    return questions[Math.floor(Math.random() * questions.length)]
}
  
function makeid(length) {
	var result           = '';
	var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	var charactersLength = characters.length;
	for ( var i = 0; i < length; i++ ) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}

function removeFromAll(id) {
	let states = require("../store")

	delete states.clients[id]

	let room = states.rooms

	if (room.length === 0) return

	console.log(room)

	room.forEach((room, idx) => {
		let player_idx = room.players.findIndex(player => player.id == id)
		if (player_idx > -1) {
			room.playerCount-- // decrement player count for room
			room.players.splice(player_idx, 1) // remove player from room
		}

		if (room.playerCount == 0) states.rooms.splice(idx, 1)
	})	
}

function cleanupUponDisconnect(client, socket) {	
	console.log(`DISCONNECTED: ${client.id}`)
	//let rooms = require('../store')
	let [room, player_idx] = getRoomAndIndex(client.id)
	
	if (!room) {
		console.log(`\tNO ROOM FOUND`)
		return
	}

	// setting player to inactive
	room.players[player_idx].active = false

	// if no active players left
	if (room.players.length === room.players.filter(p => !p.active).length) {
		console.log(`\tNO MORE ACTIVE PLAYERS, DELETING ROOM`)
		let roomIdx = rooms.findIndex(r => r.code !== room.code)
		rooms.splice(roomIdx, 1)
	} else { // if there are active players
		console.log(`\tGIVING UP PLAYER SLOT`)
		// give up slot
		room.availableSlots.push(room.players[player_idx].slot)

		 // change turn if it was this player's turn
		if (room.turn === player_idx) {
			// next turn?
			// room.scene = 'game'
			// do {
			// 	room.turn = (room.turn + 1) % room.players.length
			// } while (room.players[room.turn].is_winner && room.players[room.turn].active === false)
			console.log(`\tGIVING TURN TO NEXT PLAYER`)
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
		}

		if (room.scene = 'lobby') room.players.splice(player_idx, 1)

		socket.in(room.code).emit('game:data:update', room)
		socket.in(room.code).emit('game:update', {
			event: 'PLAYER_DISCONNECTED',
			room
		})
	}
	//console.log(room)
	
	client.leave(room.code)
}

function move(from, to, direct) {
	let leftMotionArray = []
	let bottomMotionArray = []

	if (direct) {
		let [fromX, fromY] = getRelPos(from)
		let [toX, toY] = getRelPos(to)
		leftMotionArray.push(fromX)
		leftMotionArray.push(toX)
		bottomMotionArray.push(fromY)
		bottomMotionArray.push(toY)
	} else {
		for (let i = from; i <= to; i++) {
			if (i === 0) {
				leftMotionArray.push('-5%')
				bottomMotionArray.push('5%')
				continue
			} else if (i > 100) {
				let [x, y] = getRelPos(200 - i);
				leftMotionArray.push(x);
				bottomMotionArray.push(y);
			} else {
				let [x, y] = getRelPos(i);
				leftMotionArray.push(x);
				bottomMotionArray.push(y);
			}
		}
	}

	// console.log(`${direct} ${leftMotionArray}`)

	return {
		left: leftMotionArray,
		bottom: bottomMotionArray
	}
}
  
function getRelPos(tile) {
	tile-=1
	let ones = tile % 10;
	let tens = Math.floor(tile / 10);

	let x_rel = tens % 2 === 0 ? ones + 0.5 : 10 - (ones + 0.5);
	let y_rel = tens + 0.5;

	//if (y_rel > 10) y_rel = 9.5

	return [x_rel * 10 + "%", y_rel * 10 + "%"];
}