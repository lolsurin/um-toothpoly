import { useContext, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { socket, SocketContext } from "../context/socket"
import { motion, useAnimation } from "framer-motion"
import { usePageVisibility } from 'react-page-visibility'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCat, faCrow, faSpider, faFish, faXmark, faCrown, faCircleArrowRight  } from '@fortawesome/free-solid-svg-icons'
import DiceComp from './dice'
import rules from '../assets/rules.json'
// Bringing all the states up to Game() and consolidating emit events only on Game component
import { setGame, selectGame } from '../features/game/gameSlice'
import { useSelector, useDispatch } from "react-redux"

function Game() {

    const isVisible = usePageVisibility()
    const navigate = useNavigate()
    const socket = useContext(SocketContext)
    const params = useParams()
    const calloutControls = useAnimation()

    // states
    // const [game, setGame] = useState() // main game state, to sync with server
    const game = useSelector(selectGame)
    const dispatch = useDispatch()

    const [moving, setMoving] = useState(false)
    const [pidx, setPidx] = useState() // player number
    const [scene, setScene] = useState()

    useEffect(() => {

        socket.emit('game:data:fetch', callback => {
            if (callback.ok) {
                console.log("fetching initial game data")
                console.log(callback.room)
                dispatch(setGame(callback.room))
                setPidx(callback.room.players.find(p => p._id === socket.id).number)
            } else {
                console.log("disconnected")
                navigate('/')
            }
        })

        socket.on('game:data:update', data => {
            console.log("updating game data")

            dispatch(setGame(data))
        })

        return () => {
            socket.off('game:data:fetch')
            socket.off('game:data:update')
            socket.off('game:diceRoll')
            socket.off('game:diceRollComplete')
        }

    }, [socket, isVisible])

    const landedOn = (tile) => {
        setMoving(true)
        if(game?.players[game.turn]._id === socket.id) socket.emit('game:diceRoll', tile)
    }

    // DEV
    // const goTo14 = () => {
    //     setMoving(true)
    //     socket.emit('game:diceRoll', 98)
    // }
    // DEV

    const submitAnswerAction = (a) => {
        console.log('submitAnswerAction ' + a)
        socket.emit('game:submitAnswer', a, callback => {
            // if incorrect, the server wont update motion so we need to update it here
            if (callback.ok) {
                socket.emit('game:nextTurn')
                setMoving(false)
            }
        })
    }

    const onAnimComplete = async () => {   
        console.log('animation completed')
        setScene(game.scene)
        
        if (!moving) return
        console.log(`player ${pidx} arrived at tile ${game.players[pidx]?.position}`)

        let rule = rules.find(r => r.tile === game.players[pidx].position)

        if (rule) {

            // play callout animations
            await calloutControls.start({ 
                fontSize: ['0rem','4.5rem','4.5rem','4.5rem'], 
                opacity: [0, 1, 1, 0],
                transition: { duration: 1, times: [0, 0.2, 0.7, 1] }
            })
            
            console.log(`rule found for tile ${game.players[pidx].position}`)
            console.log(rule)
            socket.emit('game:event', rule)
            return
        }

        if (game.scene !== 'end' && game?.players[game.turn]._id === socket.id) socket.emit('game:nextTurn') // no next turn on end
        setMoving(false)
        console.log('animation complete')
        
    }

    return (
        <div className="flex flex-col w-screen h-full min-h-screen gap-2 p-4 m-auto max-w-screen-2xl min-w-fit">

            <header className="relative flex items-center h-max">
                <img src="/um-lg.png" alt="Um Toothpoly" className="h-12"/>
                <span className="invisible mx-4 text-xs font-bold text-gray-700 sm:visible sm:text-xl">UNIVERSITI MALAYA TOOTHPOLY 🦷</span>
                <span className="mx-4 text-2xl font-bold">{ game?.code }</span>
                <span className="flex gap-2 ml-auto">
                    <button onClick={e => {socket.emit('game:leave_'); navigate('/')}} className="flex justify-center w-12 h-12 px-4 py-4 font-medium text-white bg-red-400 rounded-full hover:bg-red-600">
                        <FontAwesomeIcon icon={faXmark} className=""/>
                    </button>
                    {/* DEV */}
                    <button onClick={e => {
                        setMoving(true)
                        if(game?.players[game.turn]._id === socket.id) socket.emit('game:diceRoll', 97)
                    }} className="flex justify-center w-12 h-12 px-4 py-4 font-medium text-white bg-blue-400 rounded-full hover:bg-red-600">
                        <FontAwesomeIcon icon={faXmark} className=""/>
                    </button>

                    {/* DEV */}
                    <button onClick={e => {
                        setMoving(true)
                        if(game?.players[game.turn]._id === socket.id) socket.emit('game:diceRoll', 2)
                    }} className="flex justify-center w-12 h-12 px-4 py-4 font-medium text-white bg-blue-400 rounded-full hover:bg-red-600">
                        <FontAwesomeIcon icon={faXmark} className=""/>
                    </button>

                    {/* DEV */}
                    <button onClick={e => {
                        setMoving(true)
                        if(game?.players[game.turn]._id === socket.id) socket.emit('game:diceRoll', 4)
                    }} className="flex justify-center w-12 h-12 px-4 py-4 font-medium text-white bg-blue-400 rounded-full hover:bg-red-600">
                        <FontAwesomeIcon icon={faXmark} className=""/>
                    </button>
                </span>
            </header>

            <main className="relative flex flex-col justify-center flex-1 gap-2 md:flex-row">

                {/* <Stage 
                    game={game}
                    moving={moving}
                    calloutControls={calloutControls}
                    submitAnswerAction={submitAnswerAction} 
                    onAnimComplete={onAnimComplete} /> */}

                <Side game={game} landedOn={landedOn} />

                
                {/* <GameOver game={game} scene={scene}/>     */}
                

            </main>

            <footer className="flex items-center uppercase text-slate-400">&copy; {new Date().getFullYear()} Universiti Malaya</footer>

            

        </div>
    )
}

