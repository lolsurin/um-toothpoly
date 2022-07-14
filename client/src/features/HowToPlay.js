import React from 'react'
import { motion } from 'framer-motion'

function HowToPlay({visible, closeHandler, doneText}) {

    const variants = {
        open: { top: '50%'},
        closed: { top: '-100%'}
    }

  return (
    <motion.div 
        variants={variants}
        initial={'closed'}
        transition={{ type: "spring", stiffness: 100 }}
        animate={visible ? 'open' : 'closed'}
        className={`absolute z-50 flex-col flex w-5/6 bg-slate-900 rounded-none border-8 border-white -translate-x-1/2 -translate-y-1/2 left-1/2 p-8 gap-4`}
        >
        <div className="p-4">
            <h1 className="text-white text-center text-4xl font-jakarta">How to play</h1>
        </div>
        <div className="flex flex-1 gap-8 justify-evenly">
            <div className="flex flex-col gap-8 w-1/3">
                <img src="/tut1-pic.png" className="bg-slate-500 aspect-square outline-dashed outline-offset-4 outline-white rounded-lg" alt="Click on Roll! to move your piece" />
                <div className="font-jakarta text-white text-center text-xl">Click on Roll! to move your piece</div>
            </div>
            <div className="flex flex-col gap-8 w-1/3">
                <img src="/tut2-pic.png" className="bg-slate-500 aspect-square outline-dashed outline-offset-4 outline-white rounded-lg" alt="Answer the question before the time runs out!" />
                <div className="font-jakarta text-white text-center text-xl">Answer the question before the time runs out!</div>
            </div>
            <div className="flex flex-col gap-8 w-1/3">
                <img src="/tut3-pic.png" className="bg-slate-500 aspect-square outline-dashed outline-offset-4 outline-white rounded-lg" alt="Answer the question before the time runs out!" />
                <div className="font-jakarta text-white text-center text-xl">Answer correctly on Springboard and Toothbrush Turbo to climb up!</div>
            </div>
            <div className="flex flex-col gap-8 w-1/3">
                <img src="/tut4-pic.png" className="bg-slate-500 aspect-square outline-dashed outline-offset-4 outline-white rounded-lg" alt="Answer the question before the time runs out!" />
                <div className="font-jakarta text-white text-center text-xl">If you answer incorrectly on Lollipops you'll fall down!</div>
            </div>
        </div>
        <div className="bg-green-700 w-fit m-auto px-12 py-4 mt-6 rounded-xl text-2xl font-bold text-white font-jakarta cursor-pointer hover:scale-110" onClick={closeHandler}>
            { doneText }
        </div>
    </motion.div>
  )
}

export default HowToPlay