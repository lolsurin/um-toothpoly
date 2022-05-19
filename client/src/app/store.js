import { configureStore } from "@reduxjs/toolkit";
import gameReducer from "../features/game/gameSlice";
import sessionReducer from "../features/session/sessionSlice";

export const store = configureStore({
    reducer: {
        session: sessionReducer,
        game: gameReducer,
    }
})