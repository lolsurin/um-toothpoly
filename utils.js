module.exports = {
	makeid,
	removeFromAll,
	cleanupUponDisconnect
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