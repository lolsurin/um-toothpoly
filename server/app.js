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

const PORT = process.env.PORT || 5000
//const INDEX = 'build/index.html';

//app.use((req, res) => res.sendFile(INDEX, { root: __dirname }))

httpServer.listen(PORT, () => {
  console.log(`server listening on port ${port}`)
})