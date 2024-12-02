import { useState } from 'react';
import DOMPurify from 'dompurify';
import { TTSService } from '../../services/TTSService';
import { Message } from '../../types/chat';
import './styles.css';
import ASR from '../ASR/index';

const ttsService = new TTSService();

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      try {
        const userMessage: Message = {
          text: inputText,
          sender: 'user',
          timestamp: new Date()
        };

        const aiMessage: Message = {
          text: inputText.includes('表') ? `
            <table border="1">
              <tr>
                <th>項目</th>
                <th>内容</th>
              </tr>
              <tr>
                <td>場所</td>
                <td>広野町役場</td>
              </tr>
              <tr>
                <td>営業時間</td>
                <td>8:30～17:15</td>
              </tr>
            </table>
          ` : `「${inputText}」というメッセージを受け取りました。`,
          sender: 'ai',
          timestamp: new Date(),
          isHtml: inputText.includes('票'),
          imageUrls: inputText.includes('広野町役場') ? [
            'https://www.town.hirono.fukushima.jp/_res/projects/default_project/_page_/001/002/284/floormap_1.jpg',
            'https://www.town.hirono.fukushima.jp/_res/projects/default_project/_page_/001/002/284/floormap_2.jpg',
            'https://www.town.hirono.fukushima.jp/_res/projects/default_project/_page_/001/002/284/floormap_3.jpg'
          ] : undefined
        };

        const ttsText = aiMessage.isHtml ? 
          aiMessage.text.replace(/<[^>]*>/g, '') : 
          aiMessage.text;

        const audioUrl = await ttsService.generateSpeech(ttsText, {
          lang: 'ja',
          spk_id: 'female_tsukuyomi',
          output_format: 'mp3',
          stream: false
        });

        const live2dIframe = document.querySelector('.live2d-iframe') as HTMLIFrameElement;
        if (live2dIframe && live2dIframe.contentWindow) {
          live2dIframe.contentWindow.postMessage({
            type: 'SPEAK',
            audioUrl: audioUrl,
            text: ttsText
          }, '*');
        }

        setMessages([...messages, userMessage, aiMessage]);
        setInputText('');
      } catch (error) {
        console.error('音声生成に失敗しました:', error);
      }
    }
  };

  const renderMessageContent = (message: Message) => {
    if (message.isHtml) {
      return (
        <div 
          className="message-text"
          dangerouslySetInnerHTML={{ 
            __html: DOMPurify.sanitize(message.text) 
          }} 
        />
      );
    }
    return <div className="message-text">{message.text}</div>;
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
              {renderMessageContent(message)}
              {message.imageUrls && message.imageUrls.length > 0 && (
                <div className="message-images-container">
                  <div className="message-images">
                    {message.imageUrls.map((url, imgIndex) => (
                      <div key={imgIndex} className="message-image">
                        <img 
                          src={url} 
                          alt={`AI generated ${imgIndex + 1}`}
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
        <ASR onTranscriptionComplete={(text) => {
          setInputText((prevText) => {
            if (prevText === '') {
              return text;
            } else {
              return `${prevText} ${text}`;
            }
          });
        }} />
      </form>
    </div>
  );
};

export default Chat; 