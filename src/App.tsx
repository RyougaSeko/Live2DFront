import Live2D from './components/Live2D';
import Chat from './components/Chat';
import NewsStatus from './components/NewsStatus';
import { Live2DProvider } from './contexts/Live2DContext';
import './App.css';
import PersonDetection from './components/PersonDetection';
import { PersonDetectionProvider } from './contexts/PersonDetectionContext';

function App() {
  return (
    <PersonDetectionProvider>
      <Live2DProvider>
        <div className="App">
          <NewsStatus />
          <PersonDetection />
          <div className="left-container">
            <Live2D />
          </div>
          <div className="right-container">
            <Chat />
          </div>
        </div>
      </Live2DProvider>
    </PersonDetectionProvider>
  );
}

export default App; 