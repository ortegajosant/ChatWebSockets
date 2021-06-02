import React, { Component } from 'react';
import Chat from './Chat'
import './App.css';
 
class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Bienvenido al chat de WebSockets</h1>
        </header>
        <Chat />
      </div>
    );
  }

  run() {
      
  }
}
 
export default App;