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
    
    // Live2DControllerのインスタンス化を追加
    const controller = new Live2DController(model);
  
    // メッセージ受信のハンドラを追加
    window.addEventListener('message', async (event) => {
      if (event.data.type === 'SPEAK') {
        try {
          await controls.startTalking(event.data.text);
        } catch (error) {
          console.error('音声再生に失敗しました:', error);
        }
      } else if (event.data.type === 'SPEAK_WITH_AUDIO') {
        try {
          await controls.lipSync.startSpeaking(event.data.audioUrl);
        } catch (error) {
          console.error('音声再生に失敗しました:', error);
        }
      }
    });

  } catch (error) {
    console.error('初期化に失敗しました:', error);
  }
}

// DOMContentLoadedイベントで初期化を実行
document.addEventListener('DOMContentLoaded', initialize);

class Live2DController {
  constructor(model) {
    this.model = model;
    this.isWaving = false;
    this.isJumping = false;
    this.isAnimating = false;
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
      surprised: '😲',
      game: '🎮'
    };
    return emojis[emotion];
  }


  async changeEmotion(emotion) {
    try {
      console.log('表情を変更します:', emotion);
      await this.model.expression(emotion);
      
      // 表情に合わせたモーション
      const motions = {
        happy: 'tap_body',
        sad: 'pinch_in',
        angry: 'flick_head',
        surprised: 'pinch_out',
        game: 'game'  // ゲーム用モーション
      };
      
      if (motions[emotion]) {
        console.log('モーションを再生します:', motions[emotion]);
        await this.model.motion(motions[emotion]);
      }
    } catch (error) {
      console.error('表情の変更に失敗しました:', error);
      console.error('エラーの詳細:', {
        emotion: emotion,
        error: error.message
      });
    }
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

}

