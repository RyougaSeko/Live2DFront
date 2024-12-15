export async function loadLive2DModel(app) {
  try {
    const modelPath = '/models/hirobo/hirobo.model3.json';
    console.log('モデルの読み込みを開始します:', modelPath);
    
    const model = await PIXI.live2d.Live2DModel.from(modelPath, {
      autoUpdate: true,
      motionPreload: "ALL",
      idleMotionPriority: 1,
      expressionPreload: true
    });

    console.log('モデルの読み込みが完了しました:', model);
    console.log('利用可能な表情:', model.expressions);
    console.log('利用可能なモーション:', model.motions);

    const scale = 0.1;
    model.scale.set(scale);
    model.anchor.set(0.5, 0.5);
    model.position.set(app.screen.width / 2, app.screen.height / 2 + 400);
    
    app.stage.addChild(model);
    return model;
  } catch (error) {
    console.error('モデルの読み込みに失敗しました:', error);
    console.error('エラーの詳細:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return null;
  }
} 