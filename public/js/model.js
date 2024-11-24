export class Live2DModel {
  constructor() {
    this.model = null;
    this.app = null;
    this.defaultScale = 0.35;
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
      resolution: window.devicePixelRatio || 1
    });

    await this.loadModel();
    this.setupEventListeners();
  }

  async loadModel() {
    try {
      const modelPath = 'https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/assets/haru/haru_greeter_t03.model3.json';
      this.model = await PIXI.live2d.Live2DModel.from(modelPath, {
        autoUpdate: true,
        motionPreload: "ALL",
        idleMotionPriority: 1
      });
      
      this.model.scale.set(this.defaultScale);
      this.model.anchor.set(0.5, 0.5);
      this.updatePosition();
      
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

  updatePosition() {
    if (this.model && this.app) {
      this.model.position.set(
        this.app.screen.width / 2,
        (this.app.screen.height / 2) + 100
      );
    }
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.updatePosition());
  }

  getModel() {
    return this.model;
  }
} 