import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SocketContext } from '../../../context/socket';
import { sessionSetState } from '../sessionSlice';
import Transition from '../../Transition';
import { useDispatch } from 'react-redux';

function Onboard() {
    const dispatch = useDispatch();
    const socket = useContext(SocketContext);
    const params = useParams();
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [roomError, setRoomError] = useState("");
    const [roomOK, setRoomOK] = useState(true);
    const [inputStyle, setInputStyle] = useState({
        padding: '1.5rem',
        fontSize: '2rem',
        width: '18rem',
    });
    const [buttonStyle, setButtonStyle] = useState({
        padding: '1rem',
        fontSize: '1rem',
        width: '12rem',
    });

    const handleJoinLobby = (e) => {
        socket.emit('validate:room', { code: params.code }, (callback) => {
            if (callback.ok) {
                socket.emit('session:join', { code: params.code, name }, (callback) => {
                    if (callback.ok) {
                        navigate(`/${params.code}/wait`);
                    }
                });
            } else {
                setRoomError(callback.error);
                setRoomOK(false);
            }
        });

        e.preventDefault();
    };

    useEffect(() => {
        dispatch(sessionSetState('onboarding'));

        socket.emit('validate:room', { code: params.code }, (callback) => {
            if (!callback.ok) {
                navigate('/');
            }
        });

        socket.emit('validate:clientAlreadyInRoom', (callback) => {
            if (!callback.ok) {
                navigate('/');
            }
        });

        return () => {
            socket.off('validate:room');
            socket.off('validate:clientAlreadyInRoom');
        };
    }, [socket]);

    // Responsive styles
    useEffect(() => {
        const updateStyles = () => {
            if (window.innerWidth < 640) {
                setInputStyle({ padding: '1rem', fontSize: '1rem', width: '14rem' });
                setButtonStyle({ padding: '0.75rem', fontSize: '0.85rem', width: '10rem' });
            } else if (window.innerWidth < 1024) {
                setInputStyle({ padding: '1.25rem', fontSize: '1.5rem', width: '16rem' });
                setButtonStyle({ padding: '1rem', fontSize: '1rem', width: '12rem' });
            } else {
                setInputStyle({ padding: '1.5rem', fontSize: '2rem', width: '18rem' });
                setButtonStyle({ padding: '1.25rem', fontSize: '1.25rem', width: '14rem' });
            }
        };

        window.addEventListener('resize', updateStyles);
        updateStyles(); // Initial call
        return () => window.removeEventListener('resize', updateStyles);
    }, []);

    return (
        <Transition>
            <div className="flex flex-col justify-center h-full gap-8 m-auto text-center divide-y font-jakarta">
                <div className="flex flex-col gap-4">
                    <p className="text-lg font-semibold uppercase text-slate-500">Joining room</p>
                    <div className="p-4 outline outline-green-500 w-fit m-auto rounded-lg">
                        <p className="text-6xl font-bold uppercase">{params.code}</p>
                    </div>
                    <p className="text-lg font-semibold text-slate-500">Share the code with your friends to have them join you!</p>
                </div>

                <form
                    className="flex flex-col pt-8 space-y-6 content-center justify-center"
                    onSubmit={(e) => handleJoinLobby(e)}
                >
                    <p className="text-lg font-semibold uppercase text-slate-500">Enter your name</p>
                    <div className="-space-y-px m-auto">
                        <div>
                            <label className="sr-only">Name</label>
                            <input
                                id="name"
                                name="name"
                                type="name"
                                required
                                autoComplete="off"
                                onChange={(e) => setName(e.target.value)}
                                value={name}
                                style={inputStyle}
                                className="relative block text-center text-indigo-900 border rounded-md appearance-none placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10"
                                placeholder="Player 1"
                            />
                        </div>
                    </div>

                    <div className="min-w-sm m-auto">
                        <button
                            type="submit"
                            disabled={!name}
                            style={buttonStyle}
                            className={`relative flex justify-center border border-transparent rounded-lg group ${
                                !name ? 'bg-slate-300' : 'bg-indigo-600 hover:bg-indigo-700'
                            }`}
                        >
                            {roomOK ? 'Join Room' : roomError}
                        </button>
                    </div>
                </form>
            </div>
        </Transition>
    );
}

export default Onboard;
