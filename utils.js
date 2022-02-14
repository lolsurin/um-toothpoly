module.exports = {
	makeid,
	removeFromAll,
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

function cleanupUponDisconnect(id, socket) {	
	let rooms = require("./states")

	let roomIdx = rooms.findIndex(room => room.players.findIndex(player => player._id == id) > -1)

	if (roomIdx > -1) {
		let room = rooms[roomIdx]
		let playerIdx = room.players.findIndex(player => player._id == id)
		if (playerIdx > -1) {
			room.players.splice(playerIdx, 1) // remove player from room
		}
		if (room.playerCount == 0) {
			rooms.splice(roomIdx, 1)
		} else {
			socket.in(room.code).emit('game:data:update', room)
		}
	}
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