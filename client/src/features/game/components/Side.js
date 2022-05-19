import { useContext, useEffect, useRef, forwardRef } from "react"
import { SocketContext } from "../../../context/socket"
import { useDispatch, useSelector } from "react-redux"
import { motion, useAnimation } from "framer-motion" 
import { useMounted } from "../../../context/mounted"
import { gameSetMoving, gameIsAnimating } from "../gameSlice"
import ReactDice from 'react-dice-complete'
import './dice.css'
import Piece from "./Piece"

import { MdOutlineDoNotDisturbAlt } from "react-icons/md"

const Side = forwardRef((props, ref) => {

    const mounted = useMounted()
    const dispatch = useDispatch()
    const socket = useContext(SocketContext)
    const animDiceControls = useAnimation()
    const rolled = useSelector(state => state.game.events.rolled)
    const gameDisabled = useSelector((state) => state.game.disable)
    const isAnimating = useSelector((state) => state.game.isAnimating)
    const isMoving = useSelector((state) => state.game.moving)

    const players = useSelector((state) => state.game.players)
    const turn = useSelector((state) => state.game.turn)

    //let dice = useRef(null)

    // const me = useSelector((state) => state.game.players?.find((player) => player._id === socket.id))
    // const turn = useSelector(state => state.game.turn)
    // const myTurn = turn === me.number
    
    const myTurn = useSelector((state) => state.game.players[state.game.turn]._id === state.session.id)

    const disableRoll = !(!gameDisabled && myTurn && !isAnimating)
    const currentPosition = useSelector((state) => state.game.players[state.game.turn].position)

    const onPodium = [...players]?.filter(p => p.is_winner).sort((a, b) => b.podium - a.podium)
    const ranking = [...players]?.filter(p => !p.is_winner).sort((a, b) => b.position - a.position)

    const ranked =[...onPodium, ...ranking]
    const myId = useSelector((state) => state.session.id)


    useEffect(() => {

        // console.log(mounted())
        if (!mounted()) return

        animDiceControls.start({
            rotate: [0, 360],
        })

    }, [rolled])

    useEffect(() => {
        console.log(myId)
        ranked?.forEach((player, i) => {
            if (player._id === myId) {
                console.log('match at ', i)
            }
        })
        // console.log('rendered hehe')
    }, [])

    const roll = async () => {

        dispatch(gameSetMoving())
        dispatch(gameIsAnimating(true))
        console.log('clicking player at ' + currentPosition)

        let roll = Math.floor(Math.random() * 6) + 1
        let validRoll
        if (currentPosition === 97 && roll === 6) {
            validRoll = [1, 2, 3, 4, 5]
            roll = validRoll[Math.floor(Math.random() * validRoll.length)]
        }
        if (currentPosition === 98 && roll === 4) {
            validRoll = [1, 2, 3, 5, 6]
            roll = validRoll[Math.floor(Math.random() * validRoll.length)]
        }
        if (currentPosition === 99 && roll === 2) {
            validRoll = [1, 3, 4, 5, 6]
            roll = validRoll[Math.floor(Math.random() * validRoll.length)]
            roll = 3
        }
        // send roll to server

        //dice.rollAll([roll])
        socket.emit('game:set', {
            event: 'GAME_DICE_ROLLED',
            payload: roll
        })


    }

    const emitEvent = ({roll}) => {
        socket.emit('game:set', {
            event: 'GAME_DICE_ROLLED',
            payload: roll
        })
    }

    const rollTo = async (where) => {

        dispatch(gameSetMoving())
        dispatch(gameIsAnimating(true))
        // send roll to server

        let roll = where
        let validRoll
        if (currentPosition === 97 && roll === 6) {
            validRoll = [1, 2, 3, 4, 5]
            roll = validRoll[Math.floor(Math.random() * validRoll.length)]
        }
        if (currentPosition === 98 && roll === 4) {
            validRoll = [1, 2, 3, 5, 6]
            roll = validRoll[Math.floor(Math.random() * validRoll.length)]
        }
        if (currentPosition === 99 && roll === 2) {
            validRoll = [1, 3, 4, 5, 6]
            roll = validRoll[Math.floor(Math.random() * validRoll.length)]
            roll = 3
        }

        console.log('clicking player at ' + currentPosition)
        animDiceControls.start({
            rotate: [0, 360,0, 360,0, 360,0, 360,0, 360,0, 360],
        }).then(() => {
            socket.emit('game:set', {
                event: 'GAME_DICE_ROLLED',
                payload: roll
            })
        })

    }

    // const rollDoneCallback = (num) => {
    //     console.log('roll done callback', num)
    //     //dispatch(gameSetMoving())
    // }

    const sup = ['st', 'nd', 'rd', 'th']

    return(
        <div className="flex flex-col gap-4 ml-4 w-64 p-8">
            <div className="flex-1 font-jakarta">
                <p className="font-bold">Standings</p>
                <div className="flex flex-col items-center gap-y-4 mt-8">    
                {
                    ranked.map((player, i) => {
                        return(
                            <div key={i} className={`flex w-full items-center`}>

                                <div className="w-8">
                                    {i+1}<sup>{sup[i]}</sup>
                                </div>

                                <div className={`${i === 0 && 'scale-125'} px-4`}>
                                    <Piece slot={player.slot} key={player._id}/>
                                </div>

                                <div className="text-xl">
                                    { player._id === myId &&
                                        <div className="font-bold text-green-800">
                                            Me
                                        </div>
                                    }
                                    {
                                        player._id !== myId &&
                                        <div className="text-slate-500">
                                            {player.name}
                                        </div>
                                    }
                                </div>

                                {/* <div className="text-sm font-bold">{player.name}</div>
                                <div className="text-sm">{player.position}</div> */}
                            </div>
                        )
                    })
                }
                </div>
            </div>

            <div className="flex items-center">
                <div className="flex-1 font-jakarta text-2xl">
                    { myTurn ? 
                        <div className="font-bold text-green-700 text-center">
                            Your turn!
                        </div>
                    : 
                        <div className="text-slate-500 text-center">
                           {players[turn].name}'s turn
                        </div>
                        }
                </div>
            </div>
            
            <div className="flex m-auto pointer-events-none">
                
                <ReactDice
                    numDice={1}
                    ref={ref}
                    faceColor={'#f9f9f9'}
                    outline={true}
                    dotColor={'#000'}
                />

            </div>

            {/* <div className="flex">Disabled ? {String(disableRoll)}</div> */}

            <div 
                disabled={disableRoll}
                className={`${disableRoll ? 'cursor-not-allowed' : 'cursor-pointer'} disabled:scale-0 relative flex w-24 h-24 bg-slate-100 border-4 border-black rounded-3xl items-center justify-center m-auto font-kalam font-black text-2xl`}
                onClick={() => {
                    if (disableRoll) return
                    //rollTo(100)
                    roll()
                    
                }}
                >
                Roll!
                {   disableRoll &&
                    <div className="absolute flex -translate-x-1/2 left-1/2 text-8xl text-red-600">
                        <p><MdOutlineDoNotDisturbAlt /></p>
                    </div>
                }
            </div>            
        </div>
    )
})

export default Side