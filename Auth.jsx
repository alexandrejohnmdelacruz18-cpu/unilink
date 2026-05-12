// src/pages/Auth.jsx
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Globe } from 'lucide-react';
import '../styles/AccountSettings.css'; // Make sure this imports your global styles/dark mode

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // 1. THE UNIVERSITY GATEKEEPER
    if (!email.trim().endsWith('.edu.ph')) {
      setError('Access Denied: You must use a valid university email (.edu.ph) to join UniLink.');
      setLoading(false);
      return;
    }

    if (isLogin) {
      // LOG IN FLOW
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else navigate('/'); // Send them to the homepage!
    } else {
      // SIGN UP FLOW
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else if (data.user) {
        // 2. CREATE THEIR PUBLIC PROFILE
        // CRITICAL FIX: Changed from 'users' to 'profiles' to match your database architecture
        await supabase.from('profiles').insert([{
          id: data.user.id,
          username: displayName,
        }]);
        
        alert('Welcome to UniLink! You can now log in.');
        setIsLogin(true);
      }
    }
    setLoading(false);
  };

  return (
    // Used your global 'app-container' class so the background respects Dark Mode
    <div className="app-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      
      {/* Used 'section-card' so it turns True Black in dark mode instead of staying blinding white */}
      <div className="section-card" style={{ width: '100%', maxWidth: '400px', padding: '40px', margin: '20px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <Globe size={48} color="#610C9F" /> {/* Changed from blue to UniLink Purple */}
          <h2 style={{ margin: '10px 0' }}>UniLink</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Exclusive University Marketplace</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', padding: '10px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {!isLogin && (
            <input
              type="text"
              className="form-input" // Replaced inline borders with your global input style
              placeholder="Display Name (e.g., Yelow, Chie!)"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              style={{ padding: '12px', width: '100%' }}
            />
          )}
          <input
            type="email"
            className="form-input"
            placeholder="University Email (.edu.ph)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: '12px', width: '100%' }}
          />
          <input
            type="password"
            className="form-input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ padding: '12px', width: '100%' }}
          />
          
          <button type="submit" disabled={loading} className="btn-save" style={{ width: '100%', padding: '15px', marginTop: '10px' }}>
            {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Create Account')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            style={{ background: 'none', border: 'none', color: '#c084fc', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;