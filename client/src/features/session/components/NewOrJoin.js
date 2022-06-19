import { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { SocketContext } from '../../../context/socket'
import Transition from '../../Transition'
import { sessionSetState, sessionGetState, sessionReset, sessionId } from '../sessionSlice'
import { gameReset } from '../../game/gameSlice' 

/**
 * @description Lobby component
 * @allowed Anywhere
 * @action Kill existing room association
 * @author Aqlan Nor Azman
 * @returns {JSX.Element}
 */

function NewOrJoin() {
	const dispatch = useDispatch()
	const navigate = useNavigate()

	const prevState = useSelector(sessionGetState)
	const socket = useContext(SocketContext)

	/**
	 * Emits a request to create a new room
	 * @param {event} e 
	 */
	const handleNewGame = (e) => {
		socket.emit('session:new', (callback) => {
			navigate(`${callback.code}`) // go to room onboarding
		})
		e.preventDefault()
	}

	useEffect(() => {
		
		if (!prevState.inLobby) {
			
			socket.emit('validate:forceClientCleanState')
		}
		
		dispatch(sessionReset())
		dispatch(gameReset())
		dispatch(sessionId(socket.id)) // reassign?
		dispatch(sessionSetState('lobby'))
		// maybe need to check from state if client is already in room?

		

	}, [])

	const animation = {
		hover: {
			scale: 1.05,
			transition: { duration: 0.2 },
		},
		tap: { scale: 0.95 }
	}

	return (
		<Transition>
			<div className='flex flex-col items-center justify-center h-full gap-6'>

				<motion.div
					whileHover={animation.hover}
					whileTap={animation.tap}
				>
					<button
						type='submit'
						onClick={(e) => handleNewGame(e)}
						className='h-24 px-4 py-2 text-2xl font-bold text-white uppercase bg-indigo-600 rounded-lg w-96 hover:bg-indigo-700'
					>
						🦷 Start New Game
					</button>
				</motion.div>
			
				<motion.div
					whileHover={animation.hover}
					whileTap={animation.tap}
				>
					<button
						type='submit'
						onClick={(e) => navigate('/join')}
						className='h-24 px-4 py-2 text-2xl font-bold text-white uppercase rounded-lg w-96 bg-slate-600 hover:bg-slate-700'
					>
						Join Game From Code
					</button>
				</motion.div>

				<div className='text-center text-slate-500'>How To Play</div>
			</div>

		</Transition>

	)
}

export default NewOrJoin
