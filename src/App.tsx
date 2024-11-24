import Live2D from './components/Live2D';
import Chat from './components/Chat';
import './App.css';

function App() {
  return (
    <div className="App">
      <div className="left-container">
        <Live2D />
      </div>
      <div className="right-container">
        <Chat />
      </div>
    </div>
  );
}

export default App; 