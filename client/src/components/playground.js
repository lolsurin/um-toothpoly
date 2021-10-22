import React from 'react'
import { socket } from '../services/socket';

export default class Playground extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            roomCode: '',
            counter: 0
        };
        
        this.handleChange = this.handleChange.bind(this)
        this.handleJoinGame = this.handleJoinGame.bind(this)
        this.handleNewGame = this.handleNewGame.bind(this)
        
        this.handleClick = this.handleClick.bind(this)

        this.handleUpdateCounter = this.handleUpdateCounter.bind(this)
        this.handleInit = this.handleInit.bind(this) 
        this.handleGameCode = this.handleGameCode.bind(this)

    }

    componentDidMount() {
        socket.on('updateCounter', this.handleUpdateCounter)
        socket.on('init', this.handleInit)
        socket.on('gameCode', this.handleGameCode)
        
    }

    handleChange(event) {
        this.setState({roomCode: event.target.value});
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

    render() {
        return (
            <div>
                <button onClick={this.handleNewGame}>New Game</button>
                <label></label>
                <form onSubmit={this.handleJoinGame}>
                    <label>
                    Room:
                    <input type="text" value={this.state.roomCode} onChange={this.handleChange} />
                    </label>
                    <input type="submit" value="go!" />
                </form>
                <button onClick={this.handleClick}>Counter: {this.state.counter}</button>
            </div>
        );
    }
}