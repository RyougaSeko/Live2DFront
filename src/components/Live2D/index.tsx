import { useRef } from 'react';
import './styles.css';

const Live2D = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  return (
    <div className="live2d-container">
      <iframe
        ref={iframeRef}
        src="/live2d.html"  // publicフォルダに配置するHTML
        className="live2d-iframe"
        title="Live2D Character"
        frameBorder="0"
      />
    </div>
  );
};

export default Live2D; 