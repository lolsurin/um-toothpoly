import { createSlice } from '@reduxjs/toolkit'

import _ from "lodash"

let initialState = {
    myId: null,
    code: null,
    turn: 0,
    events: {
        event: null,
        rolled: null
    },
    players: [],
    podium: [],
    moving: false,
    inQuestion: false,
    isDimmed: true,
    isSupposedToClearMotion: true,
}

export const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        gameSetMyId: (state, action) => {
            state.myId = action.payload
        },
        gameDisable: (state) => { state.disable = true },
        gameEnable: (state) => { state.disable = false },
        gameIsAnimating: (state, action) => { state.isAnimating = action.payload },
        gameSetGame: (state, action) => {
            let game = action.payload

            state.code = game.code
            // state.scene = game.scene
            // state.turn = game.turn
            // state.gameDisabled = game.disableGame
            state.podium = game.podium || []
            state.events = {
                event: game.scene,
                rolled: null
            }

            // reset movement?
            // state.players.map(p => p.motion = {})
            // 

            state.players = game.players
        },
        gameResetPlayerMotion: (state) => {
            

            let playersCloned = _.cloneDeep(state.players)

            playersCloned.map(p => {

                let lastBottom = p.motion.bottom[p.motion.bottom.length - 1]
                let lastLeft = p.motion.left[p.motion.left.length - 1]
                
                p.motion = {
                    bottom: lastBottom,
                    left: lastLeft,
                }
            })

            //

            state.players[state.turn] = playersCloned[state.turn]
            
        },
        gameSetPlayer: (state, action) => {
            state.players[action.payload.number] = action.payload.player
        },
        gameSetPlayers: (state, action) => {
            state.players = action.payload.players
        },
        // Events
        gameDiceRolled: (state, action) => {
            state.events.rolled = action.payload
        },
        gameSetTurn: (state, action) => {
            
            state.turn = action.payload
        },
        gameSetTimerId: (state, action) => {
            state.timerId = action.payload
        },
        gameSetMoving: (state) => {
            state.moving = !state.moving
        },
        gameSetInQuestion: (state, action) => {
            state.inQuestion = action.payload
        },
        gameDim: (state, action) => {
            state.isDimmed = !state.isDimmed
        },
        gameToggleClearMotion: (state) => {
            state.isSupposedToClearMotion = !state.isSupposedToClearMotion
        },
        gameReset: () => initialState

    }
})

export const { 
    gameSetGame,
    gameResetPlayerMotion,
    gameSetMyId,
    gameDiceRolled,
    gameDisable,
    gameEnable,
    gameSetTurn,
    gameSetPlayer,
    gameSetPlayers,
    gameSetTimerId,
    gameSetMoving,
    gameIsAnimating,
    gameSetInQuestion,
    gameDim,
    gameReset,
    gameToggleClearMotion
} = gameSlice.actions

export const selectGame = (state) => state
export const selectCurrentState = (state, id) =>
    state.players.find((player) => player._id === id).state
export const selectAllPlayerCompletedTutorial = (state) => 
    !state.players?.find(player => player.state === 'tutorial')

export default gameSlice.reducer