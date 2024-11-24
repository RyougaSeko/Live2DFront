export class TTSService {
  constructor() {
    this.baseUrl = 'https://tts-api.parakeet-inc.com/v1';
    this.apiKey = 'sk-1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLM'; // 実際のAPIキーに置き換えてください
  }

  async generateSpeech(text, options = {}) {
    try {
      const defaultOptions = {
        lang: 'ja',
        spk_id: 'female_tsukuyomi',
        output_format: 'mp3',
        stream: false,
        device: 'cuda'
      };

      const requestBody = {
        text,
        ...defaultOptions,
        ...options
      };

      const response = await fetch(`${this.baseUrl}/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'accept': 'audio/mp3'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(`HTTP error! status: ${response.status}, details: ${JSON.stringify(errorData)}`);
      }

      // レスポンスをBlobとして取得
      const audioBlob = await response.blob();
      return URL.createObjectURL(audioBlob);
    } catch (error) {
      console.error('TTS生成に失敗しました:', error);
      throw error;
    }
  }

  // 話者IDの一覧を取得
  getSpeakerIds() {
    return [
      'female_tsukuyomi',
      'female_014',
      'female_019',
      'female_024',
      'female_030',
      'female_039',
      'female_062',
      'female_067',
      'female_085',
      'female_094',
      'male_001',
      'male_009',
      'male_032'
    ];
  }
} 