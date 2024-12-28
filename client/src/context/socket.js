import React from "react"
import io from "socket.io-client"
import { store } from "../app/store"
import { sessionId } from "../features/session/sessionSlice"

export const socket = (process.env.NODE_ENV === 'production')
  ? io(process.env.REACT_APP_BACKEND_URL, { transports: ['websocket'] })
  : io(`ws://localhost:5000`, { transports: ['websocket'] })

socket.on('connect', () => {
    console.log("Connected to server with socket ID:", socket.id)
    store.dispatch(sessionId(socket.id))
})

export const SocketContext = React.createContext()