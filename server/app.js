const express = require('express')
const { Server } = require('socket.io')
const gameSocket = require('./socket')
const cors = require('cors')

const app = express()

app.use(express.static('build'))

app.use(cors({
  origin: "https://toothpoly-game.netlify.app", // Replace with your actual Netlify URL
  methods: ["GET", "POST"],
  credentials: true // Enable cookies and other credentials sharing if needed
}))

const httpServer = require('http').createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin: "https://your-frontend-site.netlify.app", // Replace with your actual Netlify URL
    methods: ["GET", "POST"],
  },
  pingTimeout: 60000,
  pingInterval: 25000
})

gameSocket(io)

const PORT = process.env.PORT || 5000
const INDEX = 'build/index.html';

app.use((req, res) => res.sendFile(INDEX, { root: __dirname }))

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`)
})