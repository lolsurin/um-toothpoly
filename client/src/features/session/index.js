import { Routes, Route, useLocation } from "react-router-dom"
import { AnimatePresence } from "framer-motion"

import NewOrJoin from "./components/NewOrJoin"
import Join from "./components/Join"
import Onboard from "./components/Onboard"
import Wait from "./components/Wait"

const Lobby = () => {

    const location = useLocation()
    return (
        <>
            <AnimatePresence exitBeforeEnter>
                <Routes location={location} key={location.pathname}>
                    <Route index element={<NewOrJoin />} />
                    <Route path='join' element={<Join />} />
                    <Route path=':code' element={<Onboard />}/>
                    <Route path=':code/wait' element={<Wait />} />
                </Routes>
            </AnimatePresence>
        </>
    )
}

export default Lobby