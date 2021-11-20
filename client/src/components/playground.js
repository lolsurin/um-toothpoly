import React from 'react'
import { socket } from '../services/socket';

export default class Playground extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            roomCode: '',
            counter: 0,
            playerName: '',
            players: ''
        };
        //functional components
        
        this.handleChange = this.handleChange.bind(this)
        this.handleJoinGame = this.handleJoinGame.bind(this)
        this.handleNewGame = this.handleNewGame.bind(this)
        
        this.handleClick = this.handleClick.bind(this)

        this.handleUpdateCounter = this.handleUpdateCounter.bind(this)
        this.handleInit = this.handleInit.bind(this) 
        this.handleGameCode = this.handleGameCode.bind(this)
        this.handleUpdatePlayerList = this.handleUpdatePlayerList.bind(this)

    }

    componentDidMount() {
        socket.on('updateCounter', this.handleUpdateCounter)
        socket.on('init', this.handleInit)
        socket.on('gameCode', this.handleGameCode)
        socket.on('updatePlayerList', this.handleUpdatePlayerList)
        
    }

    handleChange(event) {
        //the form now accepts two values (roomCode, playerName)
        this.setState({
            ...this.state,
            [event.target.name]: event.target.value
        });
    }

    handleInit(player) {
        console.log('player ' + player + ' connected to room')
    }

    handleGameCode(code) {
        console.log('code is ' + code)
        this.setState({roomCode: code})
    }

    handleJoinGame(event) {
        //alert('A name was submitted: ' + this.state.value);
        this.props.socket.emit('joinGame', this.state)
        event.preventDefault();
    }

    handleNewGame(event) {
        this.props.socket.emit('newGame')
        event.preventDefault();
    }

    handleClick(event) {
        console.log('clicked')
        this.props.socket.emit('counter')
        event.preventDefault()
    }

    handleUpdateCounter(tet) {
        console.log('received ' + tet)
        this.setState({counter: tet})
    }

    handleUpdatePlayerList(PL) {
        console.log('received '+PL)
        this.setState({players: PL})
    }
    render() {
        return (
            <div>
                <button onClick={this.handleNewGame}>New Game</button>
                <label></label>
                {/* Form has two inputs now; player ingame-name and room code*/ }
                <form onSubmit={this.handleJoinGame}>
                    <label>
                    Room:
                    <input type="text" name="roomCode" value={this.state.roomCode} onChange={this.handleChange} />
                    </label>
                    <label>
                    Name:
                    <input type="text" name="playerName" value={this.state.playerName} onChange={this.handleChange} />
                    </label>
                    <input type="submit" value="go!" />
                </form>
                <button onClick={this.handleClick}>Counter: {this.state.counter}</button>
                <p>Players: {this.state.players}</p>
            </div>
        );
    }
}