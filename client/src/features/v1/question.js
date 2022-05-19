import { useEffect, useContext, useState } from "react"
import { SocketContext } from '../context/socket'
import { animationControls, motion, useAnimation } from "framer-motion"

const Question = (props) => {

    const [answered, setAnswered] = useState(false)
    const [moving, setMoving] = useState(true)
    const [scene, setScene] = useState('event')
    const buttonControls = useAnimation()

    useState(() => {
        console.log(props.question)
    }, [])

    return (
        <motion.div 
            animate={props.questionAnimControls}
            variants={props.animVariants}
            className={`${scene !== 'event' ? `invisible`: ``} ${moving ? `bg-white` : `bg-slate-800 text-white`} card shadow-lg p-6`}>
            {/* top-2/4 left-2/4 -translate-x-1/2 -translate-y-1/4 md:-translate-y-1/2 w-11/12 absolute flex flex-col place-content-center gap-3 p-3*/}
            <div className={`flex flex-col justify-center uppercase p-2 font-marker text-center text-lg`}>Question for Player</div>
            <div className="flex-1 flex flex-col justify-center gap-2 items-center p-3 ">

                {/* <img className="h-44 rounded shadow-lg mb-4" src="/question-assets/dental-jaw-blue-overlay-1200x628-iStock-1145063557.jpg" alt="Dental Jaw"/> */}

                <div className="text-center text-xl font-semibold">
                    { props.question.question }
                </div>
            </div>
            <motion.div className="flex-1 flex flex-row flex-wrap justify-center items-center gap-3 p-3" animate={buttonControls}>
                {
                    props.question.answers.map((a, i) => <button 
                        key={i} 
                        disabled={!moving} 
                        className={`flex justify-center p-4 font-medium rounded w-48 
                            ${moving ? `bg-gray-200 hover:bg-gray-300`:`bg-slate-900 `}
                            ${answered ? a.correct ? `bg-green-400` : `bg-red-400` : ``}`}
                        onClick={async () => {
                            setAnswered(true)
                            //await buttonControls.start({ scale: [1, 1.1, 1], transition: { duration: 0.7} })
                            //submitAnswerAction(a.correct)
                            setAnswered(false)
                        }}>
                            { a.value } 
                        </button>)
                }
            </motion.div>
            
        </motion.div>
    )
}

const QuestionStage = ({event, myTurn, question}) => {

    const calloutControls = useAnimation()
    const questionAnimControls = useAnimation()

    useEffect(async () => {
        if (!event || event === 'none') return
        console.log(`rerendering ${event}`)

        callout().then(console.log('callout ended'))
        
        console.log(`rendered`)
    }, [event, myTurn])

    const calloutVariants = {
        initial: {opacity: 1, height: 0},
        expanded: {height: 700, transition: {duration: 0.25}},
        hide: {opacity: 0, transition: {delay: 0.5, duration: 0.5}},
        end: {height: 0}
    }

    const questionVariants = {
        initial: {opacity: 1},
        hide: {opacity: 0, transition: {delay: 0.5, duration: 0.5}},
    }

    const callout = async() => {
        await calloutControls.start('initial')
        await calloutControls.start('expanded')
        await calloutControls.start('hide')
        return await calloutControls.start('end')
    }
    
    return(
        <div className="absolute flex flex-col place-content-center left-1/2 -translate-x-1/2 bottom-1/2 translate-y-1/2">
            <motion.div className="font-brandy text-center text-slate-800 h-0" 
                animate={calloutControls} 
                variants={calloutVariants} 
                initial={{opacity: 0}}>
                <img className="rounded mb-4 drop-shadow-2xl h-full w-auto" src={`/assets/${event}_card.png`} alt="Dental Jaw"/>
            </motion.div>

            {/* <Question question={question} animControls={questionAnimControls} animVariants={questionVariants} lang={'en'}/> */}
        </div>
    )
}

const MainStage = () => {

    let events = ['chance', 'challenge', 'none']
    const [myTurn, setMyTurn] = useState(true)
    const questionAnim = useAnimation()
    const [event, setEvents] = useState()
    let lang = 'en'
    let question = {
            "image_path": null,
            "en": {
                "question": "Toothpaste should be placed in large quantities on the entire surface of the toothbrush to ensure its effectiveness.",
                "answers": [
                    { "value": "True", "correct": false },
                    { "value": "False", "correct": true }
                ]        
            },
            "my": {
                "question": "Ubat gigi perlu diletakkan dengan banyak di keseluruhan permukaan berus gigi untuk memastikan keberkesanannya.",
                "answers": [
                    { "value": "Betul", "correct": false },
                    { "value": "Salah", "correct": true }
                ]
                
            }
        }

    let trigger = (e) => {
        console.log(e)
        setEvents(e)
        setMyTurn(!myTurn)
    } 

    return (<div className="flex-1 flex flex-row flex-wrap justify-center items-center gap-3 p-3">
        {
            events.map((e) => <button 
            onClick={() => {
                trigger(e)
            }}
            className="flex justify-center p-4 font-medium rounded bg-slate-900 text-white">
                {e}
            </button>)
        }
        <QuestionStage event={event} myTurn={myTurn} question={question.en}/>
    </div>)
    
}

export default MainStage