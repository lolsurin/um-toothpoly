import { useState, useContext, useEffect } from 'react'
import { SocketContext } from '../context/socket'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { setId } from '../features/session/sessionSlice'
import { useDispatch } from 'react-redux'

function Lobby() {
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const socket = useContext(SocketContext)
	const [roomField, setRoomField] = useState('')
	const [roomFound, setRoomFound] = useState(true)
	const [roomError, setRoomError] = useState('')

	const handleNewGame = (e) => {
		console.log('%cLOBBY', 'color: #00ff00;', 'new game')

		socket.emit('game:new', (callback) => {
			console.log(callback)
			navigate(`/${callback.code}`) // go to room onboarding
		})
		e.preventDefault()
	}

	const handleJoinGame = (e) => {
		// can be simplified, let room checks happen on the onboard page
		socket.emit('validate:room', { code: roomField }, (callback) => {
			console.log(`looking for room ${roomField}`)
			if (callback.ok) {
				navigate(`/${roomField}`)
			} else {
				console.log('room not found')
				setRoomError(callback.error)
				setRoomFound(false)
			}
		})

		e.preventDefault()
	}

	useEffect(() => {
		console.log('rendering')
		socket.emit('validate:client')
	}, [])

	return (
		<div className='w-1/2 place-self-center'>
			<motion.div
				whileHover={{
					scale: 1.05,
					transition: { duration: 0.2 },
				}}
				whileTap={{ scale: 0.95 }}
			>
				<button
					type='submit'
					onClick={(e) => handleNewGame(e)}
					className='relative flex justify-center w-full px-4 py-8 mb-8 text-2xl font-medium text-white uppercase bg-indigo-600 border border-transparent rounded-lg group hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
				>
					🦷 Start New Game
				</button>
			</motion.div>

			<motion.div
				whileHover={{
					scale: 1.05,
					transition: { duration: 0.2 },
				}}
				whileTap={{ scale: 0.95 }}
			>
				<button
					type='submit'
					onClick={(e) => handleNewGame(e)}
					className='relative flex justify-center w-full px-4 py-8 mb-8 text-2xl font-medium text-white uppercase border border-transparent rounded-lg bg-slate-600 group hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
				>
					Join Existing Game
				</button>
			</motion.div>

			{/* <form
				className='mt-8 space-y-6'
				onSubmit={(e) => handleJoinGame(e)}
			>
				<div className='mt-16 text-2xl font-semibold text-center text-slate-500'>
					Have a room code? Enter below
				</div>
				<input type="hidden" name="roomField" />
				<div className='-space-y-px border rounded-md'>
					<div>
						<label className='sr-only'>Room Code</label>
						<input
							id='roomCode'
							name='roomCode'
							type='roomCode'
							autoComplete='off'
							required
							onChange={(e) => {
								setRoomField(e.target.value.toUpperCase())
								setRoomFound(true)
							}}
							value={roomField}
							className='relative block w-full px-4 py-6 text-center text-gray-900 uppercase rounded-lg appearance-none placeholder-slate-400'
							placeholder='ROOM CODE'
						/>
					</div>
				</div>

				<div>
					<button
						type='submit'
						disabled={!roomField}
						className={`group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm uppercase font-medium rounded-lg text-white ${
							roomFound
								? `bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500`
								: `bg-red-600`
						} disabled:bg-slate-300  focus:outline-none focus:ring-2 focus:ring-offset-2 `}
					>
						<span className='absolute inset-y-0 left-0 flex items-center pl-3'>
							text-indigo-500
							{(!roomField || !roomFound) && (
								<svg
									className={`h-5 w-5 ${
										!roomField
											? `bg-slate-300`
											: `bg-red-600`
									}`}
									xmlns='http://www.w3.org/2000/svg'
									viewBox='0 0 20 20'
									fill='currentColor'
									aria-hidden='true'
								>
									<path
										fillRule='evenodd'
										d='M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z'
										clipRule='evenodd'
									/>
								</svg>
							)}
						</span>
						{roomFound ? 'Join Room' : roomError}
					</button>
				</div>
			</form> */}
		</div>
	)
}

export default Lobby
