import { motion } from "framer-motion"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDiceOne, faDiceTwo, faDiceThree, faDiceFour, faDiceFive, faDiceSix } from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState } from "react"

export const Dice = (props) => {

	const faces = [faDiceOne, faDiceTwo, faDiceThree, faDiceFour, faDiceFive, faDiceSix]
	const [face, setFace] = useState(faDiceOne)
	const [roll, setRoll] = useState(0)

	// select random face
	const randomFace = () => {
		let random = Math.floor(Math.random() * faces.length)
		return [random, faces[random]]
	}

	const variants = {
		visible: {opacity: 1},
		hidden: {opacity: 0}
	}

	useEffect(() => {
		// console.log(`landed on ${roll}`)
	}, [roll])

	return(
		<motion.div variants={variants} animate={props.enabled ? "visible" : "hidden"}>
		<div className="self-center">
            <motion.div
                style={{
                    width: 75,
                    height: 75,
                    borderRadius: 30,
                    cursor: "grab",
                }}
                drag
                dragConstraints={{
                    top: -10,
                    right: 10,
                    bottom: 10,
                    left: -10,
                }}
                dragTransition={{ bounceStiffness: 6000, bounceDamping: 15 }}
                dragElastic={0.5}
                whileTap={{ cursor: "grabbing" }}
				onUpdate={(event) => {
					//console.log(`${event.x} ${event.y}`)
				}}

				onDragEnd={async (event) => {
					
					let [random, face] = randomFace()
					setFace(face)
					setRoll(random)
					props.landedOn(random+1)
				}}
            >
				<FontAwesomeIcon icon={face} className="w-fit h-fit text-indigo-700"/>
			</motion.div>
			
        </div>
		</motion.div>
	)
}

export default Dice