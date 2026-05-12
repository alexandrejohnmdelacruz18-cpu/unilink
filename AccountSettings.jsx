// src/pages/AccountSettings.jsx
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext';
import { 
  CheckCircle, AlertCircle, GraduationCap, 
  Save, User as UserIcon, Camera, Moon, Sun, Mail 
} from 'lucide-react';
import '../styles/AccountSettings.css'; 

const AccountSettings = ({ sidebarCollapsed, onToggleSidebar }) => {
  const { user } = useAuth();
  
  // Basic Profile States
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Academic Form States
  const [institution, setInstitution] = useState('');
  const [campus, setCampus] = useState('');
  const [college, setCollege] = useState('');
  const [department, setDepartment] = useState('');
  const [yearLevel, setYearLevel] = useState('');

  // UI States
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // API State
  const [validInstitutions, setValidInstitutions] = useState([]);

  useEffect(() => {
    // 1. Fetch valid Philippine Universities
    const fetchInstitutions = async () => {
      try {
        const response = await fetch('https://raw.githubusercontent.com/RollyPdev/suc-hei-philippines-schools-api/main/data.json'); 
        if (response.ok) {
          const data = await response.json();
          const names = data.map(school => school.name || school.institution_name);
          setValidInstitutions(names);
        }
      } catch (error) {
        console.error("Failed to fetch official institution list:", error);
      }
    };
    fetchInstitutions();

    // 2. Fetch all user profile data (Basic + Academic)
    const fetchProfile = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (data) {
        // Restored Basic Details
        setUsername(data.username || '');
        setAvatarUrl(data.avatar_url || '');
        setIsDarkMode(data.dark_mode || false);
        
        // Academic Details
        setInstitution(data.institution || '');
        setCampus(data.campus || '');
        setCollege(data.college || '');
        setDepartment(data.department || '');
        setYearLevel(data.year_level || '');
      }
    };
    fetchProfile();
  }, [user]);

  // --- RESTORED: Profile Picture Upload ---
  const handleAvatarUpload = async (event) => {
    try {
      setUploadingImage(true);
      if (!event.target.files || event.target.files.length === 0) return;
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars') // Make sure you have an 'avatars' bucket in Supabase!
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setAvatarUrl(publicUrlData.publicUrl);
      
    } catch (error) {
      alert('Error uploading image: ' + error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  // --- THE MASTER SAVE FUNCTION ---
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    
    // API VALIDATION CHECK FOR INSTITUTION
    if (validInstitutions.length > 0 && institution.trim() !== '') {
      const isValid = validInstitutions.some(name => name.toLowerCase() === institution.trim().toLowerCase());
      if (!isValid) {
        setErrorMessage(`"${institution}" is not recognized in the official SUC/HEI database. Please use the full official name.`);
        setShowErrorModal(true);
        return; 
      }
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id, 
          username: username,
          avatar_url: avatarUrl,
          dark_mode: isDarkMode,
          institution: institution,
          campus: campus,
          college: college,
          department: department,
          year_level: yearLevel,
          updated_at: new Date()
        });

      if (error) throw error;
      
      setShowSuccessModal(true); 
      
      // --- THE MAGIC SHOUT LINE HAS BEEN ADDED HERE ---
      window.dispatchEvent(new Event('profileUpdated'));
      
      // Apply dark mode globally if needed (Requires global CSS setup)
      if (isDarkMode) document.body.classList.add('dark-theme');
      else document.body.classList.remove('dark-theme');

    } catch (error) {
      console.error("Error saving profile:", error);
      setErrorMessage("Database Error: " + error.message);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`app-container ${isDarkMode ? 'dark-mode-active' : ''}`}>
      <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={onToggleSidebar} currentTab="settings" />
      
      <main className="main-content">
        <Topbar onToggleSidebar={onToggleSidebar} hideSearch={true} />

        <div style={{ padding: '0 20px', maxWidth: '800px', margin: '0 auto', paddingBottom: '50px' }}>
          <h1 style={{ marginBottom: '10px' }}>Account Settings</h1>
          <p style={{ color: '#64748b', marginBottom: '30px' }}>Manage your profile, preferences, and university affiliations.</p>

          <form onSubmit={handleSaveProfile} className="post-form-layout">
            
            {/* --- SECTION 1: BASIC INFO & AVATAR --- */}
            <div className="section-card" style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <div style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#f1f5f9', border: '2px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <UserIcon size={40} color="#94a3b8" />
                  )}
                </div>
                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', color: '#610C9F', fontSize: '0.9rem', fontWeight: 'bold' }}>
                  <Camera size={16} /> {uploadingImage ? 'Uploading...' : 'Change Photo'}
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={uploadingImage} style={{ display: 'none' }} />
                </label>
              </div>

              <div style={{ flex: 1, minWidth: '250px' }}>
                <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#1e293b' }}>Basic Details</h3>
                
                <div className="input-group" style={{ marginBottom: '15px' }}>
                  <label className="input-label">Username</label>
                  <input type="text" className="form-input" placeholder="Your display name" value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>
                
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Email Address (Read-only)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '12px 15px', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#64748b' }}>
                    <Mail size={18} /> {user?.email}
                  </div>
                </div>
              </div>
            </div>

            {/* --- SECTION 2: PREFERENCES --- */}
            <div className="section-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ marginTop: 0, marginBottom: '5px', color: '#1e293b' }}>App Theme</h3>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>Switch between Light and Dark mode.</p>
              </div>
              <button 
                type="button" 
                onClick={() => setIsDarkMode(!isDarkMode)}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 20px', borderRadius: '50px', border: 'none', cursor: 'pointer', fontWeight: 'bold', background: isDarkMode ? '#1e293b' : '#f1f5f9', color: isDarkMode ? 'white' : '#1e293b', transition: 'all 0.3s' }}
              >
                {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
                {isDarkMode ? 'Dark Mode' : 'Light Mode'}
              </button>
            </div>

            {/* --- SECTION 3: EDUCATIONAL BACKGROUND (API Verified) --- */}
            <div className="section-card">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#610C9F', marginTop: 0, marginBottom: '20px' }}>
                <GraduationCap size={24} /> Educational Background
              </h3>

              <div className="input-group">
                <label className="input-label">Institution Name</label>
                <input type="text" required className="form-input" placeholder="e.g., Mariano Marcos State University" value={institution} onChange={(e) => setInstitution(e.target.value)} />
                <small style={{ color: '#64748b', display: 'block', marginTop: '8px' }}>Must be an officially recognized Philippine SUC/HEI.</small>
              </div>

              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <div className="input-group" style={{ flex: 1, minWidth: '200px' }}>
                  <label className="input-label">Campus</label>
                  <input type="text" required className="form-input" placeholder="e.g., Main Campus" value={campus} onChange={(e) => setCampus(e.target.value)} />
                </div>
                
                <div className="input-group" style={{ flex: 1, minWidth: '200px' }}>
                  <label className="input-label">College</label>
                  <input type="text" required className="form-input" placeholder="e.g., College of Engineering" value={college} onChange={(e) => setCollege(e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <div className="input-group" style={{ flex: 2, minWidth: '200px', marginBottom: 0 }}>
                  <label className="input-label">Department / Program</label>
                  <input type="text" required className="form-input" placeholder="e.g., BS Computer Science" value={department} onChange={(e) => setDepartment(e.target.value)} />
                </div>
                
                <div className="input-group" style={{ flex: 1, minWidth: '150px', marginBottom: 0 }}>
                  <label className="input-label">Year Level</label>
                  <select required className="form-input" value={yearLevel} onChange={(e) => setYearLevel(e.target.value)}>
                    <option value="" disabled>Select Year</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="5th Year">5th Year</option>
                    <option value="Postgraduate">Postgraduate</option>
                    <option value="Alumni">Alumni</option>
                  </select>
                </div>
              </div>
            </div>

            <button type="submit" className="btn-save" style={{ width: '100%', padding: '16px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} disabled={loading || uploadingImage}>
              <Save size={20} /> {loading ? 'Saving Profile...' : 'Save All Changes'}
            </button>

          </form>
        </div>
      </main>

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '400px', textAlign: 'center', padding: '40px 30px' }}>
            <CheckCircle size={64} color="#10b981" style={{ margin: '0 auto 20px auto', display: 'block' }} />
            <h2 style={{ color: '#1e293b', marginTop: 0 }}>Profile Saved!</h2>
            <p style={{ color: '#64748b', marginBottom: '30px' }}>Your preferences and academic information have been securely updated.</p>
            <button className="btn-save" onClick={() => setShowSuccessModal(false)} style={{ width: '100%', padding: '15px' }}>
              Awesome
            </button>
          </div>
        </div>
      )}

      {/* ERROR MODAL */}
      {showErrorModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '400px', textAlign: 'center', padding: '40px 30px' }}>
            <AlertCircle size={64} color="#ef4444" style={{ margin: '0 auto 20px auto', display: 'block' }} />
            <h2 style={{ color: '#1e293b', marginTop: 0 }}>Verification Failed</h2>
            <p style={{ color: '#64748b', marginBottom: '30px', lineHeight: '1.6' }}>{errorMessage}</p>
            <button className="btn-save" onClick={() => setShowErrorModal(false)} style={{ width: '100%', padding: '15px', backgroundColor: '#ef4444' }}>
              Try Again
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default AccountSettings;