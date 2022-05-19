import { useEffect, useState, useContext } from 'react'
import rules from '../assets/rules.json'
import { SocketContext } from '../context/socket'

const ANIM_MS = 500

const Piece = (props) => {
    const socket = useContext(SocketContext)
    const [curPos, setCurPos] = useState(props.tile)
      
    useEffect(() => {
        console.log('piece: rendering')
        console.log(`moving ${props.player} to ${props.tile}, direct? ${props.direct}`)

        if(!props.direct) {
            moveSteps(()=> {    

                let position = props.tile

                if (props.tile > 100) {
                    position = 200 - props.tile
                    console.log(`correcting to ${position}`)
                    //setCurPos(position)
                    if (props.id === socket.id) {
                        socket.emit(`game:update_player_position`, { position })
                    }
                }

                console.log(`arrived at tile ${position}`)

                if (props.tile === 100) {
                    console.log(`${props.id} is the winner!`)
                    if (props.id === socket.id) socket.emit('game:winner', { id: props.id })
                }                

                let rule = rules.find(r => r.tile === position)

                if (rule) {                        
                    console.log(`event is ${rule.event}`)  
                    socket.emit(`game:${rule.event}`, { rule })                    
                } else {
                    if (props.id === socket.id) socket.emit(`game:change_turn`)
                }
            })
        } else {
            console.log('moving directly')
            setCurPos(props.tile)
        }  
        
    }, [props.tile])

    var curr = curPos
    function moveSteps(cb) {
        let step = () => {

            if (curr === 100) {
                console.log('invalid')
                cb()
                return
            }

            if (curr < props.tile) {
                curr++
                setCurPos(curr)
                console.log(`moving ${props.player} to ${curr}`)
                moveSteps(cb)
            } else {
                cb()
                return
            }
            
        }

        setTimeout(step, ANIM_MS)
    }

    function moveTo(tile) {
        tile-=1
    
        let ones = tile % 10
        let tens = Math.floor(tile / 10)
            
        let x_rel = tens % 2 === 0 ? ones + 0.5 : 10 - (ones+0.5)
        let y_rel = tens + 0.5

        //if (y_rel > 10) y_rel = 9.5
        
        return {
            left: x_rel*10+"%", 
            bottom: y_rel*10+"%", 
            transition: "all 0.5s ease-in-out"
        } // to handle multiple pieces

    }   

    return (
        <div className={`
            absolute
            translate-x-[-50%] 
            translate-y-[50%]
            bg-black
            piece
            player-${props.player}
            rounded-full`}
            style={moveTo(curPos)}>
        </div>
    )

}

export default Piece