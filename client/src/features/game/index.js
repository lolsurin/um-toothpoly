import Transition from "../Transition"
import Tutorial from "./components/Tutorial"
import WaitForPlayers from "./components/WaitForPlayers"
import Stage from "./components/Stage"
import Side from "./components/Side"
import Question from "./components/Question"
import GameOver from "./components/GameOver"

import { useEffect, useContext, useState, useRef } from "react"
import { SocketContext } from "../../context/socket"
import { useDispatch, useSelector } from "react-redux"
import { sessionSetInGame } from "../session/sessionSlice"
import { 
    gameSetGame, 
    gameSetMyId,
    gameDisable,
    gameEnable,
    gameSetTurn,
    gameSetTimerId,
    gameSetMoving,
    gameSetPlayer,
    gameSetInQuestion,
    gameDim
} from "./gameSlice"
import { motion, useAnimation } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { BadgeCheckIcon, XCircleIcon } from '@heroicons/react/solid'

const Game = () => {

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const animEventControls = useAnimation()
    const animQuestionControls = useAnimation()
    const animBadgeControls = useAnimation()
    const animGameOverControls = useAnimation()

    const id = useSelector(state => state.session.id)

    const allPlayersReady = useSelector((state) => !state.game.players?.find((player) => player.state === 'tutorial'))
    const shouldDim = useSelector(state => state.game.isDimmed)
    const clientPlayer = useSelector((state) => state.game.players?.find((player) => player._id === id))
    const allPlayers = useSelector((state) => state.game.players)
    const gameDisabled = useSelector((state) => state.game.disable)
    const turn = useSelector((state) => state.game.turn)
    const myTurn = allPlayers[turn]?._id === id 

    const socket = useContext(SocketContext)

    const [eventCallout, setEventCallout] = useState('')
    const [question, setQuestion] = useState({})
    const [correct, setCorrect] = useState(null)

    let diceRef = useRef(null)

    const popEventCallout = async () => {
        await animEventControls.start({
            display: 'flex',
            opacity: 1,
            transition: { duration: .25 }
        })
        await animEventControls.start({
            opacity: 0,
            transition: { delay: .5, duration: .25 }
        })
        await animEventControls.start({
            display: 'none',
        })
    }

    const badgeAnimation = async (correct) => {
        setCorrect(correct)
        await animBadgeControls.start({
            display: 'flex',
            opacity: 1,
            transition: { duration: .25 }
        })

        await animBadgeControls.start({
            opacity: 0,
            transition: { delay: .5, duration: .25 }
        })

        await animBadgeControls.start({
            display: 'none',
        })
        setCorrect(null)
    }
    
    // hide on server response
    const hideQuestion = async () => {
        await animQuestionControls.start({
            top: '-50%',
            transition: { duration: .25, type: 'spring', stiffness: 100 }
        })
        await animQuestionControls.start({
            display: 'none'
        })
    }
    
    useEffect(() => {

        const popQuestion = async () => {
            await animQuestionControls.start({
                display: 'flex',
                top: '50%',
                transition: { duration: .25, type: 'spring', stiffness: 100 }
            })
    
            if (!myTurn) return // only emit for current player, other players react from server events
    
            // 
            let timerId = setTimeout(async () => {
                // time out prompt
                socket.emit("game:set", {
                    event: 'GAME_QUESTION_UNANSWERED'
                })
            }, 21000)
    
            dispatch(gameSetTimerId(timerId))
        }

        dispatch(sessionSetInGame(true))
        dispatch(gameSetMyId(socket.id))

        // if(inGame){
        //     
        // } else {
        //     
        // }

        socket.emit('game:fetch', callback => {
            
            if (callback.ok) {
                
                navigate('/')
            } else {
                
            }
        })

        socket.on('game:disable', () => {
            // 
            dispatch(gameDisable())
        })

        socket.on('game:enable', () => {
            // 
            dispatch(gameEnable())
        })

        const nextTurn = () => {
            socket.emit('validate:okToEmit', (cb) => {
                if (cb.ok) {
                    
                    socket.emit('game:set', { event: 'GAME_NEXT_TURN'  })
                } else {
                    
                }
            })
        }

        socket.on('game:update', async data => {
            switch (data.event) {
                case 'GAME_PLAYER_READY':
                    
                    dispatch(gameSetGame(data.room))
                    break
                case 'GAME_DICE_ROLLED':
                    
                    diceRef.current.rollAll([data.rolled])
                    await new Promise(r => setTimeout(r, 2000));
                    setEventCallout('Rolled ' + data.rolled + '!')
                    await popEventCallout()
                    
                    dispatch(gameSetGame(data.room))
                    break
                case 'GAME_MOVE_COMPLETED':
                    
                    if (myTurn) {
                        nextTurn()
                    }
                    break
                case 'GAME_QUESTION':
                    
                    setEventCallout('Question!')
                    // 
                    setQuestion(data.question)
                    
                    await popEventCallout()
                    dispatch(gameSetInQuestion(true))
                    await popQuestion()
                    break
                case 'GAME_QUESTION_ANSWERED_CORRECT':
                    
                    await badgeAnimation(true)
                    await hideQuestion()
                    // dispatch(gameSetGame(data.room))
                    if (data.move) {
                        
                        dispatch(gameSetPlayer({
                            number: data.playerNumber,
                            player: data.player,
                        }))
                        // wait for 1 second
                        await new Promise(r => setTimeout(r, 1000));
                        
                    } else {
                        
                        // need additional check to check if current state is still the players turn
                        if (myTurn) {
                            // 
                            // socket.emit('game:set', { event: 'GAME_NEXT_TURN'  })
                            nextTurn()
                        }
                    }

                    dispatch(gameSetInQuestion(false))
                    
                    break
                case 'GAME_QUESTION_ANSWERED_INCORRECT':
                case 'GAME_QUESTION_UNANSWERED':
                    
                    await badgeAnimation()
                    await hideQuestion()
                    if (data.move) {
                        dispatch(gameSetPlayer({
                            number: data.playerNumber,
                            player: data.player,
                        }))
                        // wait for 1 second
                        await new Promise(r => setTimeout(r, 1000));
                        
                    } else {
                        if (myTurn) {
                            // 
                            // socket.emit('game:set', { event: 'GAME_NEXT_TURN'  })
                            nextTurn()
                        }
                    }
                    
                    dispatch(gameSetInQuestion(false))
                    
                    break
                case 'GAME_NEXT_TURN':
                    
                    
                    dispatch(gameSetTurn(data.turn))
                    
                    if (allPlayers[data.turn]._id === id) {
                        setEventCallout('Your turn!')
                    } else {
                        setEventCallout(`${allPlayers[data.turn].name}'s turn!`)
                    }                    

                    await popEventCallout()

                    dispatch(gameSetMoving())
                    break
                case 'GAME_OVER':
                    
                    dispatch(gameSetGame(data.room))
                    setEventCallout('Game Over!')
                    dispatch(gameDim())
                    await popEventCallout()
                    await popGameOverWindow()
                    break
                case 'PLAYER_DISCONNECTED':
                    
                    dispatch(gameSetGame(data.room))
                    break
                default:
                    break
            }
        })

        const popGameOverWindow = async () => {
            await animGameOverControls.start({
                display: 'flex',
                top: '50%',
                transition: { duration: .25, type: 'spring', stiffness: 100 }
            })
        }

        return () => {
            socket.off('game:fetch')
            socket.off('game:update')
            socket.off('game:disable')
            socket.off('game:enable')
        }

    }, [myTurn])

    const beforeUnloadListener = (event) => {
        event.preventDefault();
        return event.returnValue = "Are you sure you want to exit?";
     };

    useEffect(() => {
        window.addEventListener("beforeunload", beforeUnloadListener, {capture: true})
    }, []);

    return (
        <Transition>

            <div 
                className='fixed right-8 md:right-14 top-10 bg-red-500 hover:scale-110 text-white px-5 py-2 rounded-md font-jakarta'
                onClick={() => {
                    let text = 'Are you sure you want to leave? All your progress will be lost!'
                    if (window.confirm(text) === true) {
                        socket.emit('session:set', {
                            event: 'GAME_LEAVE'
                        })
                        navigate('/')
                    }
                }}
                >
                Leave
            </div>

            { !allPlayersReady && <WaitForPlayers />}
            { clientPlayer.state === 'tutorial' && <Tutorial />}
            
            <Event animate={animEventControls} prompt={eventCallout} />
            <Badge animate={animBadgeControls} correct={correct} />
            <Question question={question} animate={animQuestionControls}/>
            <GameOver animate={animGameOverControls} />
            <div className={`${!allPlayersReady || gameDisabled ? 'pointer-events-none': ''} flex items-stretch flex-1 flex-grow w-full h-full ${!allPlayersReady || !shouldDim ? 'brightness-50' : ''}`}>
                <div className={`flex flex-col md:flex-row justify-center w-full rounded-3xl bg-white`}>
                    {/* <Side></Side>  */}
                    <div className="flex aspect-square">
                        <Stage />
                    </div> 
                    <Side ref={diceRef}/> 
                </div>
            </div>
        </Transition>
    )
}

const Badge = ({animate, correct}) => {
    return (

        <motion.div
            animate={animate}
            initial={{display: 'none'}}
            className="absolute z-[100] flex-col w-32 h-32 rounded-full bg-white -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
        >
            {
                correct ? <BadgeCheckIcon className="text-green-700" /> : <XCircleIcon className="text-red-700" />
            }
            
        </motion.div>
    )
}

const Event = ({animate, prompt}) => (
    <motion.div 
        animate={animate} 
        initial={{display: 'none'}} 
        className="absolute z-50 flex-col w-3/4 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 bg-white px-4 py-2 border-8 border-black" >
        <div className="p-4">
            <h1 className="text-center font-black text-6xl font-jakarta">{prompt}</h1>
        </div>
    </motion.div>
)

export default Game