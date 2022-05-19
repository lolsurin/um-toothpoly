//import socket from "../services/socket"
import { SocketContext, socket } from "../../context/socket";
import Stage from "./stage"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useEffect, useState, useContext } from "react"

const Game = () => {
    const socket = useContext(SocketContext)
    const navigate = useNavigate()
    const { state } = useLocation()

    const [game, setGame] = useState(state.room)
    let myIndex = state.room.players.findIndex(player => player.id == socket.id)

    function move() {
        // let steps = Math.floor(Math.random() * 6) + 1
        //console.log(`moving...`)
        //console.log(game)
        socket.emit('game:move')
    }

    //TEST//
    function move220() {
        socket.emit('game:move', { to: 20 })
    }

    function move214() {
        socket.emit('game:move', { to: 14 })
    }

    function move298() {
        socket.emit('game:move', { to: 98 })
    }

    //END TEST//

    const onBack = () => {
        console.log(`leaving room...`)
        socket.emit('game:leave')
    }

    useEffect(() => {
        socket.on('game:move', data => {
            setGame(data.room)
        })

        // socket.on('game:question', data => {
        //     setGame(data.room)
        // })

        return () => {
            socket.off('game:move')
        }

    }, [game])

    return (
        <div className="grid max-h-screen h-screen max-w-screen-xl min-w-fit m-auto gap-4 p-8">
            {/* <div className="col-span-3">UM Toothpoly</div> */}
            <Link to="/" className="col-span-3" onClick={onBack}>UM Toothpoly</Link>
            <div className="col-span-2 max-h-[2fr] overflow-hidden self-center relative">
                <Stage game={game} />
                {/* <Quiz game={game} /> */}
            </div>
            <div className="card"><Leaderboard players={game.players} /></div>

            <div className="card">Dice</div>
            <div className="card">
                <button disabled={!(game.turn === game.players.findIndex(p => p.id === socket.id))} className={`bg-slate-400 disabled:bg-white`} onClick={move}>move</button><br />
                <button disabled={!(game.turn === game.players.findIndex(p => p.id === socket.id))} className={`bg-slate-400 disabled:bg-white`} onClick={move220}>move to 20</button><br />
                <button disabled={!(game.turn === game.players.findIndex(p => p.id === socket.id))} className={`bg-slate-400 disabled:bg-white`} onClick={move214}>move to 14</button><br />
                <button disabled={!(game.turn === game.players.findIndex(p => p.id === socket.id))} className={`bg-slate-400 disabled:bg-white`} onClick={move298}>move to 98</button><br />
            </div>
            <div className="card">----</div>
        </div>
    )
}

const Quiz = (props) => {

    function correct() {
        socket.emit('game:correct', { rule: props.game.inPlay})
    }

    function incorrect() {
        socket.emit('game:incorrect', { rule: props.game.inPlay})
    }
    
    useEffect(() => {} , [props.game])

    return (
        <div className={`${props.game.state === 'question' ? `visible`: `invisible`} absolute top-2/4 left-2/4 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-slate-500`}>
            Question:  
            <button onClick={correct}>Correct</button>
            <button onClick={incorrect}>Incorrect</button>
        </div>
    )
}

const Leaderboard = (props) => {    

    useEffect(() => {
        //let sorted = props.players.sort((a, b) => b.score - a.score)
    }, [props.players])

    return (
        <div>

            <p>Leaderboard</p>
            { props.players.sort((a, b) => b.score - a.score).map((player, i) => <p className={socket.id == player.id ? `font-semibold`: ``} key={i}>{player.name} - {player.score}</p>) }
        </div>
        
    )
}

export default Game