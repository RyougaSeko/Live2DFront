import { useLive2D } from '../../contexts/Live2DContext';
import './styles.css';

const NewsStatus = () => {
  const { nextNewsTime, isPlaying } = useLive2D();

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="news-status">
      {isPlaying ? (
        <div className="news-playing">
          <span className="pulse">●</span> ニュース再生中
        </div>
      ) : nextNewsTime && (
        <div className="next-news">
          次のニュース: {formatTime(nextNewsTime)}
        </div>
      )}
    </div>
  );
};

export default NewsStatus; 