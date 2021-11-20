import io from 'socket.io-client'

//export const socket = io(`ws://localhost:5000`, { transports : ['websocket'] })
export const socket = (process.env.NODE_ENV === 'production') ? io() : io(`ws://localhost:5000`, { transports : ['websocket'] })