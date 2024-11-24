import { Live2DModel } from './model.js';
import { ModelControls } from './controls.js';

window.PIXI = PIXI;

let model;

async function initialize() {
  try {
    const live2dModel = new Live2DModel();
    await live2dModel.initialize(document.getElementById('canvas'));
    
    model = live2dModel.getModel();
    const controls = new ModelControls(model);

    // メッセージ受信のハンドラを追加
    window.addEventListener('message', async (event) => {
      if (event.data.type === 'SPEAK') {
        try {
          await controls.startTalking(event.data.text);
        } catch (error) {
          console.error('音声再生に失敗しました:', error);
        }
      }
    });

  } catch (error) {
    console.error('初期化に失敗しました:', error);
  }
}

class Live2DController {
  constructor(model) {
    this.model = model;
    this.isWaving = false;
    this.isJumping = false;
    this.setupInteractions();
    this.setupEmotions();
  }


  setupInteractions() {
    // モデルをクリックした時のランダムモーション
    this.model.on('click', async (event) => {
      const motions = ['tap_body', 'flick_head', 'pinch_in', 'pinch_out'];
      const randomMotion = motions[Math.floor(Math.random() * motions.length)];
      await this.model.motion(randomMotion);
    });

    // マウスが近づいたら目で追従
    this.model.on('mousemove', (event) => {
      const { x, y } = event.data.global;
      const tx = (x / window.innerWidth) * 30 - 15;
      const ty = (y / window.innerHeight) * 30 - 15;
      this.model.focus(tx, ty);
    });

    // ダブルクリックで手を振る
    this.model.on('dblclick', async () => {
      if (!this.isWaving) {
        this.isWaving = true;
        await this.wave();
        this.isWaving = false;
      }
    });

    // スペースキーでジャンプ
    document.addEventListener('keydown', async (event) => {
      if (event.code === 'Space' && !this.isJumping) {
        this.isJumping = true;
        await this.jump();
        this.isJumping = false;
      }
    });
  }


  setupEmotions() {
    // 表情切り替えボタンを追加
    const emotions = ['happy', 'sad', 'angry', 'surprised'];
    const emotionContainer = document.createElement('div');
    emotionContainer.className = 'emotion-buttons';
    
    emotions.forEach(emotion => {
      const button = document.createElement('button');
      button.textContent = this.getEmotionEmoji(emotion);
      button.onclick = () => this.changeEmotion(emotion);
      emotionContainer.appendChild(button);
    });
    
    document.body.appendChild(emotionContainer);
  }


  async wave() {
    const duration = 2000;
    const startY = this.model.position.y;
    
    // 手を振るモーション
    await this.model.motion('wave');
    
    // 少し体を揺らす
    const swing = async () => {
      await this.model.focus(5, 0);
      await this.model.focus(-5, 0);
    };
    
    for (let i = 0; i < 3; i++) {
      await swing();
    }
    
    await this.model.focus(0, 0);
  }


  async jump() {
    const jumpHeight = 50;
    const duration = 500;
    const startY = this.model.position.y;
    
    // ジャンプのアニメーション
    await new Promise(resolve => {
      gsap.to(this.model.position, {
        y: startY - jumpHeight,
        duration: duration / 2000,
        ease: 'power1.out',
        yoyo: true,
        repeat: 1,
        onComplete: resolve
      });
    });
    
    // 着地時の表情変更
    await this.model.expression('happy');
  }


  getEmotionEmoji(emotion) {
    const emojis = {
      happy: '😊',
      sad: '😢',
      angry: '😠',
      surprised: '😲'
    };
    return emojis[emotion];
  }


  async changeEmotion(emotion) {
    await this.model.expression(emotion);
    
    // 表情に合わせたモーション
    const motions = {
      happy: 'tap_body',
      sad: 'pinch_in',
      angry: 'flick_head',
      surprised: 'pinch_out'
    };
    
    if (motions[emotion]) {
      await this.model.motion(motions[emotion]);
    }
  }


  async playRandomAnimation() {
    const animations = [
      this.playIdleAnimation,
      this.playGreetingAnimation,
      this.playJumpAnimation,
      this.playDanceAnimation
    ];
    
    const randomAnimation = animations[Math.floor(Math.random() * animations.length)];
    await randomAnimation.call(this);
  }


  async playIdleAnimation() {
    const motions = ['idle', 'tap_body'];
    const randomMotion = motions[Math.floor(Math.random() * motions.length)];
    await this.model.motion(randomMotion);
  }


  async playGreetingAnimation() {
    // 表情を変更
    await this.model.expression('happy');
    
    // 手を振るモーション
    await this.model.motion('wave');
    
    // 体を少し揺らす
    const timeline = gsap.timeline();
    timeline.to(this.model.position, {
      x: '+=20',
      duration: 0.5,
      ease: 'power1.inOut',
      yoyo: true,
      repeat: 1
    });
  }