const Stage = ({game, moving, calloutControls, submitAnswerAction, onAnimComplete}) => {

    return (
        <div className="relative aspect-square">
            
            <div className="relative h-full p-5 board">
                
                <Callout calloutControls={calloutControls} game={game} />

                <div className="relative w-full h-full">
                { game?.players?.map((p, i) => p.active && <Piece anim={p.motion} idx={p.number} onAnimComplete={onAnimComplete}  key={i}/>) }
                </div>
            </div> 
                   
            <Question game={game} moving={moving} submitAnswerAction={submitAnswerAction} />
        </div>       

    )
}

const Callout = ({game, calloutControls}) => {

    return(
        <div className="absolute flex flex-col -translate-x-1/2 translate-y-1/2 place-content-center left-1/2 bottom-1/2">
            <motion.div className="font-marker text-center text-slate-800 text-[0rem]" animate={calloutControls} initial={false}>
                {rules.find(r => r.tile === game?.players[game?.turn]?.position)?.event}!
            </motion.div>
        </div>
    )
}

const Piece = ({anim, idx, onAnimComplete}) => {
    return (
        <motion.div className={`            
            absolute
            translate-x-[-50%]
            translate-y-[50%]`}        
            animate={anim}
            transition={{ delay: .75, duration: anim.left.length * 0.20 }}
            initial={false}
            onAnimationComplete={onAnimComplete}
            >
                <PlayerPiece idx={idx}/>
            </motion.div>

    )
}

const PlayerPiece = ({idx, size}) => {
    let icons = [faCat, faCrow, faSpider, faFish]

    return (
        <div className="flex flex-col items-center justify-center gap-4 rounded-full shadow-lg">
            <div className={`w-12 h-12 rounded-full border-4 player-${idx} text-2xl flex justify-center items-center`}>
                <FontAwesomeIcon className='m-auto' icon={icons[idx]} />
            </div>
        </div>
    )
} 

const Question = ({game, moving, submitAnswerAction}) => {

    const [answered, setAnswered] = useState(false)
    const buttonControls = useAnimation()

    let lang = 'en'

    return (
        <div className={`${game?.scene !== 'event' ? `invisible`: ``} ${moving ? `bg-white` : `bg-slate-800 text-white`} card shadow-lg absolute flex flex-col place-content-center top-2/4 left-2/4 -translate-x-1/2 -translate-y-1/4 md:-translate-y-1/2 w-11/12 gap-3 p-3`}>

            <div className={`flex flex-col justify-center uppercase p-2 font-marker text-center text-lg`}>Question for { moving ? 'You': game?.players[game?.turn]?.name}</div>
            <div className="flex flex-col items-center justify-center flex-1 gap-2 p-3 ">

                <img className="mb-4 rounded shadow-lg h-44" src="/question-assets/dental-jaw-blue-overlay-1200x628-iStock-1145063557.jpg" alt="Dental Jaw"/>

                <div className="text-xl font-semibold text-center">
                    { game?.question[lang]?.question }
                </div>
            </div>
            <motion.div className="flex flex-row flex-wrap items-center justify-center flex-1 gap-3 p-3" animate={buttonControls}>
                {
                    game?.question[lang]?.answers.map((a, i) => <button 
                        key={i} 
                        disabled={!moving} 
                        className={`flex justify-center p-4 font-medium rounded w-48 
                            ${moving ? `bg-gray-200 hover:bg-gray-300`:`bg-slate-900 `}
                            ${answered ? a.correct ? `bg-green-400` : `bg-red-400` : ``}`}
                        onClick={async () => {
                            setAnswered(true)
                            await buttonControls.start({ scale: [1, 1.1, 1], transition: { duration: 0.7} })
                            submitAnswerAction(a.correct)
                            setAnswered(false)
                        }}>
                            { a.value } 
                        </button>)
                }
            </motion.div>
            
        </div>
    )
}

