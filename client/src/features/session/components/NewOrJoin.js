import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useMediaQuery } from 'react-responsive'; // Import react-responsive
import { SocketContext } from '../../../context/socket';
import Transition from '../../Transition';
import {
  sessionSetState,
  sessionGetState,
  sessionReset,
  sessionId,
} from '../sessionSlice';
import { gameReset } from '../../game/gameSlice';

import HowToPlay from '../../HowToPlay';

/**
 * @description Lobby component
 * @allowed Anywhere
 * @action Kill existing room association
 * @returns {JSX.Element}
 */

function NewOrJoin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const prevState = useSelector(sessionGetState);
  const socket = useContext(SocketContext);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  // Detect if the screen size is mobile
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  /**
   * Emits a request to create a new room
   * @param {event} e
   */
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
    dispatch(sessionId(socket.id));
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
      <div
        className={`flex flex-col items-center justify-center ${
          isMobile ? 'gap-4' : 'gap-6'
        } h-full`}
      >
        <motion.div whileHover={animation.hover} whileTap={animation.tap}>
          <button
            type="submit"
            onClick={(e) => handleNewGame(e)}
            className={`${
              isMobile ? 'h-20 w-80 text-xl' : 'h-24 w-96 text-2xl'
            } px-4 py-2 font-bold text-white uppercase bg-indigo-600 rounded-lg hover:bg-indigo-700`}
          >
            🦷 Start New Game
          </button>
        </motion.div>

        <motion.div whileHover={animation.hover} whileTap={animation.tap}>
          <button
            type="submit"
            onClick={() => navigate('/join')}
            className={`${
              isMobile ? 'h-20 w-80 text-xl' : 'h-24 w-96 text-2xl'
            } px-4 py-2 font-bold text-white uppercase bg-slate-600 rounded-lg hover:bg-slate-700`}
          >
            Join Game From Code
          </button>
        </motion.div>

        <div
          className={`text-center text-slate-500 hover:scale-110 cursor-pointer ${
            isMobile ? 'text-sm' : 'text-base'
          }`}
          onClick={() => {
            setShowHowToPlay(true);
            console.log(showHowToPlay);
          }}
        >
          How To Play
        </div>

        <HowToPlay
          visible={showHowToPlay}
          doneText={'Close'}
          closeHandler={howToPlayToggle}
        />
      </div>
    </Transition>
  );
}

export default NewOrJoin;
