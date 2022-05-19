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
        <div className="absolute z-50 flex flex-col w-5/6 h-4/6 bg-slate-900 rounded-none border-8 border-white -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 p-8">
            <div className="p-4">
                <h1 className="text-white text-center text-4xl font-kalam">How to play</h1>
            </div>
            <div className="flex flex-1 gap-2">
                <div className="bg-slate-500 flex-1"></div>
                <div className="bg-slate-500 flex-1"></div>
                <div className="bg-slate-500 flex-1"></div>
            </div>
            <div className="bg-slate-700 w-fit m-auto px-8 py-6 mt-6 rounded-xl text-2xl font-bold text-white font-kalam cursor-pointer hover:scale-110" onClick={handleCompletedTutorial}>
                Lets go!
            </div>
        </div>
    )
}

export default Tutorial