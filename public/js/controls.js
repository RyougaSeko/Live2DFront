import { LipSync } from './lipSync.js';
import { TTSService } from './ttsService.js';

export class ModelControls {
  constructor(live2DModel) {
    this.live2DModel = live2DModel;
    this.lipSync = new LipSync(live2DModel);
    this.ttsService = new TTSService();
    
    // 初期位置の設定
    this.defaultYOffset = 400;
    
    this.initializeControls();
    this.setInitialPosition();
  }

  setInitialPosition() {
    if (this.live2DModel) {
      const yOffset = this.defaultYOffset;
      this.live2DModel.position.set(
        window.innerWidth / 2,
        window.innerHeight / 2 + yOffset
      );
      
      // スライダーと表示値を初期値に設定
      if (this.elements.yPosRange) {
        this.elements.yPosRange.value = yOffset;
      }
      if (this.elements.yPosValue) {
        this.elements.yPosValue.textContent = yOffset;
      }
    }
  }

  initializeControls() {
    this.elements = {
      scaleRange: document.getElementById('scaleRange'),
      scaleValue: document.getElementById('scaleValue'),
      xPosRange: document.getElementById('xPosRange'),
      xPosValue: document.getElementById('xPosValue'),
      yPosRange: document.getElementById('yPosRange'),
      yPosValue: document.getElementById('yPosValue'),
      mouthRange: document.getElementById('mouthRange'),
      startTalkingBtn: document.getElementById('startTalkingBtn'),
      stopTalkingBtn: document.getElementById('stopTalkingBtn')
    };

    this.setupEventListeners();
  }

  setupEventListeners() {
    const { scaleRange, xPosRange, yPosRange } = this.elements;

    scaleRange.addEventListener('input', (e) => {
      const scale = parseFloat(e.target.value);
      this.live2DModel.scale.set(scale);
      this.elements.scaleValue.textContent = scale.toFixed(2);
    });

    xPosRange.addEventListener('input', () => this.updatePosition());
    yPosRange.addEventListener('input', () => this.updatePosition());

    this.elements.startTalkingBtn.addEventListener('click', () => this.startTalking());
    this.elements.stopTalkingBtn.addEventListener('click', () => this.stopTalking());
  }

  updatePosition() {
    if (this.live2DModel) {
      const xOffset = parseInt(this.elements.xPosRange.value);
      const yOffset = parseInt(this.elements.yPosRange.value);
      
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      this.live2DModel.position.set(
        centerX + xOffset,
        centerY + yOffset
      );

      this.elements.xPosValue.textContent = xOffset;
      this.elements.yPosValue.textContent = yOffset;
    }
  }

  async startTalking(text = "こんにちは、私はLive2Dモデルです。") {
    try {
      // TTSオプションの設定
      const ttsOptions = {
        lang: 'ja',
        spk_id: 'female_tsukuyomi', // デフォルトの話者
        output_format: 'mp3',
        stream: false
      };

      // TTSで音声を生成
      console.log('音声生成開始:', text);
      const audioUrl = await this.ttsService.generateSpeech(text, ttsOptions);
      console.log('音声生成完了:', audioUrl);
      
      // 生成された音声でリップシンクを開始
      await this.lipSync.startSpeaking(audioUrl);
    } catch (error) {
      console.error('会話開始に失敗しました:', error);
      // エラーメッセージをユーザーに表示する処理を追加
      alert('音声の生成に失敗しました。しばらく待ってから再試行してください。');
    }
  }

  stopTalking() {
    this.lipSync.stop();
  }

  // 話者を変更する機能を追加
  changeSpeaker(speakerId) {
    if (this.ttsService.getSpeakerIds().includes(speakerId)) {
      this.currentSpeakerId = speakerId;
    } else {
      console.error('無効な話者ID:', speakerId);
    }
  }
} 