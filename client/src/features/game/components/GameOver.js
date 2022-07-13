import { motion } from "framer-motion"
import { useSelector } from "react-redux"
import { useContext } from "react"
import { SocketContext } from "../../../context/socket"

import { Link } from "react-router-dom"

import Piece from "./Piece"

const GameOver = ({animate}) => {

    const socket = useContext(SocketContext)
    const players = useSelector(state => state.game.players)
    const podium = useSelector(state => state.game.podium)

    const sup = ['st', 'nd', 'rd', 'th']

    return (
        <>          
            <motion.div initial={{top: '-50%', display: 'none'}} animate={animate} className={`absolute z-50 flex-col w-3/4 py-8 md:px-10 -translate-x-1/2 -translate-y-1/2 border-8 shadow-2xl h-4/6 bg-slate-900 left-1/2`}>
                <div className="flex mb-2 m-auto text-white font-jakarta text-3xl md:text-5xl">
                🎉 Game Over! 🎉
                </div>

                <div className="flex-1 flex flex-col text-white divide-y">

                    {   podium.map((place, idx) => (
                            <div className="flex p-4 items-center gap-5 font-jakarta text-lg font-bold" key={players[place]._id}>
                                <div className="w-7">{idx+1}<sup>{sup[idx]}</sup></div>
                                <Piece slot={players[place].slot}/>
                                <div>{players[place].name}</div>
                            </div>
                        ))
                
                    }

                </div>

                <Link to='/'>
                    <div 
                        className="justify-center text-white font-bold gap-2 p-3 w-1/2 text-center m-auto bg-green-700 rounded-xl text-lg font-jakarta "
                        onClick={() => {
                            socket.emit('session:set', {
                                event: 'GAME_LEAVE'
                            })
                        }}
                        >
                        Back to Home
                    </div>
                </Link>
            </motion.div>            
        </>
    )
}

export default GameOver