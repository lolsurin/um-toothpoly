import io from 'socket.io-client'

export const socket = io(`ws://${ process.env.HOST || "localhost" }:${ process.env.PORT || "5000" }`, { transports : ['websocket'] })