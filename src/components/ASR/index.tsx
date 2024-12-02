import React, { useEffect, useState, useRef } from 'react';
import { AudioConfig, SpeechConfig, SpeechRecognizer } from 'microsoft-cognitiveservices-speech-sdk';
import './styles.css';

const API_KEY = process.env.REACT_APP_COG_SERVICE_KEY || '';
const API_LOCATION = process.env.REACT_APP_COG_SERVICE_LOCATION || '';
if (!API_KEY || !API_LOCATION) {
  console.error('Azure Speech Service の認証情報が設定されていません');
  throw new Error('環境変数 REACT_APP_COG_SERVICE_KEY と REACT_APP_COG_SERVICE_LOCATION を設定してください');
}

const sdk = require("microsoft-cognitiveservices-speech-sdk");
const speechConfig = SpeechConfig.fromSubscription(API_KEY, API_LOCATION);
speechConfig.speechRecognitionLanguage = "ja-JP";

let recognizer: SpeechRecognizer;

interface ASRProps {
  onTranscriptionComplete: (text: string) => void;
}

const ASR: React.FC<ASRProps> = ({ onTranscriptionComplete }) => {
  const [isRecognising, setIsRecognising] = useState(false);
  const [recognisedText, setRecognisedText] = useState("");
  const [recognisingText, setRecognisingText] = useState("");

  console.log('recognisingText:', recognisingText);
  console.log('recognisedText:', recognisedText);

  useEffect(() => {
    const constraints = {
      video: false,
      audio: {
        channelCount: 1,
        sampleRate: 16000,
        sampleSize: 16,
        volume: 1
      }
    };

    const getMedia = async (constraints: MediaStreamConstraints) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        createRecognizer(stream);
      } catch (err) {
        console.error('マイクの取得に失敗しました:', err);
        alert('マイクの使用許可が必要です');
      }
    };

    getMedia(constraints);

    return () => {
      if (recognizer) {
        stopRecognizer();
      }
    };
  }, []);

  const createRecognizer = (audioStream: MediaStream) => {
    const audioConfig = AudioConfig.fromStreamInput(audioStream);
    recognizer = new SpeechRecognizer(speechConfig, audioConfig);

    recognizer.recognizing = (s, e) => {
      console.log('認識中のテキスト:', e.result.text);
      setRecognisingText(e.result.text);
    };

    recognizer.recognized = (s, e) => {
      setRecognisingText("");
      if (e.result.reason === sdk.ResultReason.RecognizedSpeech) {
        const newText = e.result.text;
        console.log('認識完了テキスト:', newText);
        setRecognisedText((prevText) => {
          if (prevText === '') {
            return newText;
          } else {
            return `${prevText} ${newText}`;
          }
        });
        onTranscriptionComplete(newText);
      }
    };

    recognizer.canceled = (s, e) => {
      console.log(`認識がキャンセルされました: ${e.reason}`);
      recognizer.stopContinuousRecognitionAsync();
      setIsRecognising(false);
    };

    recognizer.sessionStopped = () => {
      recognizer.stopContinuousRecognitionAsync();
      setIsRecognising(false);
    };
  };

  const stopRecognizer = () => {
    setIsRecognising(false)
    recognizer.stopContinuousRecognitionAsync()
  }

  const toggleRecognition = () => {
    if (!isRecognising) {
      recognizer.startContinuousRecognitionAsync();
      setIsRecognising(true);
    } else {
      recognizer.stopContinuousRecognitionAsync();
      setIsRecognising(false);
    }
  };

  return (
    <button 
      className={`asr-button ${isRecognising ? 'recording' : ''}`}
      onClick={toggleRecognition}
      title={isRecognising ? '音声認識を停止' : '音声認識を開始'}
    >
      <span className="material-icons">
        {isRecognising ? 'mic' : 'mic_none'}
      </span>
    </button>
  );
};

export default ASR;