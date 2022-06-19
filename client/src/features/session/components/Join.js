import { useState, useContext, useEffect } from 'react'
import { SocketContext } from '../../../context/socket'
import { useNavigate } from 'react-router-dom'
import { sessionSetState } from '../sessionSlice'
import { useDispatch } from 'react-redux'
import Transition from '../../Transition'

import ReactCodeInput from 'react-code-input'

const Join = () => {
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const socket = useContext(SocketContext)
	const [roomField, setRoomField] = useState('')
	const [roomFound, setRoomFound] = useState(true)
	const [roomError, setRoomError] = useState('')

	const handleJoinGame = (e) => {
		// can be simplified, let room checks happen on the onboard page
		socket.emit('validate:room', { code: roomField.toUpperCase() }, (callback) => {
			
			if (callback.ok) {
				navigate(`/${roomField}`)
			} else {
				
				setRoomError(callback.error)
				setRoomFound(false)
			}
		})

		e.preventDefault()
	}

	useEffect(() => {
		
        dispatch(sessionSetState('joining'))
		socket.emit('validate:clientAlreadyInRoom', (callback) => {
            if (!callback.ok) {
                
                navigate('/')
            }
        })
	}, [])

    const props = {
        className: '',
        inputStyle: {
          fontFamily: 'sans-serif',
          margin:  '.25rem',
          MozAppearance: 'textfield',
          width: '4rem',
          borderRadius: '3px',
          fontSize: '3rem',
          height: '5rem',
          textAlign: 'center',
          fontWeight: 'bold',

        //   paddingLeft: '7px',
          color: 'black',
          border: '1px solid lightgray'
        },
        inputStyleInvalid: {
            fontFamily: 'sans-serif',
            margin:  '.25rem',
            MozAppearance: 'textfield',
            width: '4rem',
            borderRadius: '3px',
            fontSize: '3rem',
            height: '5rem',
            textAlign: 'center',
            fontWeight: 'bold',
            color: 'black',
            border: '1px solid red'
        }
      }

	return (
		<div className='min-w-min m-auto'>
            <Transition>

                
                <form
                    className='flex flex-col space-y-6 justify-center items-center'
                    onSubmit={(e) => handleJoinGame(e)}
                >
                    <div className='text-2xl font-semibold text-center text-slate-500 m-auto'>
                        Have a room code? Enter below
                    </div>

                    <div className=''>
                    
                        <ReactCodeInput type='text' fields={5} {...props} 
                            onChange={(e) => {
                                //e.preventDefault()
                                setRoomFound(true)
                                setRoomField(e.toUpperCase())
                            }}
                            isValid={roomFound}
                            />
                    </div>
                    

                    <div>
                        <button
                            type='submit'
                            disabled={!roomField}
                            className={`group relative w-56 flex justify-center py-4 px-4 border border-transparent text-sm uppercase font-medium rounded-lg text-white ${
                                roomFound
                                    ? `bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500`
                                    : `bg-red-600`
                            } disabled:bg-slate-300  focus:outline-none focus:ring-2 focus:ring-offset-2 `}
                        >
                            <span className='absolute inset-y-0 left-0 flex items-center pl-3'>
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
                </form>
            </Transition>
		</div>
	)
}

export default Join
