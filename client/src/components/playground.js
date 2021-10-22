import React from 'react'

export default class Playground extends React.Component {
    constructor(props) {
        super(props);

        this.state = {value: ''};
        
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

    }

    handleChange(event) {
        this.setState({value: event.target.value});
    }
    
    handleSubmit(event) {
        //alert('A name was submitted: ' + this.state.value);
        console.log('client event captured')
        this.props.socket.emit('component event')
        event.preventDefault();
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <label>
                rOOM:
                <input type="text" value={this.state.value} onChange={this.handleChange} />
                </label>
                <input type="submit" value="gO!" />
            </form>
        );
    }
}