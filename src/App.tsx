import Live2D from './components/Live2D';
import Chat from './components/Chat';
import NewsStatus from './components/NewsStatus';
import { Live2DProvider } from './contexts/Live2DContext';
import './App.css';

function App() {
  return (
    <Live2DProvider>
      <div className="App">
          <NewsStatus />
        <div className="left-container">
          <Live2D />
        </div>
        <div className="right-container">
          <Chat />
        </div>
      </div>
    </Live2DProvider>
  );
}

export default App; 