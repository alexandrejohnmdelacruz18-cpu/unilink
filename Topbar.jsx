// src/components/Topbar.jsx
import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, Heart, ShoppingCart } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // Added Supabase import!

const Topbar = ({ onToggleSidebar, hideSearch, onSearchChange, onFilterChange, currentFilters }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [username, setUsername] = useState(''); // Added state for username
  const { user } = useAuth();
  const navigate = useNavigate();

  // Added useEffect to fetch the username when the Topbar loads
useEffect(() => {
    const fetchUsername = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single();
          
        if (data && data.username) {
          setUsername(data.username);
        }
      }
    };
    
    // 1. Fetch it immediately when the page loads
    fetchUsername();

    // 2. NEW: Listen for our custom 'profileUpdated' shout
    window.addEventListener('profileUpdated', fetchUsername);

    // 3. Cleanup the listener if the component unmounts
    return () => window.removeEventListener('profileUpdated', fetchUsername);
    
  }, [user]);

  return (
    <header className="topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1 }}>
        <button className="mobile-menu-btn" onClick={onToggleSidebar} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', display: 'none' }}>☰</button>

        {!hideSearch && (
          <div style={{ position: 'relative', flex: 1, maxWidth: '500px', display: 'flex', gap: '10px' }}>
            
            <div className="search-container" style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="text" 
                placeholder="Search for items, categories..." 
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                style={{ width: '100%', padding: '12px 15px 12px 40px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none' }}
              />
            </div>

            <button 
              className="filter-toggle-btn" 
              onClick={() => setShowFilters(!showFilters)}
              style={{ padding: '0 15px', borderRadius: '12px', border: '1px solid #cbd5e1', cursor: 'pointer' }}
            >
              <SlidersHorizontal size={20} color="#475569" />
            </button>

            {/* FIXED UI: Added solid white background and border to prevent transparency overlapping */}
            {showFilters && (
              <div className="filter-dropdown" style={{ position: 'absolute', top: '110%', left: 0, width: '300px', padding: '20px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 100, backgroundColor: 'white', border: '1px solid #e2e8f0' }}>
                
                <h3 style={{ margin: '0 0 15px 0', fontSize: '1rem', color: '#1e293b' }}>Filters</h3>

                <div className="filter-group" style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '5px', color: '#475569' }}>Category</label>
                  <select 
                    className="form-input" 
                    onChange={(e) => onFilterChange && onFilterChange('category', e.target.value)}
                    value={currentFilters?.category || ''}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', outline: 'none', border: '1px solid #cbd5e1' }}
                  >
                    <option value="">All Categories</option>
                    <option value="Textbooks and Papers">Textbooks and Papers</option>
                    <option value="School Uniforms and Institutional Apparel">School Uniforms and Institutional Apparel</option>
                    <option value="Laboratory and Technical Materials">Laboratory and Technical Materials</option>
                    <option value="Dormitory and Student Living Essentials">Dormitory and Student Living Essentials</option>
                    <option value="Electronic and Gadgets">Electronic and Gadgets</option>
                    <option value="Student-offered Services">Student-offered Services</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                <div className="filter-group" style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '5px', color: '#475569' }}>Condition</label>
                  <select 
                    className="form-input" 
                    onChange={(e) => onFilterChange && onFilterChange('condition', e.target.value)}
                    value={currentFilters?.condition || ''}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', outline: 'none', border: '1px solid #cbd5e1' }}
                  >
                    <option value="">Any Condition</option>
                    <option value="Brand New">Brand New</option>
                    <option value="Like New">Like New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                    <option value="N/A">Not Applicable (Service)</option>
                  </select>
                </div>

                {/* NEW: PRICE RANGE */}
                {/* NEW: PRICE RANGE */}
                <div className="filter-group" style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '5px', color: '#475569' }}>Price Range (₱)</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input 
                      type="number" 
                      min="0" 
                      placeholder="Min" 
                      className="form-input" 
                      value={currentFilters?.minPrice || ''}
                      onChange={(e) => onFilterChange('minPrice', e.target.value)}
                      onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
                      style={{ width: '50%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                    <input 
                      type="number" 
                      min="0" 
                      placeholder="Max" 
                      className="form-input" 
                      value={currentFilters?.maxPrice || ''}
                      onChange={(e) => onFilterChange('maxPrice', e.target.value)}
                      onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
                      style={{ width: '50%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>

                <div className="filter-group">
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '5px', color: '#475569' }}>Price Sort</label>
                  <select 
                    className="form-input" 
                    onChange={(e) => onFilterChange && onFilterChange('priceSort', e.target.value)}
                    value={currentFilters?.priceSort || ''}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', outline: 'none', border: '1px solid #cbd5e1' }}
                  >
                    <option value="">Default</option>
                    <option value="lowToHigh">Price: Low to High</option>
                    <option value="highToLow">Price: High to Low</option>
                  </select>
                </div>

              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* CHANGED: Now displays the username if available, and falls back to email! */}
        <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>
          {username || user?.email}
        </span>
        
        <button onClick={() => navigate('/favorites')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold', color: '#1e293b' }}>
           <Heart size={20} color="#610C9F" /> Favorites
        </button>
        <button onClick={() => navigate('/cart')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold', color: '#1e293b' }}>
           <ShoppingCart size={20} color="#610C9F" /> Cart
        </button>
      </div>
    </header>
  );
};

export default Topbar;