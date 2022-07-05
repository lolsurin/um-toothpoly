import { useSelector } from "react-redux"
import Piece from "./Piece"
import { motion } from "framer-motion"
import { socket } from "../../../context/socket"
import { useDispatch } from "react-redux"
import { gameIsAnimating } from "../gameSlice"

const Board = () => {

    const dispatch = useDispatch()
    const players = useSelector((state) => state.game.players)   

    const myTurn = useSelector((state) => state.game.players[state.game.turn]._id === state.session.id)

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
                                    
                                    dispatch(gameIsAnimating(false))
                                    if(myTurn && gameDisabled) socket.emit('game:set', { event: 'GAME_MOVE_COMPLETED' })
                                    
                                    // if (isSupposedToClearMotion) {
                                    //     
                                    //     dispatch(gameResetPlayerMotion())
                                    //     dispatch(gameToggleClearMotion())
                                    // } else {
                                    //     
                                    // }
                                

                                }}
                                onAnimationStart={() => {
                                    dispatch(gameIsAnimating(true))
                                }}
                            >
                                <div className="relative scale-50 md:scale-100">
                                    <Piece key={i} slot={player.slot} showInGameElements={true} shift={true} />
                                </div>
                            </motion.div>
                    )
                }
            </div>
        </div>
    )
}

export default Board