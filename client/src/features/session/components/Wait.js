import { useEffect, useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SocketContext } from '../../../context/socket'

import { sessionSetState } from '../sessionSlice';
import { gameSetGame } from '../../game/gameSlice';
import { useDispatch } from 'react-redux';

import Transition from '../../Transition';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClone  } from '@fortawesome/free-solid-svg-icons'
import Piece from '../../game/components/Piece';

const Wait = () => {
    
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const socket = useContext(SocketContext)
    let params = useParams()
    const [players, setPlayers] = useState([])

    useEffect(() => {
        dispatch(sessionSetState('waiting'))
        // 

        socket.emit('session:fetch', callback => {
            if (callback.ok) {
                
                setPlayers(callback.room.players)
            } else {
                
                navigate('/')
            }
        })

        socket.on('session:update', data => {
            switch(data.event) {
                case 'SESSION_UPDATE_ROSTER':
                    setPlayers(data.room.players)
                    break
                case 'SESSION_GAME_STARTING':
                    dispatch(gameSetGame(data.room))
                    navigate(`/game/${params.code}`)
                default:
            }
        })

        return () => {
            socket.off('session:fetch')
            socket.off('session:update')
        }

    }, [socket])

    const handleStart = () => {
        socket.emit('session:initiateGame')
    }

    return (
        <div className="flex m-auto items-center justify-center min-h-full px-4 py-12 sm:px-6 lg:px-8">
            <Transition>
                <div className="flex flex-col items-center w-full max-w-md gap-4">
                    <div className='p-4 outline outline-green-500 w-fit m-auto rounded-lg'>
                        <p className="text-6xl font-bold uppercase">{ params.code }</p>
                    </div> 

                    <div className='text-2xl font-jakarta'>Start the game or wait for others to join!</div>

                    <div className='font-jakarta'>Players</div>

                    <div className="flex flex-wrap gap-2 p-2 overflow-hidden bg-white outline-1 place-content-center">

                        {
                            players.map((player, i) => 
                                <div className="flex flex-col items-center justify-center gap-4 rounded-full" key={i}>
                                    <Piece slot={player.slot} />
                                    <div className='text-xl font-semibold'>{player.name}</div>
                                </div>)
                        }

                    </div>

                    <div>
                        <button type="submit" disabled={players.find(Boolean)?._id !== socket.id} onClick={handleStart} className="relative flex justify-center w-full px-8 py-4 text-sm font-medium text-white uppercase bg-indigo-600 border border-transparent rounded-lg group disabled:bg-slate-300 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        </span>
                        {players.find(Boolean)?._id === socket.id ? `Start Game` : `Waiting for ${players.find(Boolean)?.name} to start...`}
                        </button>
                    </div>

                </div>
            </Transition>
        </div>
    )
}

export default Wait