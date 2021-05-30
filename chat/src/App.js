import React, { Component } from 'react';
import Chat from './Chat'
 
class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Welcome to Chat</h1>
        </header>
        <Chat />
      </div>
    );
  }

  run() {
      
  }
}
 
export default App;