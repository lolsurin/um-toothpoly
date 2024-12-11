Note for incoming contributors

- This is not at all a clean code (my bad)

## Setting up

Prereqs
- Node
- `npm i` both the server and client
- run the server first (`cd server && npm start`)
- run the client (`cd client && npm start`)

The server holds the game state and handles concurrent connections. The client connects to the server via websockets (using `socket.io` as the underlying technology)

Prod build
- I've set it so that if you run `npm run build` in `client` it will put it in the `build` folder in `server`
- Therefore technically, you will only need to dockerize the server (after the build) and deploy it to your preferred compute infra
