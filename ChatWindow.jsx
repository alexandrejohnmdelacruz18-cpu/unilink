// src/components/ChatWindow.jsx
import React, { useState } from 'react';

const ChatWindow = ({ conversation, messages, onSend }) => {
  const [inputText, setInputText] = useState('');

  const handleSendClick = () => {
    if (!inputText.trim()) return;
    onSend({ text: inputText });
    setInputText('');
  };

  if (!conversation) return <div className="chat-window" style={{ justifyContent: 'center', alignItems: 'center', color: '#94a3b8' }}>Select a conversation to start chatting</div>;

  return (
    <div className="chat-window">
      {/* Header */}
      <div className="chat-header">
        <img src={conversation.avatar} alt={conversation.name} className="chat-avatar" />
        <h3 style={{ margin: 0, color: '#1e293b' }}>{conversation.name}</h3>
      </div>
      
      {/* Messages Area */}
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message-bubble ${msg.outgoing ? 'sent' : 'received'}`}>
            {msg.text}
          </div>
        ))}
      </div>
      
      {/* Input Area */}
      <div className="chat-input-area">
        <button className="action-btn offer-btn">🤝 Make Offer</button>
        <input 
          type="text" 
          className="message-input" 
          placeholder="Type your message..." 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendClick()}
        />
        <button className="action-btn send-btn" onClick={handleSendClick}>Send</button>
      </div>
    </div>
  );
};

export default ChatWindow;