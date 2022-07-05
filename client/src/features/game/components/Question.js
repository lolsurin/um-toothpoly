import { useSelector } from "react-redux"
import { SocketContext } from "../../../context/socket"
import { useEffect, useContext } from "react"
import { motion } from "framer-motion"

import { CountdownCircleTimer } from "react-countdown-circle-timer"

const renderTime = ({remainingTime}) => (
    <div className="text-white font-medium text-xl">
        {
            remainingTime === 0 ? '' : remainingTime
        }
    </div>
)

const Question = ({question, animate}) => {

    // question = {
    //     "image_path": null,
    //     "en": {
    //         "question": "Toothpaste should be placed in large quantities on the entire surface of the toothbrush to ensure its effectiveness.",
    //         "answers": [
    //             { "value": "True", "correct": false },
    //             { "value": "False", "correct": true }
    //         ]        
    //     },
    //     "my": {
    //         "question": "Ubat gigi perlu diletakkan dengan banyak di keseluruhan permukaan berus gigi untuk memastikan keberkesanannya.",
    //         "answers": [
    //             { "value": "Betul", "correct": false },
    //             { "value": "Salah", "correct": true }
    //         ]
            
    //     }
    // }

    const timerId = useSelector((state) => state.game.timerId)
    const inQuestion = useSelector((state) => state.game.inQuestion)
    const myTurn = useSelector((state) => state.game.players[state.game.turn]._id === state.session.id)
    const whosTurn = useSelector((state) => state.game.players[state.game.turn])
    const socket = useContext(SocketContext)

    useEffect(() => {
        
    }, [])


    const lang = 'en'

    return (
        <>          
            <motion.div initial={{top: '-50%', display: 'none'}} animate={animate} className={`${myTurn ? 'border-green-500' : `border-red-500`} absolute z-50 flex-col w-4/6 p-4 -translate-x-1/2 -translate-y-1/2 border-8 shadow-2xl bg-slate-900 left-1/2 gap-6`}>
                

                <div className="flex flex-col md:flex-row mb-2 items-center gap-2">

                    <CountdownCircleTimer
                        key={inQuestion}
                        size={60}
                        strokeWidth={7}
                        trailColor="rgba(255, 255, 255, 0)"
                        isPlaying={inQuestion}
                        duration={21}
                        colors={["#004777", "#F7B801", "#A30000", "#A30000"]}
                        colorsTime={[10, 6, 3, 0]}
                    >
                        {renderTime}
                    </CountdownCircleTimer>
                    <div className="flex-1 text-xl font-black text-center text-white font-jakarta shadow-white uppercase">Question for { myTurn ? 'you' : whosTurn.name}</div>
                </div>

                <div className="flex flex-col items-center justify-center flex-1 gap-2 p-3 ">

                    <div className="text-2xl font-semibold tracking-wide text-center text-white font-jakarta">
                        { question[lang]?.question }
                    </div>
                </div>

                {
                    myTurn && 
                    <div className="flex flex-row flex-wrap items-center justify-center flex-1 gap-4">
                        {
                            question[lang]?.answers?.map((a, i) => <button 

                                key={a.value}
                                className="px-8 py-4 text-2xl md:w-1/4 font-bold bg-white rounded-full font-jakarta hover:scale-110"
                                onClick={() => {
                                    // 
                                    socket.emit('game:set', {
                                        event: 'GAME_QUESTION_ANSWERED',
                                        payload: a.correct
                                    })
                                    clearTimeout(timerId)
                                }}
                                >
                                    { a.value } 
                                </button>)
                        }
                    </div>
                }
                {
                    !myTurn &&
                        <div className="flex flex-row flex-wrap items-center justify-center flex-1 gap-5">
                            <svg role="status" className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-white" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                            </svg>
                            <p className="text-slate-400 font-jakarta text-2xl">waiting for {whosTurn.name} to answer...</p>
                        </div>
                }

                
            </motion.div>            
        </>
        
    )
}

export default Question