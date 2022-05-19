import { motion } from 'framer-motion'

const animation = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
}

const Transition = ({ children }) => {
    return (
        <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={animation}
            transition={{ duration: .25 }}
            className="w-full"
        >
            {children}
        </motion.div>
    )
}

export default Transition