// src/components/Sidebar.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { 
  Home, MessageSquare, PlusSquare, Heart, 
  User, Settings, Target, Award, Flag, LogOut,
  ChevronDown, ShoppingBag, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import '../styles/Sidebar.css';

// Added onToggleCollapse to the props
const Sidebar = ({ currentTab, collapsed, onToggleCollapse }) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  
  // Controls the accordion state of the Profile tab
  // Automatically open the dropdown if the current tab is one of the sub-pages
  const [isProfileOpen, setIsProfileOpen] = useState(
    ['profile', 'quests', 'achievements', 'settings'].includes(currentTab)
  );

  // Add this right below your other states:
  const [showLogoutModal, setShowLogoutModal] = useState(false);

// Replace your old handleLogout with this:
  const handleConfirmLogout = async () => {
    setShowLogoutModal(false); // Hide the modal
    await signOut(); // Destroy the session
    navigate('/login'); // Kick them to the login screen
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      
      {/* --- ADDED COLLAPSE BUTTON & ADJUSTED HEADER --- */}
      <div className="sidebar-logo-container" style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', padding: '20px' }}>
        {!collapsed && (
          <h2 className="sidebar-logo" style={{ margin: 0, color: '#610C9F', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '24px' }}>🌐</span> UniLink
          </h2>
        )}
        <button 
          onClick={onToggleCollapse} 
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
        >
          {collapsed ? <PanelLeftOpen size={24} /> : <PanelLeftClose size={24} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        
        {/* 1. Main Actions */}
        <button className={`sidebar-item ${currentTab === 'home' ? 'active' : ''}`} onClick={() => navigate('/')}>
          <Home size={22} />
          {!collapsed && <span>Home</span>}
        </button>

        <button className={`sidebar-item ${currentTab === 'messages' ? 'active' : ''}`} onClick={() => navigate('/messages')}>
          <MessageSquare size={22} />
          {!collapsed && <span>Messages</span>}
        </button>

        <button className={`sidebar-item ${currentTab === 'post' ? 'active' : ''}`} onClick={() => navigate('/post')}>
          <PlusSquare size={22} />
          {!collapsed && <span>Post Listing</span>}
        </button>

        <button className={`sidebar-item ${currentTab === 'favorites' ? 'active' : ''}`} onClick={() => navigate('/favorites')}>
          <Heart size={22} />
          {!collapsed && <span>Favorites</span>}
        </button>

        <button className={`sidebar-item ${currentTab === 'transactions' ? 'active' : ''}`} onClick={() => navigate('/transactions')}>
          <ShoppingBag size={22} />
          {!collapsed && <span>Transactions</span>}
        </button>

        {/* --- REMOVED THE DUPLICATE DIVIDER --- */}
        <div className="sidebar-divider" style={{ borderBottom: '1px solid #e2e8f0', margin: '15px 0' }}></div>

        {/* 2. Personal & Gamification (Accordion) */}
        <div className="sidebar-dropdown-group">
          <button 
            className={`sidebar-item ${['profile', 'quests', 'achievements', 'settings'].includes(currentTab) ? 'active' : ''}`} 
            onClick={() => {
              if (collapsed) return; 
              setIsProfileOpen(!isProfileOpen); // Fixed toggle logic
            }}
          >
            <User size={22} />
            {!collapsed && (
              <>
                <span style={{ flex: 1, textAlign: 'left' }}>Profile</span>
                <ChevronDown size={18} className={`chevron-icon ${isProfileOpen ? 'open' : ''}`} style={{ transform: isProfileOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
              </>
            )}
          </button>

          {/* Render Subtabs ONLY if profile is open and sidebar is NOT collapsed */}
          {isProfileOpen && !collapsed && (
            <div className="sidebar-sub-menu">
              <button className={`sidebar-sub-item ${currentTab === 'quests' ? 'active' : ''}`} onClick={() => navigate('/quests')}>
                <Target size={16} /> Quests
              </button>
              
              <button className={`sidebar-sub-item ${currentTab === 'achievements' ? 'active' : ''}`} onClick={() => navigate('/achievements')}>
                <Award size={16} /> Achievements
              </button>
              
              <button className={`sidebar-sub-item ${currentTab === 'settings' ? 'active' : ''}`} onClick={() => navigate('/settings')}>
                <Settings size={16} /> Account Settings
              </button>
            </div>
          )}
        </div>

      </nav>

      {/* Added marginTop: 'auto' so it stays at the bottom when scrolling */}
      <div className="sidebar-footer" style={{ marginTop: 'auto', padding: '20px' }}>
        {/* Change onClick to setShowLogoutModal(true) */}
        <button className="sidebar-item logout-btn" onClick={() => setShowLogoutModal(true)} style={{ color: '#ef4444' }}>
          <LogOut size={22} />
          {!collapsed && <span>Log Out</span>}
        </button>
      </div>
    {/* --- LOGOUT CONFIRMATION MODAL --- */}
      {showLogoutModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          
          {/* Using section-card ensures it matches your True Black dark mode perfectly! */}
          <div className="section-card" style={{ maxWidth: '350px', width: '90%', textAlign: 'center', padding: '30px', margin: '0 20px' }}>
            
            <h2 style={{ marginTop: 0, marginBottom: '10px' }}>Log Out?</h2>
            <p style={{ color: '#64748b', marginBottom: '25px' }}>Are you sure you want to log out of UniLink?</p>
            
            <div style={{ display: 'flex', gap: '15px' }}>
              <button 
                className="btn-save" 
                onClick={() => setShowLogoutModal(false)} 
                style={{ flex: 1, background: 'transparent', color: '#94a3b8', border: '1px solid #475569' }}
              >
                Cancel
              </button>
              
              <button 
                className="btn-save" 
                onClick={handleConfirmLogout} 
                style={{ flex: 1, background: '#ef4444', color: 'white', border: 'none' }}
              >
                Yes, Log Out
              </button>
            </div>
            
          </div>
        </div>
      )}

    </aside> // <-- This is your existing closing tag
  );
};

export default Sidebar;