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
        className={`absolute z-50 flex-col flex w-5/6 bg-slate-900 rounded-none border-8 border-white -translate-x-1/2 -translate-y-1/2 left-1/2 p-8 gap-4 h-fit max-h-[90vh] overflow-y-auto`}
        >
        <div className="p-4">
            <h1 className="text-white text-center text-4xl font-jakarta">How to play</h1>
        </div>
        <div className="flex flex-col md:flex-row gap-8 justify-evenly">
            <div className="flex flex-row md:flex-col gap-8 w-full">
                <img src="/tut1-pic.png" className="w-20 md:w-40 lg:w-60 bg-slate-500 aspect-square outline-dashed outline-offset-4 outline-white rounded-lg" alt="Click on Roll! to move your piece" />
                <div className="font-jakarta text-white text-left sm:text-center text-sm md:text-base lg:text-xl">Click on Roll! to move your piece</div>
            </div>
            <div className="flex flex-row md:flex-col gap-8 w-full">
                <img src="/tut2-pic.png" className="w-20 md:w-40 lg:w-60 bg-slate-500 aspect-square outline-dashed outline-offset-4 outline-white rounded-lg" alt="Answer the question before the time runs out!" />
                <div className="font-jakarta text-white text-left sm:text-center text-sm md:text-base lg:text-xl">Answer the question before the time runs out!</div>
            </div>
            <div className="flex flex-row md:flex-col gap-8 w-full">
                <img src="/tut3-pic.png" className="w-20 md:w-40 lg:w-60 bg-slate-500 aspect-square outline-dashed outline-offset-4 outline-white rounded-lg" alt="Answer the question before the time runs out!" />
                <div className="font-jakarta text-white text-left sm:text-center text-sm md:text-base lg:text-xl">Answer correctly on Springboard and Toothbrush Turbo to climb up!</div>
            </div>
            <div className="flex flex-row md:flex-col gap-8 w-full">
                <img src="/tut4-pic.png" className="w-20 md:w-40 lg:w-60 bg-slate-500 aspect-square outline-dashed outline-offset-4 outline-white rounded-lg" alt="Answer the question before the time runs out!" />
                <div className="font-jakarta text-white text-left sm:text-center text-sm md:text-base lg:text-xl">If you answer incorrectly on Lollipops you'll fall down!</div>
            </div>
        </div>
        <div className="bg-green-700 w-fit m-auto px-12 py-4 mt-6 rounded-xl text-base md:text-lg lg:text-2xl font-bold text-white font-jakarta cursor-pointer hover:scale-110" onClick={closeHandler}>
            { doneText }
        </div>
    </motion.div>
  )
}

export default HowToPlay