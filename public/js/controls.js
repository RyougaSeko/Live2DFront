import { LipSync } from './lipSync.js';
import { TTSService } from './ttsService.js';

export class ModelControls {
  constructor(live2DModel) {
    this.live2DModel = live2DModel;
    this.lipSync = new LipSync(live2DModel);
    this.ttsService = new TTSService();
    this.isPlayingNews = false;
    
    // 初期位置の設定
    this.defaultYOffset = 400;
    
    this.elements = {
      scaleRange: document.getElementById('scaleRange'),
      xPosRange: document.getElementById('xPosRange'),
      yPosRange: document.getElementById('yPosRange'),
      scaleValue: document.getElementById('scaleValue'),
      xPosValue: document.getElementById('xPosValue'),
      yPosValue: document.getElementById('yPosValue'),
      mouthRange: document.getElementById('mouthRange'),
      speakerSelect: document.getElementById('speakerSelect'),
    };

    if (!this.validateElements()) {
      console.error('必要なDOM要素が見つかりませんでした');
      return;
    }

    this.initializeControls();
    this.setInitialPosition();
  }

  validateElements() {
    const requiredElements = ['scaleRange', 'xPosRange', 'yPosRange', 'scaleValue', 'xPosValue', 'yPosValue'];
    return requiredElements.every(elementId => this.elements[elementId] !== null);
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
    this.setupEventListeners();
  }

  setupEventListeners() {
    const { scaleRange, xPosRange, yPosRange } = this.elements;

    if (scaleRange) {
      scaleRange.addEventListener('input', (e) => {
        const scale = parseFloat(e.target.value);
        this.live2DModel.scale.set(scale);
        this.elements.scaleValue.textContent = scale.toFixed(2);
      });
    }

    if (xPosRange) {
      xPosRange.addEventListener('input', () => this.updatePosition());
    }

    if (yPosRange) {
      yPosRange.addEventListener('input', () => this.updatePosition());
    }

    this.elements.speakerSelect.addEventListener('change', () => this.changeSpeaker(this.elements.speakerSelect.value));
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

  async stopTalking() {
    if (this.live2DModel) {
      console.log('リップシンクの停止');
      // リップシンクの停止
      await this.live2DModel.stopSpeaking();
      
      // 音声の停止
      if (this.live2DModel.audio) {
        await this.live2DModel.audio.pause();
        this.live2DModel.audio.currentTime = 0;
        this.live2DModel.audio = null;
      }

      // ニュース再生フラグをリセット
      this.isPlayingNews = false;
    } else {
      console.error('Live2Dモデルが見つかりません');
    }
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