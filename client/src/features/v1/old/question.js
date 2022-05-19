import { useEffect, useContext, useState } from "react"
import { SocketContext } from "../context/socket"

const Quiz = (props) => {

    const [language, setLanguage] = useState("my")

    const socket = useContext(SocketContext)

    function correct() {
        socket.emit('game:correct', { rule: props.game.inPlay})
    }

    function incorrect() {
        socket.emit('game:incorrect', { rule: props.game.inPlay})
    }

    useEffect(() => {} , [props.game])

    return (
        <div className={`${props.game.state === 'question' ? `visible`: `invisible`} absolute top-2/4 left-2/4 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-slate-500`}>
            <p>Player {props.game.turn} is answering</p>
            <p>{ props.game.question[language].question }</p>
            { props.game.question[language].answers.map((a, i) =>
                    <button disabled={!(props.game.turn === props.game.players.findIndex(p => p.id === socket.id))} onClick={a.correct ? correct : incorrect} key={i}>{a.value}</button>
            )}
            
        </div>
    )
}

export default Quiz