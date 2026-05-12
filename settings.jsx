import React, { useState, useEffect } from 'react';
import { User, Shield, Moon, CreditCard, Bell, LogOut, Globe } from 'lucide-react';
import './Settings.css'; // Ensure you create this CSS file

const Settings = ({ onClose, onLogout }) => {
  // State for active tab
  const [activeTab, setActiveTab] = useState('Theme');

  // State for form inputs
  const [contactNumber, setContactNumber] = useState('+63 912 345 6789');
  const [paymentMethod, setPaymentMethod] = useState('Gcash');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Apply Dark Mode class to the body when toggled
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode-active');
    } else {
      document.body.classList.remove('dark-mode-active');
    }
  }, [isDarkMode]);

  const handleSave = (e) => {
    e.preventDefault();
    alert(`Settings saved successfully!`);
  };

  const handleLogout = () => {
    const confirm = window.confirm("Are you sure you want to log out?");
    if (confirm && onLogout) {
      onLogout();
    }
  };

  return (
    <div className="settings-overlay">
      <div className="settings-modal">
        {/* Sidebar Navigation */}
        <div className="settings-sidebar">
          <h2 className="settings-title">Settings</h2>
          <nav className="settings-nav">
            <button className={`nav-btn ${activeTab === 'Personal' ? 'active' : ''}`} onClick={() => setActiveTab('Personal')}>
              <User size={18} /> Personal Information
            </button>
            <button className={`nav-btn ${activeTab === 'Security' ? 'active' : ''}`} onClick={() => setActiveTab('Security')}>
              <Shield size={18} /> Security
            </button>
            <button className={`nav-btn ${activeTab === 'Theme' ? 'active' : ''}`} onClick={() => setActiveTab('Theme')}>
              <Moon size={18} /> Theme
            </button>
            <button className={`nav-btn ${activeTab === 'Payment' ? 'active' : ''}`} onClick={() => setActiveTab('Payment')}>
              <CreditCard size={18} /> Payment Methods
            </button>
            <button className={`nav-btn ${activeTab === 'Notifications' ? 'active' : ''}`} onClick={() => setActiveTab('Notifications')}>
              <Bell size={18} /> Notifications
            </button>
          </nav>
          
          <div className="sidebar-footer">
            <button className="nav-btn logout-btn" onClick={handleLogout}>
              <LogOut size={18} /> Log Out
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="settings-content">
          <button className="close-btn" onClick={onClose}>×</button>

          {/* TAB: Personal Information */}
          {activeTab === 'Personal' && (
            <div className="tab-pane">
              <h3>Personal Information</h3>
              <p className="tab-desc">Update your contact details and profile information.</p>
              <form onSubmit={handleSave} className="settings-form">
                <div className="form-group">
                  <label>Contact Number</label>
                  <input 
                    type="tel" 
                    value={contactNumber} 
                    onChange={(e) => setContactNumber(e.target.value)} 
                    placeholder="Enter phone number"
                  />
                </div>
                <button type="submit" className="save-settings-btn">Save Changes</button>
              </form>
            </div>
          )}

          {/* TAB: Theme */}
          {activeTab === 'Theme' && (
            <div className="tab-pane">
              <h3>Theme Preferences</h3>
              <p className="tab-desc">Customize the appearance of UniLink on your device.</p>
              
              <div className="setting-card">
                <div className="setting-info">
                  <h4>Dark Mode</h4>
                  <span>Switch between light and dark themes.</span>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={isDarkMode} 
                    onChange={() => setIsDarkMode(!isDarkMode)} 
                  />
                  <span className="slider round"></span>
                </label>
              </div>

              <div className="setting-card">
                <div className="setting-info">
                  <h4>Language</h4>
                  <span>Select your preferred language.</span>
                </div>
                <div className="select-wrapper">
                  <Globe size={16} />
                  <select defaultValue="English (US)">
                    <option>English (US)</option>
                    <option>Tagalog</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Payment Methods */}
          {activeTab === 'Payment' && (
            <div className="tab-pane">
              <h3>Payment Methods</h3>
              <p className="tab-desc">Manage how you receive or send money for trades.</p>
              <form onSubmit={handleSave} className="settings-form">
                <div className="form-group">
                  <label>Primary Payment Method</label>
                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                    <option value="Gcash">GCash</option>
                    <option value="Maya">Maya</option>
                    <option value="Cash on Meetup">Cash on Meetup</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
                <button type="submit" className="save-settings-btn">Update Payment Info</button>
              </form>
            </div>
          )}

          {/* Placeholders for other tabs */}
          {(activeTab === 'Security' || activeTab === 'Notifications') && (
            <div className="tab-pane">
              <h3>{activeTab}</h3>
              <p className="tab-desc">This section is currently under construction.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;