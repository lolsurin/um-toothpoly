import { useState } from "react";
import { ArrowLeftIcon } from "@heroicons/react/solid"
import { ChevronRightIcon } from "@heroicons/react/outline"

function Lobby() {
    
    const [inRoom, setInRoom] = useState(false)
    const [roomField, setRoomField] = useState("")

    const onNewGame = () => {
        setInRoom(true)
    }

    const onBack = () => {
        setInRoom(false)
    }

    const handleJoinRoom = (event) => {
        event.preventDefault()
        console.log('Attempting to join room ' + roomField)
    }

    useState(()=> {
        
    })

    return (
        <div class='flex h-screen bg-red-100 items-center justify-center'>
            <div class="bg-white max-w-lg mx-auto p-8 md:p-10 my-10 rounded-lg shadow-2xl">
                <registerContent class={ inRoom ? "hidden" : ""}>
                    <section>
                        <h3 class="font-bold text-2xl text-center">Tooth Ladder</h3>
                        <p class="text-gray-600 pt-2 text-center">Test your dental knowledge!</p>
                    </section>

                    <section class="mt-10">
                        <button class="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold p-4 rounded shadow-lg hover:shadow-xl transition duration-200 text-center" onClick={onNewGame}>New Game</button>
                        <p class="text-gray-600 mt-4 mb-4 w-full text-center">or join existing room</p>
                        <form onSubmit={handleJoinRoom}>
                            <input class="w-full p-4 text-sm bg-gray-50 focus:outline-none border border-gray-200 rounded text-gray-600" type="text" placeholder="Room Code" value={roomField} onChange={e => setRoomField(e.target.value)} />
                            
                            {
                                roomField ? 
                                (<button type="submit" class="flex justify-center items-center h-10 w-min p-4 m-auto mt-2 rounded-full hover:bg-gray-300 bg-gray-100">
                                    <p class="ml-3">Join!</p><ChevronRightIcon class="m-1 h-5 w-5 text-gray-500"/>
                                </button>) : null
                            } 
                        </form>
                                           
                                                
                    </section>

                    {/* <button class="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold p-4 rounded shadow-lg hover:shadow-xl transition duration-200 text-center">Dev see next</button> */}
                </registerContent>

                <roomContent class={ inRoom ? "" : "hidden"}>
                    <div class="flex justify-center items-center h-10 w-10 rounded-full hover:bg-gray-300 bg-gray-100">
                        <ArrowLeftIcon class="h-7 w-7 text-gray-500" onClick={onBack}/>
                    </div>

                    <section>
                        <h3 class="mt-2 font-bold text-2xl">Room Test</h3>
                        <p class="text-gray-600 pt-2">Current players</p>
                    </section>

                    <section class="mt-10">

                        <button class="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold p-4 rounded shadow-lg hover:shadow-xl transition duration-200 text-center">Start Game!</button>
                    </section>

                </roomContent>
            </div>

        </div>
    )
}

export default Lobby;