import { Live2DModel } from './model.js';
import { ModelControls } from './controls.js';

window.PIXI = PIXI;

async function initialize() {
  try {
    const live2dModel = new Live2DModel();
    await live2dModel.initialize(document.getElementById('canvas'));
    
    const model = live2dModel.getModel();
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

initialize(); 