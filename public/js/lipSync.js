export class LipSync {
  constructor(live2DModel) {
    this.live2DModel = live2DModel;
  }

  async startSpeaking(audioUrl) {
    if (!this.live2DModel) return;

    try {
      // 完了を待つためのPromiseを作成
      const speakingComplete = new Promise((resolve, reject) => {
        this.live2DModel.speak(audioUrl, {
          volume: 1.0,
          expression: null,
          crossOrigin: "anonymous",
          onFinish: () => {
            console.log("音声再生完了");
            resolve();
          },
          onError: (err) => {
            console.error("エラー:", err);
            reject(err);
          }
        });
      });

      // 音声の再生完了まで待つ
      await speakingComplete;
    } catch (error) {
      console.error('音声の再生に失敗しました:', error);
      throw error;
    }
  }

  async stop() {
    if (this.live2DModel) {
      // リップシンクの停止
      await this.live2DModel.stopSpeaking();
      
      // 音声の停止
      if (this.live2DModel.audio) {
        await this.live2DModel.audio.pause();
        this.live2DModel.audio.currentTime = 0;
        this.live2DModel.audio = null;
      }
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