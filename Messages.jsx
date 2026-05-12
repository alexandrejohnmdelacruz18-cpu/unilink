// src/pages/Messages.jsx
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { Search, Send, MessageSquare } from 'lucide-react';
import '../styles/AccountSettings.css'; // Make sure your new CSS is loaded!
import '../styles/Messages.css'; 
const Messages = ({ sidebarCollapsed, onToggleSidebar }) => {
  const { user } = useAuth();
  
  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Dummy messages for the UI (Replace with Supabase fetch later)
  const [messages, setMessages] = useState([
    { id: 1, sender_id: 'other', text: 'Hi! Is the item still available?', created_at: new Date().toISOString() },
    { id: 2, sender_id: 'me', text: 'Yes, it is! Are you on campus today?', created_at: new Date().toISOString() },
  ]);

  const chatEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeContact]);

  // Fetch real users from your profiles table to act as contacts
  useEffect(() => {
    const fetchContacts = async () => {
      if (!user) return;
      setLoading(true);
      
      // Fetching all profiles except the current user
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .neq('id', user.id)
        .limit(10); // Limit to 10 for UI purposes right now

      if (!error && data) {
        setContacts(data);
        if (data.length > 0) setActiveContact(data[0]); // Select first contact by default
      }
      setLoading(false);
    };

    fetchContacts();
  }, [user]);

  // LIVE SEARCH LOGIC
  const filteredContacts = contacts.filter(c => 
    (c.username || 'User').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Add new message to UI state instantly
    const newMessage = {
      id: Date.now(),
      sender_id: 'me',
      text: inputText,
      created_at: new Date().toISOString()
    };

    setMessages([...messages, newMessage]);
    setInputText('');
    
    // NOTE: Here is where you will add your Supabase INSERT query later
    // await supabase.from('messages').insert({...})
  };

  return (
    <div className="app-container">
      <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={onToggleSidebar} currentTab="messages" />
      
      <main className="main-content">
        <Topbar onToggleSidebar={onToggleSidebar} hideSearch={true} />

        <div style={{ padding: '0 20px', maxWidth: '1200px', margin: '0 auto', paddingBottom: '20px' }}>
          
          <div className="messages-layout">
            
            {/* LEFT PANEL: CONTACTS & SEARCH */}
            <div className="contacts-panel">
              <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>
                <h2 style={{ margin: '0 0 15px 0' }}>Messages</h2>
                <div className="search-container" style={{ position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input 
                    type="text" 
                    placeholder="Search conversations..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="form-input"
                    style={{ width: '100%', padding: '10px 15px 10px 40px', borderRadius: '8px' }}
                  />
                </div>
              </div>

              <div style={{ overflowY: 'auto', flex: 1 }}>
                {loading ? (
                  <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: '20px' }}>Loading contacts...</p>
                ) : filteredContacts.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: '20px' }}>No contacts found.</p>
                ) : (
                  filteredContacts.map(contact => (
                    <div 
                      key={contact.id} 
                      className={`contact-item ${activeContact?.id === contact.id ? 'active' : ''}`}
                      onClick={() => setActiveContact(contact)}
                    >
                      <img 
                        src={contact.avatar_url || "https://via.placeholder.com/40"} 
                        alt="avatar" 
                        style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover' }} 
                      />
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <h4 style={{ margin: '0 0 3px 0', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                          {contact.username || 'Unknown User'}
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.85rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                          Click to view messages...
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* RIGHT PANEL: CHAT INTERFACE */}
            {activeContact ? (
              <div className="chat-panel">
                
                {/* Chat Header */}
                <div className="chat-header">
                  <img 
                    src={activeContact.avatar_url || "https://via.placeholder.com/40"} 
                    alt="avatar" 
                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} 
                  />
                  <div>
                    <h3 style={{ margin: 0, color: 'inherit' }}>{activeContact.username || 'Unknown User'}</h3>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#10b981' }}>● Online</p>
                  </div>
                </div>

                {/* Chat History */}
                <div className="chat-history">
                  {messages.map((msg) => {
                    const isMe = msg.sender_id === 'me';
                    return (
                      <div key={msg.id} className={`message-bubble ${isMe ? 'message-sent' : 'message-received'}`}>
                        {msg.text}
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} /> {/* Invisible div to auto-scroll to bottom */}
                </div>

                {/* Chat Input (Make Offer Button Removed) */}
                <form onSubmit={handleSendMessage} className="chat-input-area">
                  <input 
                    type="text" 
                    className="form-input"
                    placeholder="Type your message..." 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    style={{ flex: 1, borderRadius: '24px', padding: '12px 20px' }}
                  />
                  <button 
                    type="submit" 
                    className="btn-save" 
                    style={{ borderRadius: '50%', width: '45px', height: '45px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    disabled={!inputText.trim()}
                  >
                    <Send size={18} />
                  </button>
                </form>

              </div>
            ) : (
              <div className="chat-panel" style={{ alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                <MessageSquare size={64} style={{ marginBottom: '20px', opacity: 0.5 }} />
                <h3>Select a conversation to start messaging</h3>
              </div>
            )}

          </div>

        </div>
      </main>
    </div>
  );
};

export default Messages;