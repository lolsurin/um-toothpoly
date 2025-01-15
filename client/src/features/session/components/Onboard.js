import { useEffect, useState, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { SocketContext } from '../../../context/socket'
import { sessionSetState } from '../sessionSlice'
import Transition from '../../Transition'
import { useDispatch } from 'react-redux'

function Onboard() {

    const dispatch = useDispatch()
    const socket = useContext(SocketContext)
    const params = useParams()
    const navigate = useNavigate()
    const [name, setName] = useState("")
    const [roomError, setRoomError] = useState("")
    const [roomOK, setRoomOK] = useState(true)

    const handleJoinLobby = (e) => {

        socket.emit('validate:room', {code: params.code}, callback => {
            if (callback.ok) {
                socket.emit('session:join', { code: params.code, name }, callback => {
                    if (callback.ok) {
                        navigate(`/${params.code}/wait`)
                    }
                })
            } else {
                setRoomError(callback.error)
                setRoomOK(false)
            }
        })

        
        e.preventDefault()
    } 

    useEffect(() => {
        dispatch(sessionSetState('onboarding'))

        // Room OK?
        socket.emit('validate:room', {code: params.code}, callback => {
            if(callback.ok) {
                // 
            } else {
                // 
                navigate('/')
            }
        })

        // User OK?
        socket.emit('validate:clientAlreadyInRoom', (callback) => {
            if (!callback.ok) {
                
                navigate('/')
            }
        })

        return() => {
            socket.off('validate:room')
            socket.off('validate:clientAlreadyInRoom')
        }
    }, [socket])

    return (
            <Transition>
                <div className='flex flex-col justify-center h-full gap-8 m-auto text-center divide-y font-jakarta'>

                    <div className='flex gap-4 flex-col'>
                        <p className="text-lg font-semibold uppercase text-slate-500">Joining room</p>
                        <div className='p-4 outline outline-green-500 w-fit m-auto rounded-lg'>
                            <p className="text-6xl font-bold uppercase">{ params.code }</p>
                        </div>
                        <p className="text-lg font-semibold text-slate-500">Share the code with your friends to have them join you!</p>
                    </div>
                

                    <form className="flex flex-col pt-8 space-y-6 content-center justify-center" onSubmit={e => handleJoinLobby(e)}>
                        
                        <p className="text-lg font-semibold uppercase text-slate-500">Enter your name</p>

                        <div className="-space-y-px m-auto">
                            <div>
                                <label className="sr-only">Name</label>
                                <input id="name" name="name" type="name" required autoComplete='off' onChange={e => setName(e.target.value)} value={name} className="relative block px-4 py-6 text-2xl font-semibold text-center text-indigo-900 border rounded-md appearance-none placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10" placeholder="Player 1" />
                            </div>
                        </div>

                        <div className='min-w-sm m-auto'>
                            <button type="submit" disabled={!name} className="relative flex justify-center w-48 px-4 py-4 text-sm font-medium text-white uppercase bg-indigo-600 border border-transparent rounded-lg group disabled:bg-slate-300 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                    
                                    { !name && 
                                        <svg className="w-5 h-5 bg-slate-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">                        
                                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                        </svg> 
                                    }
                                </span>
                                { roomOK ? "Join Room" : roomError }
                            </button>

                        </div>
                    </form>
                </div>
            </Transition>  
    )
}

export default Onboard