const Side = ({game, landedOn, diceRollAction, goTo14}) => {

    const socket = useContext(SocketContext)

    return (
        <aside className="flex flex-col flex-1 gap-2 md:flex-none md:w-1/4">
            <Leaderboard />
            <Dice myTurn={game?.players[game.turn]?._id === socket.id} landedOn={landedOn}/>
            {/* <Controls game={game} goTo14={goTo14}/> */}
        </aside>
    )
}

const Leaderboard = () => {
    const inGame = useSelector(state => state.inGame)
    const game = useSelector(selectGame)
    const dispatch = useDispatch()
    
    const socket = useContext(SocketContext)

    const players = useSelector(state => state.game.players)
    const won = useSelector(state => state.game.players.filter(p => p.is_winner))
    const playing = useSelector(state => state.game.players.filter(p => !p.is_winner && p.active))

    return(
        <>
        {
            inGame && 
            <div className="flex flex-col flex-wrap flex-1 gap-2 p-4">
                <p className="mb-4 text-xl font-bold">🏆 Leaderboard </p>

                <div className="flex flex-col bg-white rounded-lg">
                    {
                        game?.podium.map((i) => {
                            return (
                                <div key={i} className={`${socket.id === players[i]._id ? `bg-slate-800 text-white rounded-xl border-2 border-yellow-300`: ``} place-items-center pl-8 pr-4 py-2 flex flex-row gap-2 relative`}>

                                
                                    <div className='absolute right-3 place-self-center '>
                                        <FontAwesomeIcon icon={faCrown} className="mr-2 text-xl text-yellow-400" />
                                    </div>
                                

                                    <span className={`text-lg mr-2`}>
                                        <PlayerPiece idx={i} />   
                                    </span>
                                    <div className="flex flex-col flex-1">
                                        <span className="flex-1 text-lg font-bold">{players[i].name} </span>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>

                { 
                    playing.sort((a, b) => b.position - a.position).map((player, i) => {
                        return (
                            <div key={i} className={`${socket.id === player._id ? `bg-slate-800 text-white rounded-xl place-items-center`: ``} pl-8 pr-4 py-2 flex flex-row gap-2 relative`}>
                                {
                                    player._id === players[game.turn]._id &&
                                    <div className='absolute -translate-x-11 place-self-center '>
                                        <FontAwesomeIcon icon={faCircleArrowRight} className="mr-2 text-3xl text-green-700 bg-white rounded-full" />
                                    </div>
                                }
                                
                                <span className={`text-lg mr-2`}>
                                    <PlayerPiece idx={players.findIndex(p => p._id === player._id)} />   
                                </span>
                                <div className="flex flex-col flex-1">
                                    <span className="flex-1 text-lg font-bold">{player.name} </span>
                                    <span className="">📍{player.position}</span>
                                </div>
                            </div>
                        )
                    } ) 
                }
            </div>
        }
        </>
    )
}

const Dice = ({myTurn, landedOn}) => {


    return(
        <div className="self-center mb-12">
            {/* <p className="text-xl font-bold">🎲 Dice </p> */}
            <DiceComp enabled={myTurn} landedOn={landedOn}/>
        </div>
    )
}

const GameOver = ({game, scene}) => {

    const navigate = useNavigate()
    let placement = ['st', 'nd', 'rd', 'th']

    return(
        <div className={`${scene === 'end' ? ``: `hidden`} absolute bg-black w-screen h-full bg-opacity-80`}>

            <div className={`rounded-lg absolute flex flex-col gap-8 place-content-center py-14 px-10 top-2/4 left-2/4 -translate-x-1/2 -translate-y-1/2 w-fit h-fit bg-white`}>
                <span className="text-4xl tracking-wide text-center font-marker">🎉 Game Over 🎉</span>
                <div className="flex flex-col gap-4 p-4 overflow-hidden bg-white rounded-lg outline outline-neutral-300 outline-1">

                {
                    game?.podium.map((index, i) => {
                        return (
                            <div key={i} className={`place-items-center flex flex-row gap-4`}>
                                <span className="w-7 text-slate-500" >{i+1}<sup>{placement[i]}</sup></span>
                                <div className={`text-lg mr-2`}>
                                    <PlayerPiece idx={index} />   
                                </div>
                                <span className="flex-1 text-lg font-bold">{game?.players[index]?.name} </span>

                            </div>
                        )
                    })
                }

                </div>

                <div>
                    <button onClick={e => {socket.emit('game:leave_'); navigate('/')}} type="submit" className="relative flex justify-center w-full px-4 py-4 text-sm font-medium text-white uppercase bg-red-600 border border-transparent rounded-lg group disabled:bg-slate-300 hover:bg-red-700">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    </span>
                    Leave game
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Game