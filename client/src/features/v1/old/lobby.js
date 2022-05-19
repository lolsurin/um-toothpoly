import { useContext, useEffect, useState } from "react";
import { ArrowLeftIcon } from "@heroicons/react/solid"
import { ChevronRightIcon } from "@heroicons/react/outline"
import { SocketContext } from "../context/socket";
import { useNavigate } from "react-router-dom";

function Lobby() {
    const socket = useContext(SocketContext)
    let navigate = useNavigate()

    const [inRoom, setInRoom] = useState(false)
    const [roomField, setRoomField] = useState("")
    const [nameField, setNameField] = useState("")
    const [roomCode, setRoomCode] = useState("")
    const [players, setPlayerList] = useState([])
    

    const onBack = () => {
        console.log(`lobby: leaving room ${roomCode}...`)
        socket.emit('game:leave')

        setInRoom(false)
        setPlayerList([])
    }

    /* SOCKET HANDLERS */
    const handleNewGame = () => {
        console.log('lobby: creating new game...')
        socket.emit('new_game', { playerName: nameField })

        setInRoom(true)
        setPlayerList([nameField])
    }

    const handleJoinGame = () => {       
        socket.emit('join_game', { roomName: roomField, playerName: nameField }, cb => {
            if (cb.code === 404) {
                alert('Room not found')
                return
            }
            setRoomCode(roomField)
            setInRoom(true)      
            console.log(`lobby: joined room ${roomCode}`)    
        })

    }

    const handleStartGame = () => {
        console.log('lobby: starting game')
        socket.emit('game:start', { roomCode })
    }

    /* END SOCKET HANDLERS */

    useEffect(()=> {
        socket.on('new_room_code', (code) => {
            setRoomCode(code)
        })

        socket.on('update_room', (room) => {
            console.log('lobby: updating room')
            let players = room.players.map(player => player.name)
            //console.log(players)
            setPlayerList([room.players.map(player => player.name)])
        })

        socket.on('game:init', (data) => {
            console.log('lobby: initializing game')
            navigate(`../${data.room.roomName}/game`, { state: { room: data.room } })
        })

        return () => {
            socket.off('new_room_code')
            socket.off('update_room')
            socket.off('game:init')
        }

    }, [socket])

    return (
        <div className='flex h-screen bg-red-100 items-center justify-center'>
            <div className="bg-white max-w-lg mx-auto p-8 md:p-10 my-10 rounded-lg shadow-2xl">

                <div className={ inRoom ? "hidden" : ""}>
                    <section>
                        <h3 className="font-bold text-2xl text-center">Tooth Ladder</h3>
                        <p className="text-gray-600 pt-2 text-center">Test your dental knowledge!</p>
                    </section>

                    <section className="mt-10">                        
                        <form onSubmit={(e) => {
                            // TODO different behaviour in Safari
                            e.preventDefault()
                            const btn = e.nativeEvent.submitter.name
                            if (btn === 'joinGame') handleJoinGame()
                            if (btn === 'newGame') handleNewGame()
                        }}>
                            <p className="text-gray-600 mt-4 mb-4 w-full text-center">Enter your name!</p>
                            <input className="w-full p-4 text-sm bg-gray-50 focus:outline-none border border-gray-200 rounded text-gray-600 mb-14" type="text" placeholder="Enter your name!" value={nameField} onChange={e => setNameField(e.target.value)} />

                            <button name="newGame" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold p-4 rounded shadow-lg hover:shadow-xl transition duration-200 text-center">New Game</button>
                            <p className="text-gray-600 mt-4 mb-4 w-full text-center">or join existing room</p>
                            <input className="w-full p-4 text-sm bg-gray-50 focus:outline-none border border-gray-200 rounded text-gray-600" type="text" placeholder="Room Code" value={roomField} onChange={e => setRoomField(e.target.value)} />
                            
                            {
                                roomField ? 
                                (<button type="submit" name="joinGame" className="flex justify-center items-center h-10 w-min p-4 m-auto mt-2 rounded-full hover:bg-gray-300 bg-gray-100">
                                    <p className="ml-3">Join!</p><ChevronRightIcon className="m-1 h-5 w-5 text-gray-500"/>
                                </button>) : null
                            } 

                        </form>                                  
                    </section>

                    {/* <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold p-4 rounded shadow-lg hover:shadow-xl transition duration-200 text-center">Dev see next</button> */}
                </div>

                <div className={ inRoom ? "" : "hidden"}>
                    <div className="flex justify-center items-center h-10 w-10 rounded-full hover:bg-gray-300 bg-gray-100">
                        <ArrowLeftIcon className="h-7 w-7 text-gray-500" onClick={onBack}/>
                    </div>

                    <section>
                        <h3 className="mt-2 font-bold text-2xl">Room Code: { roomCode }</h3>
                        <p className="text-gray-600 pt-2">Current players</p>
                        <ul className="mt-4">
                        { players.map((player, id) => <li key={id} className="text-gray-600">{ player }</li>) }
                        </ul>
                    </section>

                    <section className="mt-10">
                        {/* <Link to={`/${roomCode}/counter`}> */}
                            <button onClick={handleStartGame}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold p-4 rounded shadow-lg hover:shadow-xl transition duration-200 text-center"
                                >
                                Start Game!
                            </button>
                        {/* </Link> */}
                    </section>
                </div>
            </div>

        </div>
    )
}

export default Lobby;