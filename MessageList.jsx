// src/components/MessageList.jsx
import React from 'react';

const MessageList = ({ clients, selected, onSelect }) => {
  return (
    <div className="conversations-sidebar">
      <div className="conversations-header">
        <h2>Messages</h2>
        <input type="text" className="search-input" placeholder="Search conversations..." />
      </div>
      
      <div className="conversations-list">
        {clients.length === 0 ? (
          <p style={{textAlign: 'center', color: '#94a3b8', marginTop: '20px'}}>No conversations found.</p>
        ) : (
          clients.map((client, index) => (
            <div 
              key={client.id} 
              onClick={() => onSelect(index)}
              style={{
                display: 'flex', 
                alignItems: 'center', 
                padding: '15px', 
                cursor: 'pointer',
                backgroundColor: selected === index ? '#e2e8f0' : 'transparent',
                borderBottom: '1px solid #f1f5f9'
              }}
            >
              <img src={client.avatar} alt={client.name} style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '15px' }} />
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 5px 0', fontSize: '1rem', color: '#1e293b' }}>{client.name}</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>
                  {client.message}
                </p>
              </div>
              {client.unread > 0 && (
                <span style={{ backgroundColor: '#ef4444', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                  {client.unread}
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MessageList;