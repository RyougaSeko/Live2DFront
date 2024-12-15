export class Live2DModel {
  constructor() {
    this.model = null;
    this.app = null;
    this.defaultScale = 0.15;
    this.defaultYOffset = 0;
  }

  async initialize(canvas) {
    this.app = new PIXI.Application({
      view: canvas,
      transparent: true,
      autoStart: true,
      width: window.innerWidth,
      height: window.innerHeight,
      resizeTo: window,
      antialias: true,
      autoDensity: true,
      resolution: window.devicePixelRatio || 1,
      backgroundAlpha: 0
    });

    await this.loadModel();
    this.setupEventListeners();
  }

  async loadModel() {
    try {
      const modelPath = '/models/hirobo/hirobo.model3.json';
      console.log('モデルの読み込みを開始します:', modelPath);
      
      this.model = await PIXI.live2d.Live2DModel.from(modelPath, {
        autoUpdate: true,
        motionPreload: "ALL",
        idleMotionPriority: 1
      });
      
      console.log('モデルのロード完了:', {
        scale: this.defaultScale,
        position: {
          x: this.app.screen.width / 2,
          y: this.app.screen.height / 2 + this.defaultYOffset
        }
      });

      this.model.scale.set(this.defaultScale);
      this.model.anchor.set(0.5, 0.5);
      this.setDefaultPosition();
      
      this.app.stage.addChild(this.model);
      
      this.model.on('hit', (hitAreas) => {
        console.log('Hit areas:', hitAreas);
      });

      return this.model;
    } catch (error) {
      console.error('モデルの読み込みに失敗しました:', error);
      throw error;
    }
  }

  setDefaultPosition() {
    if (this.model && this.app) {
      this.model.position.set(
        this.app.screen.width / 2,
        this.app.screen.height / 2 + this.defaultYOffset
      );
    }
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.setDefaultPosition());
  }

  getModel() {
    return this.model;
  }
} 