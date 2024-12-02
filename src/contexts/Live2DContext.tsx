import { createContext, useContext, useState, useRef, ReactNode } from 'react';

interface Live2DContextType {
  speak: (text: string) => Promise<void>;
  changeSpeaker: (speakerId: string) => void;
  currentSpeaker: string;
}

interface Live2DProviderProps {
  children: ReactNode;
}

const TTS_BASE_URL = 'https://tts-api.parakeet-inc.com';
const TTS_API_KEY = 'sk-1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLM'; // 環境変数から取得することを推奨

const Live2DContext = createContext<Live2DContextType | null>(null);

export const Live2DProvider = ({ children }: Live2DProviderProps) => {
  const [currentSpeaker, setCurrentSpeaker] = useState('female_tsukuyomi');
  const iframeRef = useRef<HTMLIFrameElement>(null);

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

  return (
    <Live2DContext.Provider value={{ speak, changeSpeaker, currentSpeaker }}>
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