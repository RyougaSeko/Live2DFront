export class TTSService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = 'http://tts-parakeet.westus2.cloudapp.azure.com/v1';
    this.apiKey = 'sk-1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLM'; // 実際のAPIキーに置き換えてください
  }

  async generateSpeech(text: string, options: any = {}) {
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
          'accept': 'audio/mp3',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(`HTTP error! status: ${response.status}, details: ${JSON.stringify(errorData)}`);
      }

      const audioBlob = await response.blob();
      return URL.createObjectURL(audioBlob);
    } catch (error) {
      console.error('TTS生成に失敗しました:', error);
      throw error;
    }
  }

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