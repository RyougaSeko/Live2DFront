import { LipSync } from './lipSync.js';

export class ModelControls {
  constructor(live2DModel) {
    this.live2DModel = live2DModel;
    this.lipSync = new LipSync(live2DModel);
    this.baseX = window.innerWidth / 2;
    this.baseY = window.innerHeight / 2;
    this.initializeControls();
    this.setInitialPosition();
  }

  setInitialPosition() {
    const initialYOffset = 400;
    this.live2DModel.position.set(
      this.baseX,
      this.baseY + initialYOffset
    );
    
    if (this.elements.yPosRange) {
      this.elements.yPosRange.value = initialYOffset;
    }
    if (this.elements.yPosValue) {
      this.elements.yPosValue.textContent = initialYOffset;
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
    const xOffset = parseInt(this.elements.xPosRange.value);
    const yOffset = parseInt(this.elements.yPosRange.value);
    
    this.live2DModel.position.set(
      this.baseX + xOffset,
      this.baseY + yOffset
    );

    this.elements.xPosValue.textContent = xOffset;
    this.elements.yPosValue.textContent = yOffset;
  }

  async startTalking() {
    try {
      const audioUrl = 'https://cdn.jsdelivr.net/gh/RaSan147/pixi-live2d-display@v1.0.3/playground/test.mp3';
      await this.lipSync.startSpeaking(audioUrl);
    } catch (error) {
      console.error('会話開始に失敗しました:', error);
    }
  }

  stopTalking() {
    this.lipSync.stop();
  }
} 