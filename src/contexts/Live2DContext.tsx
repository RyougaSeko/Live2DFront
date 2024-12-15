import { createContext, useContext, useState, useRef, ReactNode, useEffect } from 'react';

interface Live2DContextType {
  speak: (text: string) => Promise<void>;
  changeSpeaker: (speakerId: string) => void;
  currentSpeaker: string;
  playRandomNews: () => Promise<void>;
  setIframeRef: (ref: HTMLIFrameElement | null) => void;
  nextNewsTime: Date | null;
  isPlaying: boolean;
}

interface Live2DProviderProps {
  children: ReactNode;
}

const TTS_BASE_URL = 'https://tts-api.parakeet-inc.com';
const TTS_API_KEY = 'sk-1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLM'; // 環境変数から取得することを推奨

const Live2DContext = createContext<Live2DContextType | null>(null);

export const Live2DProvider = ({ children }: Live2DProviderProps) => {
  const [currentSpeaker, setCurrentSpeaker] = useState('female_tsukuyomi');
  const [nextNewsTime, setNextNewsTime] = useState<Date | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // 3分ごとにニュースを読み上げる
  useEffect(() => {
    const autoPlayNews = async () => {
      try {
        setIsPlaying(true);
        await playRandomNews();
      } catch (error) {
        console.error('自動ニュース再生に失敗しました:', error);
      } finally {
        setIsPlaying(false);
        // 次の再生時刻を設定
        const next = new Date();
        next.setMinutes(next.getMinutes() + 3);
        setNextNewsTime(next);
      }
    };

    // 初回実行
    autoPlayNews();

    // 3分ごとに実行
    const intervalId = setInterval(autoPlayNews, 3 * 60 * 1000);

    // クリーンアップ
    return () => clearInterval(intervalId);
  }, []);

  const setIframeRef = (ref: HTMLIFrameElement | null) => {
    iframeRef.current = ref;
  };

  const generateSpeech = async (text: string) => {
    try {
      const response = await fetch(`${TTS_BASE_URL}/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TTS_API_KEY}`,
          'accept': 'audio/mp3',
        },
        body: JSON.stringify({
          text,
          lang: 'ja',
          spk_id: currentSpeaker,
          output_format: 'mp3',
          stream: false,
          device: 'cuda'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const audioBlob = await response.blob();
      return URL.createObjectURL(audioBlob);
    } catch (error) {
      console.error('TTS生成に失敗しました:', error);
      throw error;
    }
  };

  const speak = async (text: string) => {
    try {
      const audioUrl = await generateSpeech(text);
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage({
          type: 'SPEAK',
          audioUrl,
          text
        }, '*');
      }
    } catch (error) {
      console.error('音声生成に失敗しました:', error);
      throw error;
    }
  };

  const changeSpeaker = (speakerId: string) => {
    setCurrentSpeaker(speakerId);
  };

  const playRandomNews = async () => {
    try {
      // キャッシュを無効化するためにタイムスタンプをクエリパラメータとして追加
      const timestamp = new Date().getTime();
      const response = await fetch(
        `https://hironocho-api-d7b0dqgzcrc9e6du.japaneast-01.azurewebsites.net/random-news?t=${timestamp}`, 
        {
          method: 'GET',
          headers: {
            'Accept': 'audio/mp3',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      if (!iframeRef.current?.contentWindow) {
        throw new Error('Live2Dモデルが見つかりません');
      }

      iframeRef.current.contentWindow.postMessage({
        type: 'SPEAK_WITH_AUDIO',
        audioUrl,
        text: 'ニュースを読み上げています'
      }, '*');

    } catch (error) {
      console.error('ニュースの再生に失敗しました:', error);
      throw error;
    }
  };

  return (
    <Live2DContext.Provider value={{ 
      speak, 
      changeSpeaker, 
      currentSpeaker,
      playRandomNews,
      setIframeRef,
      nextNewsTime,
      isPlaying
    }}>
      {children}
    </Live2DContext.Provider>
  );
};

export const useLive2D = () => {
  const context = useContext(Live2DContext);
  if (!context) {
    throw new Error('useLive2D must be used within a Live2DProvider');
  }
  return context;
}; 