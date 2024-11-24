export async function loadLive2DModel(app) {
  try {
    const modelPath = 'https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/assets/haru/haru_greeter_t03.model3.json';
    
    const model = await PIXI.live2d.Live2DModel.from(modelPath, {
      autoUpdate: true,
      motionPreload: "ALL",
      idleMotionPriority: 1,
      expressionPreload: true
    });

    const scale = 0.35;
    model.scale.set(scale);
    model.anchor.set(0.5, 0.5);
    model.position.set(app.screen.width / 2, app.screen.height / 2 + 400);
    
    app.stage.addChild(model);
    return model;
  } catch (error) {
    console.error('モデルの読み込みに失敗しました:', error);
    return null;
  }
} 