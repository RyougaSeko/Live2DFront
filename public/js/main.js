import { Live2DModel } from './model.js';
import { ModelControls } from './controls.js';

window.PIXI = PIXI;

async function initialize() {
  try {
    const live2dModel = new Live2DModel();
    await live2dModel.initialize(document.getElementById('canvas'));
    
    const model = live2dModel.getModel();
    if (model) {
      new ModelControls(model);
    }
  } catch (error) {
    console.error('初期化に失敗しました:', error);
  }
}

initialize(); 