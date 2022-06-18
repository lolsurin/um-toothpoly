import { useDispatch } from "react-redux"
import { SocketContext } from "../../../context/socket"
import { useEffect, useContext } from "react"
import { setReady } from "../gameSlice"

const Tutorial = ({children}) => {

    const dispatch = useDispatch()
    const socket = useContext(SocketContext)

    useEffect(() => {
    }, [])

    const handleCompletedTutorial = () => {
        socket.emit("game:set", {
            event: 'GAME_PLAYER_READY'
        })
    }

    return (
        <div className="absolute z-50 flex flex-col w-5/6 bg-slate-900 rounded-none border-8 border-white -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 p-8 gap-4">
            <div className="p-4">
                <h1 className="text-white text-center text-4xl font-jakarta">How to play</h1>
            </div>
            <div className="flex flex-1 gap-2 justify-evenly">
                <div className="flex flex-col gap-8 w-1/3">
                    <img src="/tut1-pic.png" className="bg-slate-500 aspect-square outline-dashed outline-offset-4 outline-white rounded-lg" />
                    <div className="font-jakarta text-white text-center text-xl">Click on Roll! to move your piece</div>
                </div>
                <div className="flex flex-col gap-8 w-1/3">
                    <img src="/tut2-pic.png" className="bg-slate-500 aspect-square outline-dashed outline-offset-4 outline-white rounded-lg" />
                    <div className="font-jakarta text-white text-center text-xl">Answer the question before the time runs out!</div>
                </div>
            </div>
            <div className="bg-green-700 w-fit m-auto px-12 py-4 mt-6 rounded-xl text-2xl font-bold text-white font-jakarta cursor-pointer hover:scale-110" onClick={handleCompletedTutorial}>
                Lets play!
            </div>
        </div>
    )
}

export default Tutorial