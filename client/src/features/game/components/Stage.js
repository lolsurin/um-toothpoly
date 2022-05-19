import { useState } from "react"
import { useSelector } from "react-redux"
import Piece from "./Piece"
import { motion } from "framer-motion"
import { FaChevronCircleDown } from "react-icons/fa"
import { socket } from "../../../context/socket"
import { useDispatch } from "react-redux"
import { gameIsAnimating, gameToggleClearMotion, gameResetPlayerMotion } from "../gameSlice"

const Board = () => {

    const dispatch = useDispatch()
    const players = useSelector((state) => state.game.players)

    const myIdx = useSelector((state) => state.game.players.find((player) => player._id === state.session.id).number)
    // const me = useSelector((state) => state.game.players?.find((player) => player._id === socket.id))
    // const turn = useSelector(state => state.game.turn)
    // const myTurn = turn === me.number      

    const myTurn = useSelector((state) => state.game.players[state.game.turn]._id === state.session.id)
    const whosTurn = useSelector((state) => state.game.players[state.game.turn])
    const moving = useSelector((state) => state.game.moving)
    const isSupposedToClearMotion = useSelector((state) => state.game.isSupposedToClearMotion)

    const gameDisabled = useSelector((state) => state.game.disable)

    return(
        <div className="relative flex-1 p-5 board">
                
            <div className="relative w-full h-full">
                {/* 
                    There was a bug here wherein the piece would move automatically.
                    CAUSE: when player presses correct, turn is already changed while player is moving to rewarded position. 
                    onAnimationCOmpleted is triggered
                    SOLUTION: added gameIsAnimating state as a condition to prevent this.
                */}
                {
                    players.map((player, i) =>
                            <motion.div className={`
                                absolute
                                -translate-x-1/2
                                translate-y-1/2
                                
                            `}
                                key={`player-${i}`}
                                animate={player.motion}
                                // transition={{ delay: .75, duration: player.motion.left.length * 0.20 }}
                                initial={false}
                                onAnimationComplete={() => {
                                    console.log(`player ${i} is done moving`)
                                    dispatch(gameIsAnimating(false))
                                    if(myTurn && gameDisabled) socket.emit('game:set', { event: 'GAME_MOVE_COMPLETED' })
                                    
                                    // if (isSupposedToClearMotion) {
                                    //     console.log('clearing motion')
                                    //     dispatch(gameResetPlayerMotion())
                                    //     dispatch(gameToggleClearMotion())
                                    // } else {
                                    //     console.log('motion cleared')
                                    // }
                                

                                }}
                                onAnimationStart={() => {
                                    dispatch(gameIsAnimating(true))
                                }}
                            >
                                <div className="relative">
                                    {/* <div className="absolute -translate-x-1/2 translate-y-1/2 -top-[192%] text-6xl text-white left-1/2">
                                        <FontAwesomeIcon icon={faSortDown} />
                                    </div> */}
                                    {/* { whosTurn._id === player._id &&
                                        <motion.div 
                                            className={`absolute -top-[200%] left-[0.3rem] text-3xl flex justify-center flex-col items-center`}
                                            animate={{
                                                translateY: [0,10,0],
                                                translateX: [0,0,0],
                                            }}
                                            transition={{ ease: "easeInOut", duration: 2, repeat: Infinity }}
                                            >
                                            <div className="bg-white rounded-full p-1 text-green-900 w-fit">
                                                <FaChevronCircleDown />
                                            </div>
                                        </motion.div>
                                    } */}

                                        {/* <div className={`absolute -top-[70%] left-[0.3rem] px-2 rounded-full mb-1 ${ i === myIdx ? 'bg-white' : 'bg-slate-500 text-white' }`}>
                                            <p className="font-jakarta text-base font-black">{i === myIdx ? 'Me' : player.name}</p>
                                        </div> */}

                                    {/* <div className={`shift-${player.slot}`}> */}
                                        <Piece key={i} slot={player.slot} showInGameElements={true} shift={true} />
                                    {/* </div> */}
                                </div>
                            </motion.div>
                    )
                }
            </div>
        </div>
    )
}

export default Board