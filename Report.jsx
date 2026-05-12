// src/pages/Report.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { Star, Flag, ShieldCheck } from 'lucide-react';
import '../styles/AccountSettings.css';
import '../styles/Reviews.css'; // Import the new CSS

const Report = ({ sidebarCollapsed, onToggleSidebar }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('reputation'); // 'reputation' or 'issue'
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && activeTab === 'reputation') {
      fetchMyReviews();
    }
  }, [user, activeTab]);

  const fetchMyReviews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        id, rating, comment, created_at,
        reviewer:profiles!reviews_reviewer_id_fkey(username, avatar_url),
        transaction:transactions(target_listing:listings(title))
      `)
      .eq('reviewee_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setReviews(data);
      if (data.length > 0) {
        const avg = data.reduce((acc, curr) => acc + curr.rating, 0) / data.length;
        setAverageRating(avg.toFixed(1));
      }
    }
    setLoading(false);
  };

  return (
    <div className="app-container">
      <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={onToggleSidebar} currentTab="report" />
      
      <main className="main-content">
        <Topbar onToggleSidebar={onToggleSidebar} hideSearch={true} />

        <div style={{ padding: '0 20px', maxWidth: '800px', margin: '0 auto', paddingBottom: '50px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px' }}>
            <div>
              <h1 style={{ marginBottom: '10px' }}>Trust & Safety Center</h1>
              <p style={{ color: '#64748b', margin: 0 }}>View your reputation or report a marketplace issue.</p>
            </div>
            
            <div style={{ display: 'flex', background: '#0a0a0a', padding: '5px', borderRadius: '12px', border: '1px solid #262626' }}>
              <button onClick={() => setActiveTab('reputation')} style={{ padding: '10px 20px', background: activeTab === 'reputation' ? '#1e293b' : 'transparent', color: activeTab === 'reputation' ? '#f8fafc' : '#64748b', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                <Star size={16} style={{ display: 'inline', marginRight: '5px' }}/> My Reputation
              </button>
              <button onClick={() => setActiveTab('issue')} style={{ padding: '10px 20px', background: activeTab === 'issue' ? '#1e293b' : 'transparent', color: activeTab === 'issue' ? '#f8fafc' : '#64748b', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                <Flag size={16} style={{ display: 'inline', marginRight: '5px' }}/> Report Issue
              </button>
            </div>
          </div>

          {activeTab === 'reputation' ? (
            <div>
              {/* REPUTATION SUMMARY */}
              <div className="section-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
                <div style={{ background: '#3b0764', padding: '20px', borderRadius: '12px', textAlign: 'center', minWidth: '120px' }}>
                  <h1 style={{ margin: 0, color: '#f1f5f9', fontSize: '3rem' }}>{averageRating}</h1>
                  <div style={{ display: 'flex', justifyContent: 'center', color: '#fbbf24' }}><Star size={20} fill="#fbbf24" /></div>
                </div>
                <div>
                  <h2 style={{ margin: '0 0 5px 0', color: '#f1f5f9' }}>Overall Seller/Buyer Rating</h2>
                  <p style={{ margin: 0, color: '#94a3b8' }}>Based on {reviews.length} completed transactions. Maintaining a high rating unlocks marketplace achievements!</p>
                </div>
              </div>

              {/* REVIEWS LIST */}
              <h3 style={{ color: '#f1f5f9' }}>Recent Reviews</h3>
              {loading ? <p style={{ color: '#94a3b8' }}>Loading reviews...</p> : reviews.length === 0 ? (
                <p style={{ color: '#94a3b8' }}>You haven't received any reviews yet. Complete some trades!</p>
              ) : (
                reviews.map(review => (
                  <div key={review.id} className="review-card">
                    <div className="review-header">
                      <div className="reviewer-info">
                        <img src={review.reviewer?.avatar_url || "https://via.placeholder.com/30"} style={{ width: '30px', height: '30px', borderRadius: '50%' }} />
                        {review.reviewer?.username || 'Anonymous'}
                      </div>
                      <div style={{ display: 'flex', color: '#fbbf24' }}>
                        {[...Array(review.rating)].map((_, i) => <Star key={i} size={16} fill="#fbbf24" />)}
                      </div>
                    </div>
                    <p className="review-text" style={{ margin: '10px 0', fontSize: '0.95rem' }}>"{review.comment}"</p>
                    <small className="review-date">Item: {review.transaction?.target_listing?.title} • {new Date(review.created_at).toLocaleDateString()}</small>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="section-card">
              {/* This is where your existing "Report Issue" form goes */}
              <h2 style={{ marginTop: 0, color: '#f1f5f9' }}>Submit a Report</h2>
              <p style={{ color: '#94a3b8' }}>Encountered a scam, bug, or abusive user? Let the moderation team know.</p>
              {/* Insert your existing form fields here */}
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default Report;