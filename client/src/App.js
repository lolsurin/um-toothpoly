import React, {useState, useEffect} from 'react';
import Playground from './components/playground'
import Lobby from './components/lobby';

import { socket } from './services/socket.js'

function App() {

  return (
    <div>
      <Playground socket={socket}/>
      {/* <Lobby socket={socket}/> */}
    </div>
  );
}

export default App;
