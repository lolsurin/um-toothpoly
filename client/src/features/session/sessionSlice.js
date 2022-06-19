import { createSlice } from '@reduxjs/toolkit'
import { socket } from '../../context/socket'

const initialState = {
    online: true,
    inGame: false,
    state: '',
    id: ''
}

export const sessionSlice = createSlice({
    name: 'session',
    initialState,
    reducers: {
        sessionSet: (state, action) => {
            
            state.online = action.payload.online
            state.inGame = action.payload.inGame
            state.state = action.payload.state
        },
        sessionId: (state, action) => {
            
            state.id = action.payload
        },
        sessionSetInGame: (state, action) => {
            state.inGame = action.payload
        },
        sessionSetState: (state, action) => {
            state.state = action.payload
            socket.emit('game:updatePlayerState', action.payload)
        },
        sessionReset: () => initialState
    }
})

export const { sessionId, sessionSetState, sessionSetInGame, sessionReset } = sessionSlice.actions

export const sessionGetSession = (state) => state.session
export const sessionGetState = (state) => {
    return {
        isNew: state.session.state === '',
        inLobby: state.session.state === 'lobby',
        isOnboarding: state.session.state === 'onboarding',
        isJoining: state.session.state === 'joining',
        isWaiting: state.session.state === 'waiting',
        isInTutorial: state.session.state === 'tutorial',
    }
}

export default sessionSlice.reducer