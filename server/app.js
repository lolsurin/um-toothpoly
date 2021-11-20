const express = require('express')
const { Server } = require('socket.io')
const gameSocket = require('./socket')

const app = express()

app.use(express.static('build'))

const httpServer = require('http').createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin: ["ws://localhost:3000"],
    methods: ["GET", "POST"]
  }
})

gameSocket(io)


httpServer.listen(process.env.PORT || 5000)