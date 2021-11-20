import io from 'socket.io-client'

export const socket = io(`ws://${ process.env.HOST || "localhost" }:5000`, { transports : ['websocket'] })