  async playJumpAnimation() {
    const jumpHeight = 50;
    const timeline = gsap.timeline();
    
    // ジャンプ前の準備モーション
    await this.model.motion('tap_body');
    
    // ジャンプのアニメーション
    timeline.to(this.model.position, {
      y: `-=${jumpHeight}`,
      duration: 0.4,
      ease: 'power2.out'
    }).to(this.model.position, {
      y: `+=${jumpHeight}`,
      duration: 0.4,
      ease: 'bounce.out'
    });
    
    // 着地後の表情変更
    await this.model.expression('happy');
  }


  async playDanceAnimation() {
    const timeline = gsap.timeline();
    
    // ダンスの表情設定
    await this.model.expression('happy');
    
    // ダンスモーション
    timeline.to(this.model.position, {
      x: '+=30',
      y: '-=20',
      duration: 0.5,
      ease: 'power1.inOut',
      yoyo: true,
      repeat: 3
    });
    
    // 体の回転
    timeline.to(this.model, {
      rotation: Math.PI * 0.1,
      duration: 0.5,
      yoyo: true,
      repeat: 3,
      ease: 'power1.inOut'
    });
  }
}

class Live2DAnimator {
  constructor(model) {
    this.model = model;
    this.isAnimating = false;
    this.setupAnimations();
  }


  setupAnimations() {
    // アニメーションボタンを追加
    const animContainer = document.createElement('div');
    animContainer.className = 'animation-buttons';
    
    const animations = [
      { name: 'bounce', icon: '🦘', label: 'バウンス' },
      { name: 'spin', icon: '🌀', label: 'スピン' },
      { name: 'dance', icon: '💃', label: 'ダンス' },
      { name: 'shake', icon: '🌋', label: '震える' }
    ];
    
    animations.forEach(anim => {
      const button = document.createElement('button');
      button.innerHTML = `${anim.icon}<span>${anim.label}</span>`;
      button.onclick = () => this.playAnimation(anim.name);
      animContainer.appendChild(button);
    });
    
    document.body.appendChild(animContainer);
  }


  async playAnimation(type) {
    if (this.isAnimating) return;
    this.isAnimating = true;

    switch(type) {
      case 'bounce':
        await this.playBounceAnimation();
        break;
      case 'spin':
        await this.playSpinAnimation();
        break;
      case 'dance':
        await this.playDanceAnimation();
        break;
      case 'shake':
        await this.playShakeAnimation();
        break;
    }

    this.isAnimating = false;
  }


  async playBounceAnimation() {
    const timeline = gsap.timeline();
    
    timeline.to(this.model.position, {
      y: '-=100',
      duration: 0.5,
      ease: 'power2.out'
    }).to(this.model.position, {
      y: '+=100',
      duration: 0.5,
      ease: 'bounce.out'
    });

    // 表情も変更
    await this.model.expression('happy');
    
    return timeline.play();
  }


  async playSpinAnimation() {
    const timeline = gsap.timeline();
    const originalScale = this.model.scale.x;
    
    // スピン中は少し縮小
    timeline.to(this.model.scale, {
      x: originalScale * 0.8,
      y: originalScale * 0.8,
      duration: 0.3
    }).to(this.model, {
      rotation: Math.PI * 2,
      duration: 1,
      ease: 'power1.inOut'
    }).to(this.model.scale, {
      x: originalScale,
      y: originalScale,
      duration: 0.3
    });

    // 回転後は驚いた表情に
    await this.model.expression('surprised');
    
    return timeline.play();
  }


  async playDanceAnimation() {
    const timeline = gsap.timeline({ repeat: 2 });
    const moveDistance = 50;
    
    timeline.to(this.model.position, {
      x: '+='+moveDistance,
      y: '-=20',
      duration: 0.25,
      ease: 'power1.inOut'
    }).to(this.model.position, {
      x: '-='+moveDistance,
      y: '-=20',
      duration: 0.25,
      ease: 'power1.inOut'
    }).to(this.model.position, {
      x: '-='+moveDistance,
      y: '+=20',
      duration: 0.25,
      ease: 'power1.inOut'
    }).to(this.model.position, {
      x: '+='+moveDistance,
      y: '+=20',
      duration: 0.25,
      ease: 'power1.inOut'
    });

    // ダンス中はハッピー表情
    await this.model.expression('happy');
    
    return timeline.play();
  }


  async playShakeAnimation() {
    const timeline = gsap.timeline();
    const shakeStrength = 5;
    
    timeline.to(this.model.position, {
      x: `+=${shakeStrength}`,
      duration: 0.1,
      repeat: 5,
      yoyo: true,
      ease: 'none'
    });

    // 震える時は驚いた表情
    await this.model.expression('surprised');
    
    return timeline.play();
  }
}

await initialize();
// モデルの読み込み後にコントローラーを初期化
model.on('load', () => {
  const controller = new Live2DController(model);
});

// モデルの読み込み後にアニメーターを初期化
model.on('load', () => {
  const animator = new Live2DAnimator(model);
});

// ランダムな間隔でアニメーションを再生
setInterval(() => {
  if (!this.isAnimating) {
    this.playRandomAnimation();
  }
}, 10000); // 10秒ごと

