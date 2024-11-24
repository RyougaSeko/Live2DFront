import { useState } from 'react';
import './styles.css';

const Chat = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      setMessages([...messages, inputText]);
      setInputText('');
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className="message">
            {message}
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