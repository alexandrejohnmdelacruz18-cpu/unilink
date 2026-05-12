// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext';
import { CheckCircle, AlertCircle, GraduationCap, Save } from 'lucide-react';
import '../styles/AccountSettings.css'; 

const Profile = ({ sidebarCollapsed, onToggleSidebar }) => {
  const { user } = useAuth();
  
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
    // 1. Fetch the valid Philippine Universities from the API
    const fetchInstitutions = async () => {
      try {
        // Pointing to the raw JSON data of the repository
        const response = await fetch('https://raw.githubusercontent.com/RollyPdev/suc-hei-philippines-schools-api/main/data.json'); 
        if (response.ok) {
          const data = await response.json();
          
          // Map through the API response to extract just the names. 
          // (Change 'school.name' to match the actual JSON key if necessary)
          const names = data.map(school => school.name || school.institution_name);
          setValidInstitutions(names);
        }
      } catch (error) {
        console.error("Failed to fetch official institution list:", error);
      }
    };
    
    fetchInstitutions();

    // 2. Fetch the logged-in user's existing profile data
    const fetchProfile = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (data) {
        setInstitution(data.institution || '');
        setCampus(data.campus || '');
        setCollege(data.college || '');
        setDepartment(data.department || '');
        setYearLevel(data.year_level || '');
      }
    };
    
    fetchProfile();
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    
    // --- THE API VALIDATION CHECK ---
    // Only run the check if the API successfully loaded data
    if (validInstitutions.length > 0 && institution.trim() !== '') {
      const isValid = validInstitutions.some(
        name => name.toLowerCase() === institution.trim().toLowerCase()
      );
      
      if (!isValid) {
        setErrorMessage(`"${institution}" is not recognized in the official SUC/HEI database. Please check your spelling or use the full official name.`);
        setShowErrorModal(true);
        return; // Stop the save process entirely
      }
    }

    setLoading(true);

    try {
      // Save to Supabase (using upsert so it creates a row if one doesn't exist yet)
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id, // Make sure 'id' is the primary key linking to auth.users
          institution: institution,
          campus: campus,
          college: college,
          department: department,
          year_level: yearLevel,
          updated_at: new Date()
        });

      if (error) throw error;
      
      // Trigger beautiful success modal
      setShowSuccessModal(true);
      
    } catch (error) {
      console.error("Error saving profile:", error);
      setErrorMessage("Database Error: " + error.message);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={onToggleSidebar} currentTab="profile" />
      
      <main className="main-content">
        <Topbar onToggleSidebar={onToggleSidebar} hideSearch={true} />

        <div style={{ padding: '0 20px', maxWidth: '800px', margin: '0 auto', paddingBottom: '50px' }}>
          <h1 style={{ marginBottom: '10px' }}>Academic Profile</h1>
          <p style={{ color: '#64748b', marginBottom: '30px' }}>Manage your university affiliations and details.</p>

          <form onSubmit={handleSaveProfile} className="post-form-layout">
            
            <div className="section-card">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#610C9F', marginTop: 0, marginBottom: '20px' }}>
                <GraduationCap size={24} /> Educational Background
              </h3>

              <div className="input-group">
                <label className="input-label">Institution Name</label>
                <input 
                  type="text" 
                  required 
                  className="form-input" 
                  placeholder="e.g., Mariano Marcos State University" 
                  value={institution} 
                  onChange={(e) => setInstitution(e.target.value)} 
                />
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

            <button type="submit" className="btn-save" style={{ width: '100%', padding: '16px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} disabled={loading}>
              <Save size={20} /> {loading ? 'Verifying & Saving...' : 'Save Profile'}
            </button>

          </form>
        </div>
      </main>

      {/* --- GORGEOUS SUCCESS MODAL --- */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '400px', textAlign: 'center', padding: '40px 30px' }}>
            <CheckCircle size={64} color="#10b981" style={{ margin: '0 auto 20px auto', display: 'block' }} />
            <h2 style={{ color: '#1e293b', marginTop: 0 }}>Profile Updated!</h2>
            <p style={{ color: '#64748b', marginBottom: '30px' }}>Your academic information has been successfully verified and saved.</p>
            <button className="btn-save" onClick={() => setShowSuccessModal(false)} style={{ width: '100%', padding: '15px' }}>
              Awesome
            </button>
          </div>
        </div>
      )}

      {/* --- CUSTOM ERROR MODAL (Replaces standard alerts) --- */}
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

export default Profile;