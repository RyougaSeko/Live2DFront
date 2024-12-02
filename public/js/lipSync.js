export class LipSync {
  constructor(live2DModel) {
    this.live2DModel = live2DModel;
  }

  async startSpeaking(audioUrl) {
    if (!this.live2DModel) return;

    try {
      await this.live2DModel.speak(audioUrl, {
        volume: 1.0,
        expression: null,
        crossOrigin: "anonymous",
        onFinish: () => {
          console.log("音声再生完了");
        },
        onError: (err) => {
          console.error("エラー:", err);
          throw err;
        }
      });
    } catch (error) {
      console.error('音声の再生に失敗しました:', error);
      throw error;
    }
  }

  stop() {
    if (this.live2DModel) {
      this.live2DModel.stopSpeaking();
    }
  }

  updateMouthOpenness(value) {
    if (this.live2DModel) {
      // Live2Dモデルのパラメータを更新
      const parameters = [
        'ParamMouthOpenY',
        'ParamMouthForm'
      ];
      
      parameters.forEach(param => {
        if (this.live2DModel.internalModel.coreModel.getParameterIndex(param) !== -1) {
          this.live2DModel.internalModel.setParameterValueById(param, value);
        }
      });
    }
  }
} 