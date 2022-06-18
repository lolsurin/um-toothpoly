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
    gameDiceRolled,
    gameDisable,
    gameEnable,
    gameSetTurn,
    gameSetPlayers,
    gameResetPlayerMotion,
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

    const inGame = useSelector(state => state.session.inGame)
    const allPlayersReady = useSelector((state) => !state.game.players?.find((player) => player.state === 'tutorial'))
    const shouldDim = useSelector(state => state.game.isDimmed)
    const clientPlayer = useSelector((state) => state.game.players?.find((player) => player._id === id))
    const allPlayers = useSelector((state) => state.game.players)
    const gameDisabled = useSelector((state) => state.game.disable)
    const turn = useSelector((state) => state.game.turn)
    // const myTurn = useSelector((state) => state.game.players[state.game.turn]._id === clientPlayer._id)
    const myTurn = allPlayers[turn]?._id === id 
    //const myTurn = useSelector(() => turn === clientPlayer?.number)

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
    
            // console.log('timing down this client ' + turn)
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
        //     console.log('in game')
        // } else {
        //     console.log('not in game')
        // }

        socket.emit('game:fetch', callback => {
            console.log(callback)
            if (callback.ok) {
                console.log(callback.room.players)
                navigate('/')
            } else {
                console.log("room not found")
            }
        })

        socket.on('game:disable', () => {
            // console.log('disabling game')
            dispatch(gameDisable())
        })

        socket.on('game:enable', () => {
            // console.log('enabling game')
            dispatch(gameEnable())
        })

        const nextTurn = () => {
            socket.emit('validate:okToEmit', (cb) => {
                if (cb.ok) {
                    console.log('EMITTING GAME_NEXT_TURN')
                    socket.emit('game:set', { event: 'GAME_NEXT_TURN'  })
                } else {
                    console.log(cb.error)
                }
            })
        }

        socket.on('game:update', async data => {
            switch (data.event) {
                case 'GAME_PLAYER_READY':
                    console.log('GAME_PLAYER_READY')
                    dispatch(gameSetGame(data.room))
                    break
                case 'GAME_DICE_ROLLED':
                    console.log('GAME_DICE_ROLLED')
                    diceRef.current.rollAll([data.rolled])
                    await new Promise(r => setTimeout(r, 2000));
                    setEventCallout('Rolled ' + data.rolled + '!')
                    await popEventCallout()
                    
                    dispatch(gameSetGame(data.room))
                    break
                case 'GAME_MOVE_COMPLETED':
                    console.log('GAME_MOVE_COMPLETED')
                    if (myTurn) {
                        nextTurn()
                    }
                    break
                case 'GAME_QUESTION':
                    console.log('GAME_QUESTION')
                    setEventCallout('Question!')
                    // console.log(data.question)
                    setQuestion(data.question)
                    
                    await popEventCallout()
                    dispatch(gameSetInQuestion(true))
                    await popQuestion()
                    break
                case 'GAME_QUESTION_ANSWERED_CORRECT':
                    console.log('GAME_QUESTION_ANSWERED_CORRECT')
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
                            // console.log('EMITTING GAME_NEXT_TURN')
                            // socket.emit('game:set', { event: 'GAME_NEXT_TURN'  })
                            nextTurn()
                        }
                    }

                    dispatch(gameSetInQuestion(false))
                    
                    break
                case 'GAME_QUESTION_ANSWERED_INCORRECT':
                case 'GAME_QUESTION_UNANSWERED':
                    console.log('GAME_QUESTION_UNANSWERED_OR_INCORRECT')
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
                            // console.log('EMITTING GAME_NEXT_TURN')
                            // socket.emit('game:set', { event: 'GAME_NEXT_TURN'  })
                            nextTurn()
                        }
                    }
                    
                    dispatch(gameSetInQuestion(false))
                    
                    break
                case 'GAME_NEXT_TURN':
                    console.log('GAME_NEXT_TURN')
                    
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
                    console.log('GAME_OVER')
                    dispatch(gameSetGame(data.room))
                    setEventCallout('Game Over!')
                    dispatch(gameDim())
                    await popEventCallout()
                    await popGameOverWindow()
                    break
                case 'PLAYER_DISCONNECTED':
                    console.log('PLAYER_DISCONNECTED')
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

    useEffect(() => {
        const unloadCallback = (event) => {
          event.preventDefault();
          event.returnValue = "";
          return "";
        };
      
        window.addEventListener("beforeunload", unloadCallback);
        return () => window.removeEventListener("beforeunload", unloadCallback);
    }, []);

    return (
        <Transition>
            { !allPlayersReady && <WaitForPlayers />}
            { clientPlayer.state === 'tutorial' && <Tutorial />}
            
            <Event animate={animEventControls} prompt={eventCallout} />
            <Badge animate={animBadgeControls} correct={correct} />
            <Question question={question} animate={animQuestionControls}/>
            <GameOver animate={animGameOverControls} />
            <div className={`${!allPlayersReady || gameDisabled ? 'pointer-events-none': ''} flex items-stretch flex-1 flex-grow w-full h-full ${!allPlayersReady || !shouldDim ? 'brightness-50' : ''}`}>
                <div className={`flex flex-col md:flex-row justify-center w-full border-4 rounded-3xl bg-white`}>
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