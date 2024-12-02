import React, { useEffect, useState, useRef } from 'react';
import { AudioConfig, SpeechConfig, SpeechRecognizer } from 'microsoft-cognitiveservices-speech-sdk';
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';
import * as tf from '@tensorflow/tfjs-core';
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const detectorRef = useRef<poseDetection.PoseDetector | null>(null);
  const personDetectedTimeRef = useRef<number | null>(null);
  const [hasStartedOnce, setHasStartedOnce] = useState(false);

  // TensorFlowの初期化
  useEffect(() => {
    const initTensorFlow = async () => {
      try {
        await tf.setBackend('webgl');
        await initializePoseDetection();
        await startVideo();  // ビデオ初期化を同期的に実行
        console.log('TensorFlow初期化完了');  // デバッグログ
      } catch (error) {
        console.error('TensorFlow初期化エラー:', error);
      }
    };
    
    initTensorFlow();
  }, []);

  // 人物検出の初期化
  const initializePoseDetection = async () => {
    try {
      const detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
      );
      detectorRef.current = detector;
      console.log('検出器の初期化完了');  // デバッグログ
    } catch (error) {
      console.error('検出器の初期化エラー:', error);
    }
  };

  // ビデオストリームの開始
  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 },
        audio: false 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadeddata = () => {
          console.log('ビデオストリーム準備完了');  // デバッグログ
          detectPerson();  // ビデオ準備完了後に検出開始
        };
      }
    } catch (err) {
      console.error('カメラの取得に失敗しました:', err);
    }
  };

  // 人物検出の実行
  const detectPerson = async () => {
    if (!detectorRef.current || !videoRef.current) {
      console.log('detector または video が準備できていません');
      return;
    }

    try {
      const poses = await detectorRef.current.estimatePoses(videoRef.current);
      const personDetected = poses.length > 0;
      
      // 人物が検出された場合
      if (personDetected) {
        // まだ一度も音声認識を開始していない場合のみ処理
        if (!hasStartedOnce && !isRecognising) {
          if (!personDetectedTimeRef.current) {
            console.log('初回の人物検出 - 3秒カウント開始');
            personDetectedTimeRef.current = Date.now();
          } else if (Date.now() - personDetectedTimeRef.current >= 2000) {
            console.log('3秒経過、初回の音声認識を開始します');
            startRecognition();
            setHasStartedOnce(true);
            personDetectedTimeRef.current = null;
            return; // 音声認識開始後は即座にreturn
          }
        }
      } 
      // 人物が検出されない場合
      else {
        if (personDetectedTimeRef.current !== null && !hasStartedOnce) {
          console.log('人物が検出範囲外になりました - カウントをリセット');
          personDetectedTimeRef.current = null;
        }
        if (isRecognising) {
          stopRecognition();
        }
      }
    } catch (error) {
      console.error('ポーズ検出エラー:', error);
    }

    // 次のフレームの検出を予約（音声認識開始後は実行しない）
    if (!hasStartedOnce) {
      requestAnimationFrame(detectPerson);
    }
  };

  // startRecognition関数を修正
  const startRecognition = () => {
    if (!isRecognising) {
      // 初回の音声認識開始時にAIが話しかける
      if (!hasStartedOnce) {
        const live2dIframe = document.querySelector('.live2d-iframe') as HTMLIFrameElement;
        if (live2dIframe && live2dIframe.contentWindow) {
          live2dIframe.contentWindow.postMessage({
            type: 'SPEAK',
            text: 'こんにちは。何か御用でしょうか？'
          }, '*');
        }
      }
      recognizer.startContinuousRecognitionAsync();
      setIsRecognising(true);
    }
  };

  // stopRecognition関数を修正
  const stopRecognition = () => {
    if (isRecognising) {
      recognizer.stopContinuousRecognitionAsync();
      setIsRecognising(false);
    }
  };

  // 音声認識の設定（既存のコード）
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

    let audioStream: MediaStream | null = null;

    const getMedia = async (constraints: MediaStreamConstraints) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        audioStream = stream;
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
      // AudioStreamのトラックを停止
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
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
    try {
      setIsRecognising(false);
      if (recognizer) {
        recognizer.stopContinuousRecognitionAsync(() => {
          console.log('音声認識を停止しました');
        }, (err) => {
          console.error('音声認識の停止に失敗:', err);
        });
      }
    } catch (error) {
      console.error('認識停止中にエラーが発生:', error);
    }
  }

  // toggleRecognition関数を修正して既存の関数を使用
  const toggleRecognition = () => {
    if (!isRecognising) {
      startRecognition();
    } else {
      stopRecognition();
    }
  };

  return (
    <div className="asr-container">
      <video
        ref={videoRef}
        className="person-detection-video"
        autoPlay
        playsInline
        muted
      />
      <button 
        className={`asr-button ${isRecognising ? 'recording' : ''}`}
        onClick={toggleRecognition}
        title={isRecognising ? '音声認識を停止' : '音声認識を開始'}
      >
        <span className="material-icons">
          {isRecognising ? 'mic' : 'mic_none'}
        </span>
      </button>
    </div>
  );
};

export default ASR;