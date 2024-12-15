import { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';
import { usePersonDetection } from '../../contexts/PersonDetectionContext';
import './styles.css';

const PersonDetection = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [model, setModel] = useState<blazeface.BlazeFaceModel | null>(null);
  const { isPersonPresent, setIsPersonPresent } = usePersonDetection();

  useEffect(() => {
    const loadModel = async () => {
      await tf.ready();
      const loadedModel = await blazeface.load();
      setModel(loadedModel);
    };

    loadModel();
    startVideo();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('カメラの起動に失敗しました:', err);
    }
  };

  const detectPerson = async () => {
    if (model && videoRef.current) {
      const predictions = await model.estimateFaces(videoRef.current, false);
      const personDetected = predictions.length > 0;
      console.log('人検出結果:', {
        検出: personDetected,
        検出数: predictions.length
      });
      setIsPersonPresent(personDetected);
    }
  };

  useEffect(() => {
    if (model) {
      const interval = setInterval(detectPerson, 1000);
      return () => clearInterval(interval);
    }
  }, [model]);

  return (
    <div className="person-detection">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="detection-video"
      />
      <div className={`status-indicator ${isPersonPresent ? 'present' : 'absent'}`}>
        {isPersonPresent ? '人を検出しました' : '人が見つかりません'}
      </div>
    </div>
  );
};

export default PersonDetection; 