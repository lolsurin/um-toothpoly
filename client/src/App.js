import React from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'

import Layout from './features/Layout'

import Lobby from './features/session'

import { SocketContext, socket } from './context/socket'
import { AnimatePresence } from 'framer-motion'
import ErrorBoundary from './app/ErrorBoundary'

const Game = React.lazy(() => import('./features/game'))

const App = () => (
	<SocketContext.Provider value={socket}>
			<BrowserRouter>
				<AnimatedRoutes />
			</BrowserRouter>
	</SocketContext.Provider> 
)

const AnimatedRoutes = () => {
	const location = useLocation()

	return (
		<AnimatePresence exitBeforeEnter>
			<Routes location={location} key={location.pathname}>
				<Route element={<Layout />}>
					<Route path='/*' element={<Lobby />} />					
					<Route path='/game/:code' element={
						<React.Suspense fallback={<div>Loading...</div>}>
							<ErrorBoundary>
								<Game />
							</ErrorBoundary>
						</React.Suspense>
					} />
	
				</Route>
			</Routes>
		</AnimatePresence>
	)	
}

export default App
