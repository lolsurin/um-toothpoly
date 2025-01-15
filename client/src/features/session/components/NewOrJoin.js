import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { SocketContext } from '../../../context/socket'
import Transition from '../../Transition'
import { sessionSetState, sessionGetState, sessionReset, sessionId } from '../sessionSlice'
import { gameReset } from '../../game/gameSlice' 

import HowToPlay from '../../HowToPlay'

/**
 * @description Lobby component
 * @allowed Anywhere
 * @action Kill existing room association
 * @author Aqlan Nor Azman
 * @returns {JSX.Element}
 */

function NewOrJoin() {
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const prevState = useSelector(sessionGetState);
	const socket = useContext(SocketContext);
	const [showHowToPlay, setShowHowToPlay] = useState(false);
	const [buttonStyle, setButtonStyle] = useState({
		height: '6rem',
		fontSize: '1.5rem',
		width: '24rem',
	});

	// Responsive button style
	useEffect(() => {
		const updateButtonStyle = () => {
			if (window.innerWidth < 640) {
				setButtonStyle({ height: '4rem', fontSize: '1rem', width: '18rem' });
			} else if (window.innerWidth < 1024) {
				setButtonStyle({ height: '5rem', fontSize: '1.25rem', width: '20rem' });
			} else {
				setButtonStyle({ height: '6rem', fontSize: '1.5rem', width: '24rem' });
			}
		};

		window.addEventListener('resize', updateButtonStyle);
		updateButtonStyle(); // Initial call
		return () => window.removeEventListener('resize', updateButtonStyle);
	}, []);

	const handleNewGame = (e) => {
		socket.emit('session:new', (callback) => {
			navigate(`${callback.code}`); // go to room onboarding
		});
		e.preventDefault();
	};

	useEffect(() => {
		if (!prevState.inLobby) {
			socket.emit('validate:forceClientCleanState');
		}
		dispatch(sessionReset());
		dispatch(gameReset());
		dispatch(sessionId(socket.id)); // reassign?
		dispatch(sessionSetState('lobby'));
	}, []);

	const animation = {
		hover: {
			scale: 1.05,
			transition: { duration: 0.2 },
		},
		tap: { scale: 0.95 },
	};

	const howToPlayToggle = () => {
		setShowHowToPlay(false);
	};

	return (
		<Transition>
			<div className="flex flex-col items-center justify-center h-full gap-6">
				<motion.div
					whileHover={animation.hover}
					whileTap={animation.tap}
				>
					<button
						type="submit"
						onClick={(e) => handleNewGame(e)}
						style={buttonStyle}
						className="font-bold text-white uppercase bg-indigo-600 rounded-lg hover:bg-indigo-700"
					>
						🦷 Start New Game
					</button>
				</motion.div>

				<motion.div
					whileHover={animation.hover}
					whileTap={animation.tap}
				>
					<button
						type="submit"
						onClick={(e) => navigate('/join')}
						style={buttonStyle}
						className="font-bold text-white uppercase rounded-lg bg-slate-600 hover:bg-slate-700"
					>
						Join Game From Code
					</button>
				</motion.div>

				<div
					className="text-center text-slate-500 hover:scale-110 cursor-pointer"
					onClick={() => {
						setShowHowToPlay(true);
					}}
				>
					How To Play
				</div>

				<HowToPlay visible={showHowToPlay} doneText={'Close'} closeHandler={howToPlayToggle} />
			</div>
		</Transition>
	);
}

export default NewOrJoin;
