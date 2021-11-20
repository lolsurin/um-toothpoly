import io from 'socket.io-client'

export const socket = io(`ws://um-toothpoly.herokuapp.com:${ process.env.PORT }`, { transports : ['websocket'] })