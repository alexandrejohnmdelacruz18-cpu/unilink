// src/pages/Achievements.jsx
import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { supabase } from './supabaseClient';
import { useAuth } from './AuthContext';
import { Trophy, Star, ShieldCheck, Zap, Heart, MessageCircle, Lock } from 'lucide-react';
import './AccountSettings.css'; // Your global layout styles
import './Achievements.css';

const Achievements = ({ sidebarCollapsed, onToggleSidebar }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  
  // State to hold the user's actual database numbers
  const [stats, setStats] = useState({
    listingCount: 0,
    tradeCount: 0,
    messageCount: 0,
    accountAgeDays: 0
  });

  useEffect(() => {
    if (user) {
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    setLoading(true);
    try {
      // 1. Fetch Listing Count
      const { count: lCount } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // 2. Fetch Completed Trades
      const { count: tCount } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')
        .or(`initiator_id.eq.${user.id},receiver_id.eq.${user.id}`);

      // 3. Fetch Message Count (Wraps in try/catch just in case your messages table is named differently)
      let mCount = 0;
      try {
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('sender_id', user.id);
        mCount = count || 0;
      } catch (err) {
        console.warn("Messages count skipped.");
      }

      // 4. Calculate Account Age (for Early Adopter)
      const { data: profile } = await supabase
        .from('profiles')
        .select('created_at')
        .eq('id', user.id)
        .single();
      
      let daysOld = 0;
      if (profile?.created_at) {
        const createdDate = new Date(profile.created_at);
        const today = new Date();
        daysOld = Math.floor((today - createdDate) / (1000 * 60 * 60 * 24));
      }

      setStats({
        listingCount: lCount || 0,
        tradeCount: tCount || 0,
        messageCount: mCount || 0,
        accountAgeDays: daysOld
      });

    } catch (error) {
      console.error("Error fetching achievement stats:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- DYNAMIC ACHIEVEMENTS LOGIC ---
  // The 'unlocked' property evaluates to true/false based on real database numbers!
  const achievementsList = [
    {
      id: 1, 
      title: "Early Adopter", 
      desc: "Joined UniLink during the beta launch.",
      icon: <Star size={32} />, 
      rarity: "Legendary", 
      unlocked: true, // Always true for your initial users!
      iconColor: "#DA0C81"
    },
    {
      id: 2, 
      title: "Verified Seller", 
      desc: "Successfully listed 5 items.",
      icon: <ShieldCheck size={32} />, 
      rarity: "Common", 
      unlocked: stats.listingCount >= 5, 
      iconColor: "#610C9F",
      progress: `${Math.min(stats.listingCount, 5)}/5`
    },
    {
      id: 3, 
      title: "Trusted Student", 
      desc: "Completed 5 successful trades.",
      icon: <Heart size={32} />, 
      rarity: "Rare", 
      unlocked: stats.tradeCount >= 5, 
      iconColor: "#940B92",
      progress: `${Math.min(stats.tradeCount, 5)}/5`
    },
    {
      id: 4, 
      title: "Talk of the Town", 
      desc: "Sent 20 messages to other students.",
      icon: <MessageCircle size={32} />, 
      rarity: "Common", 
      unlocked: stats.messageCount >= 20, 
      iconColor: "#610C9F",
      progress: `${Math.min(stats.messageCount, 20)}/20`
    },
    {
      id: 5, 
      title: "Market Veteran", 
      desc: "Account is older than 30 days.",
      icon: <Zap size={32} />, 
      rarity: "Rare", 
      unlocked: stats.accountAgeDays >= 30, 
      iconColor: "#940B92",
      progress: `${Math.min(stats.accountAgeDays, 30)}/30`
    }
  ];

  return (
    <div className="app-container">
      <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={onToggleSidebar} currentTab="profile" />
      
      <main className="main-content">
        <Topbar onToggleSidebar={onToggleSidebar} hideSearch={true} />

        <div style={{ padding: '0 20px', maxWidth: '1000px', margin: '0 auto', paddingBottom: '50px' }}>
          <div style={{ marginBottom: '30px' }}>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <Trophy size={32} color="#610C9F" /> Your Achievements
            </h1>
            <p style={{ color: '#64748b', margin: 0 }}>Showcase your progress and reputation in the community.</p>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', color: '#64748b', padding: '40px' }}>Syncing your achievements...</p>
          ) : (
            <div className="achievements-grid">
              {achievementsList.map((badge) => (
                // Used your global 'section-card' so it handles Dark Mode automatically
                <div key={badge.id} className={`section-card achievement-card ${!badge.unlocked ? 'locked' : ''}`}>
                  
                  {!badge.unlocked && (
                    <div className="lock-icon-wrapper"><Lock size={16} /></div>
                  )}

                  <div className="achievement-icon-wrapper" style={{ backgroundColor: badge.unlocked ? '#f8fafc' : '#f1f5f9', color: badge.unlocked ? badge.iconColor : '#94a3b8' }}>
                    {badge.icon}
                  </div>

                  <h3 className="achievement-title">{badge.title}</h3>
                  <span className={`achievement-rarity rarity-${badge.rarity.toLowerCase()}`}>
                    {badge.rarity}
                  </span>
                  <p className="achievement-desc">{badge.desc}</p>
                  
                  {/* Progress tracker shown on locked achievements */}
                  {!badge.unlocked && badge.progress && (
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '10px', fontWeight: 'bold' }}>
                      Progress: {badge.progress}
                    </p>
                  )}
                  
                  <span className={`achievement-status ${badge.unlocked ? 'status-unlocked' : 'status-locked'}`}>
                    {badge.unlocked ? 'Unlocked' : 'Locked'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Achievements;