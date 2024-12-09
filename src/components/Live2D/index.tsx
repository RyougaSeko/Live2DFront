import { useRef } from 'react';
import './styles.css';
import { useLive2D } from '../../contexts/Live2DContext';

const Live2D = () => {
  const { setIframeRef } = useLive2D();

  return (
    <div className="live2d-container">
      <iframe
        ref={setIframeRef}
        src="/live2d.html"
        className="live2d-iframe"
        title="Live2D Character"
        frameBorder="0"
      />
    </div>
  );
};

export default Live2D; 