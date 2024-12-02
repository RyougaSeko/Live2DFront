import { useState } from 'react';
import { TTSService } from '../../services/TTSService';
import { Message } from '../../types/chat';
import './styles.css';

const ttsService = new TTSService();

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      try {
        // ユーザーメッセージを追加
        const userMessage: Message = {
          text: inputText,
          sender: 'user',
          timestamp: new Date()
        };

        // AIの応答メッセージ（仮）
        const aiMessage: Message = {
          text: `「${inputText}」というメッセージを受け取りました。`,
          sender: 'ai',
          timestamp: new Date()
        };

        // TTSで音声を生成
        const audioUrl = await ttsService.generateSpeech(aiMessage.text, {
          lang: 'ja',
          spk_id: 'female_tsukuyomi',
          output_format: 'mp3',
          stream: false
        });

        // Live2Dモデルに音声を送信
        const live2dIframe = document.querySelector('.live2d-iframe') as HTMLIFrameElement;
        if (live2dIframe && live2dIframe.contentWindow) {
          live2dIframe.contentWindow.postMessage({
            type: 'SPEAK',
            audioUrl: audioUrl,
            text: aiMessage.text
          }, '*');
        }

        setMessages([...messages, userMessage, aiMessage]);
        setInputText('');
      } catch (error) {
        console.error('音声生成に失敗しました:', error);
      }
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.sender === 'user' ? 'user-message' : 'ai-message'}`}
          >
            <div className="message-content">
              {message.text}
            </div>
            <div className="message-timestamp">
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="chat-input-form">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="メッセージを入力..."
          className="chat-input"
        />
        <button type="submit" className="chat-submit">送信</button>
      </form>
    </div>
  );
};

export default Chat; 