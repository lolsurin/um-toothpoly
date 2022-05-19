import { useEffect, useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SocketContext } from '../context/socket'
import pieces from '../assets/pieceStyles.json'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCat, faCrow, faSpider, faFish, faClone  } from '@fortawesome/free-solid-svg-icons'

function Lobby() {
    
    const navigate = useNavigate()

    const socket = useContext(SocketContext)
    let params = useParams()
    const [players, setPlayers] = useState([])

    useEffect(() => {
        
        socket.emit('game:data:fetch', callback => {
            if (callback.ok) {
                console.log(callback.room.players)
                setPlayers(callback.room.players)
            } else {
                console.log("room not found")
                navigate('/')
            }
        })

        socket.on('game:data:update', (data) => {
            console.log('receiving updates')
            setPlayers(data.players)
        })

        socket.on('game:starting', () => {
            console.log('starting game')
            navigate(`/${params.code}/game`)
        })

        return () => {
            socket.off('game:data:fetch')
            socket.off('game:data:update')
            socket.off('game:starting')
        }

    }, [socket])

    const handleStart = () => {
        socket.emit('game:begin')
    }

    let icons = [faCat, faCrow, faSpider, faFish]

    return (
        <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <button className='flex gap-4' onClick={e => navigator.clipboard.writeText(window.location.href.replace('/wait',''))}>
                    <p className="text-4xl font-bold uppercase text-slate-800 ">🦷 {params.code} </p>   
                    <FontAwesomeIcon className="text-lg place-self-center text-slate-400" icon={faClone} />    
                </button>

                <div className="rounded-lg overflow-hidden outline outline-neutral-300 outline-1 bg-white flex gap-6 p-6 flex-wrap place-content-center">

                    {
                        players.map((player, i) => 
                            <div className="flex flex-col justify-center gap-4 items-center rounded-full">
                                <div className={`w-20 h-20 rounded-full border-4 player-${player.number} text-4xl flex justify-center items-center`}><FontAwesomeIcon className='m-auto' icon={icons[player.number]} /></div>
                                <div className='text-xl font-semibold'>{player.name}</div>
                            </div>)
                    }

                </div>

                <div>
                    <button type="submit" disabled={players.find(Boolean)?._id !== socket.id} onClick={handleStart} className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm uppercase font-medium rounded-lg text-white bg-indigo-600 disabled:bg-slate-300 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    </span>
                    {players.find(Boolean)?._id === socket.id ? `Start Game` : `Waiting for ${players.find(Boolean)?.name} to start...`}
                    </button>
                </div>

            </div>
        </div>
    )
}

export default Lobby