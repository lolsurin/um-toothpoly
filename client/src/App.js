import React, {useState, useEffect} from 'react';
import Playground from './components/playground'

import { socket } from './services/socket.js'
// storing socket connection in this global variable

function handleClick() {
  // we emit this event that increments the count on the server
  // and the updated count is emitted back via 'counter updated'
  //console.log()
  socket.emit('counter clicked');
}


function App() {
  const [count, setCount] = useState(0); 

  // after component mount...
  useEffect(() => {
    // connect to the socket server

    // when connected, look for when the server emits the updated count
    socket.on('counter updated', (countFromServer) => {
      // set the new count on the client
      setCount(countFromServer);
    })


  }, []);
  return (
    <div>
      {/* <button onClick={handleClick}>Counter: {count}</button> */}
      <Playground socket={socket}/>
    </div>
  );
}

export default App;
