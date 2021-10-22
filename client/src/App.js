import React, {useState, useEffect} from 'react';
import { io } from 'socket.io-client'; 
import Playground from './components/playground'
// storing socket connection in this global variable
let socket = null;

function handleClick() {
  // we emit this event that increments the count on the server
  // and the updated count is emitted back via 'counter updated'
  //console.log
  socket.emit('counter clicked');
}

function joinRoomOne() {
  socket.emit('join room 1')
}

function joinRoomTwo() {

}



function App() {
  const [count, setCount] = useState(0); 

  // after component mount...
  useEffect(() => {
    // connect to the socket server
    socket = io('ws://localhost:5000', { transports : ['websocket'] });
    //socket = io()

    // when connected, look for when the server emits the updated count
    socket.on('counter updated', (countFromServer) => {
      // set the new count on the client
      setCount(countFromServer);
    })


  }, []);
  return (
    <div>
      <button onClick={handleClick}>Counter: {count}</button>
      <Playground socket={socket}/>
    </div>
  );
}

export default App;
