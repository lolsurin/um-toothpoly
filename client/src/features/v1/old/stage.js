import { useEffect, useState, useContext } from 'react'

import tile from '../assets/grid-test-2000x2000.png'
import Question from './question'
import Piece from './piece'

const Stage = (props) => {
    const socket = useContext(SocketContext)
    const [piece, setPiece] = useState(props.game.players.map(p => p.position)) // on init
   
    useEffect(() => {
    } , [props.game])

    let currPiece = piece
    function moveInSteps(callback) {
        let step = () => {
            currPiece = currPiece.map((p, i) => {                    
                if (i === props.game.turn) {
                    console.log(`moving ${p} to ${props.game.players[i].position}`)
                    return p + 1
                } else {
                    return p
                }
            })
            if (currPiece[props.game.turn] < props.game.players[props.game.turn].position) {
                moveInSteps(callback)
            } else {
                callback()
            }
        }
        setPiece(currPiece)
        setTimeout(step, 500)
    }

    function moveTo(tile) {
        //tile-=1    
        let ones = tile % 10
        let tens = Math.floor(tile / 10)
            
        let x_rel = tens % 2 === 0 ? ones + 0.5 : 10 - (ones+0.5)
        let y_rel = tens + 0.5
        
        return {
            left: x_rel*10+"%", 
            bottom: y_rel*10+"%", 
            transition: "all 0.5s ease-in-out"
        } // to handle multiple pieces

    }  

    return (
        <div className="h-[60vh] w-fit m-auto relative">
            { props.game.question ? < Question game={props.game} /> : null }
            <img src={tile} alt="tile" className="h-full" />
            { props.game.players.map((p, i) => <Piece player={i} direct={p.goDirectly} tile={p.position} id={p.id} key={p.id}/>) }
            <p className="absolute top-1 left-1 whitespace-pre-line">{props.game.players.map((p, i) => `Player ${i}: tile ${p.position} \n`)}</p>
            
        </div>
    )
}

export default Stage