module.exports = {
	makeid,
	removeFromAll,
	getRoomAndIndex,
	cleanupUponDisconnect,
	move
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

function getRoomAndIndex(id) {
    let room = require('./states').find(r => r.players.find(p => p._id === id))

    if (!room) return [null, null]

    let player_idx = room.players.findIndex(p => p._id === id)
    return [room, player_idx]
}

function removeFromAll(id) {
	let states = require("./states")

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
	console.log(`cleanupUponDisconnect from ${client.id}`)
	let rooms = require('./states')
	let [room, player_idx] = getRoomAndIndex(client.id)
	
	if (!room) {
		console.log(`cleanupUponDisconnect: no room found for ${client.id}`)
		return
	}

	room.players[player_idx].active = false

	if (room.players.length === room.players.filter(p => !p.active).length) {
		let roomIdx = rooms.findIndex(r => r.code !== room.code)
		rooms.splice(roomIdx, 1)
	} else {
		if (room.turn === player_idx) {
			room.scene = 'game'
			do {
				room.turn = (room.turn + 1) % room.players.length
			} while (room.players[room.turn].is_winner && room.players[room.turn].active === false)
		}
		socket.in(room.code).emit('game:data:update', room)
		
	}

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
			if (i > 100) {
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

	//console.log(`${direct} ${leftMotionArray}`)

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