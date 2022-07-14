import { faCat, faCrow, faSpider, faFish  } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { FaChevronCircleDown } from "react-icons/fa"

const Piece = ({slot, showInGameElements = false, shift = false}) => {

    const myId = useSelector(state => state.session.id)
    const players = useSelector(state => state.game.players)

    let player = players?.find(player => player.slot === slot)
    let isMe = player?._id === myId
    let isTurn = player?.number === useSelector(state => state.game.turn)

    let icons = [faCat, faCrow, faSpider, faFish]

    return (
            <div className={`flex flex-col relative ${ showInGameElements && `shift-${slot} ${!player.active && 'grayscale'}`}}`}>
                {
                    showInGameElements &&
                    <>
                        {
                            isTurn && 
                            <motion.div 
                                className={`absolute -top-[150%] left-[0.3rem] text-3xl flex justify-center flex-col items-center`}
                                animate={{
                                    translateY: [0,8,0],
                                    translateX: [0,0,0],
                                }}
                                transition={{ ease: "easeInOut", duration: 2, repeat: Infinity }}
                                >
                                <div className="bg-white rounded-full p-1 text-green-900 w-fit">
                                    <FaChevronCircleDown />
                                </div>
                            </motion.div>
                        }
                        <div className={`absolute -top-[50%] text-center px-2 rounded-full w-full ${ isMe ? 'bg-green-900 text-white font-bold' : 'bg-slate-600 text-white' }`}>
                            <p className="font-jakarta text-base">{ isMe ? 'Me' : player.name}</p>
                        </div>
                    </>
                }
                <div className={`w-12 h-12 z-0 rounded-full border-4 player-${slot} text-2xl flex justify-center items-center`}>
                    <FontAwesomeIcon className='m-auto' icon={icons[slot]} />
                    <div className='absolute w-12 h-12 rounded-full'></div>
                </div>
            </div>
    )
}

export default Piece