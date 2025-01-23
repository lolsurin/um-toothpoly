import React from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'

import Layout from './features/Layout'

import Lobby from './features/session'

import { SocketContext, socket } from './context/socket'
import { AnimatePresence } from 'framer-motion'
import ErrorBoundary from './app/ErrorBoundary'

const Game = React.lazy(() => import('./features/game'))

const App = () => {
    React.useEffect(() => {
        return () => {
            socket.disconnect(); // Disconnect the socket when the app unmounts
        };
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            <BrowserRouter>
                <AnimatedRoutes />
            </BrowserRouter>
        </SocketContext.Provider>
    );
};

const LoadingFallback = () => (
    <div className="loading-spinner">
        <p>Loading, please wait...</p>
    </div>
);

const AnimatedRoutes = () => {
	const location = useLocation()

	return (
		<AnimatePresence exitBeforeEnter>
			<Routes location={location} key={location.pathname}>
				<Route element={<Layout />}>
					<Route path='/*' element={<Lobby />} />					
					<Route path='/game/:code' element={
						<React.Suspense fallback={<LoadingFallback />}>
							<ErrorBoundary>
								<Game />
							</ErrorBoundary>
						</React.Suspense>
					} />
					{/* 404 Route */}
                    <Route path="*" element={<div>404: Page Not Found</div>} />
				</Route>
			</Routes>
		</AnimatePresence>
	)	
}

export default App
