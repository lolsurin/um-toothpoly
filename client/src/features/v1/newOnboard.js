import { useEffect, useState, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { SocketContext } from '../context/socket'
import { motion, useAnimation } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClone, faCircleCheck } from '@fortawesome/free-solid-svg-icons'

function Onboard() {

    const socket = useContext(SocketContext)
    const params = useParams()
    const navigate = useNavigate()
    const [name, setName] = useState("")
    const [roomError, setRoomError] = useState("")
    const [roomOK, setRoomOK] = useState(true)

    const alertVariants = {
        hidden: {opacity:0, transition: {delay: .75, duration: 0.25}},
        visible: {opacity:1, transition: {duration: 0.25}},
    }
    const controls = useAnimation()
    const alertShowHide = async () => {
        await controls.start('visible')
        return await controls.start('hidden')
    }

    const handleJoinLobby = (e) => {

        socket.emit('validate:room', {code: params.code}, callback => {
            if (callback.ok) {
                socket.emit('game:join', { code: params.code, name }, callback => {
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
        socket.emit('validate:room', {code: params.code}, callback => {
            if(callback.ok) {
                console.log('validated')
            } else {
                console.log('room not found')
                navigate('/')
            }
        })

        return() => {
            socket.off('game:join')
            socket.off('validate:room')
        }
    }, [socket])

    return (
        <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-5">
            <div className="relative flex items-center mb-14">
                <img src="/um-lg.png" alt="Um Toothpoly" className="h-12"/>
                <span className="flex-shrink mx-4 text-gray-700 font-bold text-2xl">UNIVERSITI MALAYA TOOTHPOLY 🦷</span>
            </div>

            <>    
                <span className='flex gap-4' onClick={e => {
                        navigator.clipboard.writeText(window.location.href)
                        alertShowHide()
                    }}>
                    <p className="text-4xl font-bold uppercase text-slate-800 ">🦷 {params.code} </p>   
                    <button><FontAwesomeIcon className="text-lg place-self-center text-slate-400" icon={faClone} /></button>
                    <motion.div animate={controls} variants={alertVariants} initial={"hidden"} className='flex gap-2 px-4 bg-green-200 rounded-lg border border-green-300'>
                        <FontAwesomeIcon icon={faCircleCheck} className='text-green-500 place-self-center' />
                        <span className='place-self-center text-slate-600'>Copied to Clipboard</span>
                    </motion.div> 
                </span>
                <p className="text-lg font-semibold uppercase text-slate-500">Enter your name</p>
                <form className="mt-4 space-y-6" onSubmit={e => handleJoinLobby(e)}>
                    
                    {/* <input type="hidden" name="roomField" /> */}
                    <div className="rounded-md -space-y-px">
                        <div>
                            <label className="sr-only">Name</label>
                            <input id="name" name="name" type="name" required autoComplete='off' onChange={e => setName(e.target.value)} value={name} className="appearance-none relative block w-full px-4 py-6 border placeholder-slate-400 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-center" placeholder="ENTER YOUR NAME" />
                        </div>
                    </div>

                    <div>
                        <button type="submit" disabled={!name} className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm uppercase font-medium rounded-lg text-white bg-indigo-600 disabled:bg-slate-300 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                {/* text-indigo-500 */}
                                { !name && 
                                    <svg className="h-5 w-5 bg-slate-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">                        
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                    </svg> 
                                }
                            </span>
                            { roomOK ? "Join Room" : roomError }
                        </button>
                    </div>
                </form>
            </>

        </div>
        </div>
    )
}

export default Onboard