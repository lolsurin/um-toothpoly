Note for incoming contributors

- This is not at all a clean code (my bad)

## Setting up

Prereqs
- Node
- `npm i` both the server and client
- run the server first (`cd server && npm start`)
- run the client (`cd client && npm start`)

The server holds the game state and handles concurrent connections. The client connects to the server via websockets (using `socket.io` as the underlying technology)

