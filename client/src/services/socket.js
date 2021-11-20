import io from 'socket.io-client'

//export const socket = io(`ws://localhost:5000`, { transports : ['websocket'] })
export const socket = io(`wss://um-toothpoly.herokuapp.com:${ process.env.PORT }`, { transports : ['websocket'] })