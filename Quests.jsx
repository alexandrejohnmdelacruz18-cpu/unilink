// src/pages/Quests.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { Target, CheckCircle, Clock, Star } from 'lucide-react';
import '../styles/AccountSettings.css'; 
import '../styles/Quests.css'; 

const Quests = ({ sidebarCollapsed, onToggleSidebar }) => {
  const { user } = useAuth();
  
  // User Gamification State
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [claimedQuests, setClaimedQuests] = useState([]);
  
  // --- NEW: Daily Quest States ---
  const [claimedDailyQuests, setClaimedDailyQuests] = useState([]);
  const [lastDailyReset, setLastDailyReset] = useState('');
  
  const [listingCount, setListingCount] = useState(0);
  const [tradeCount, setTradeCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const xpNeeded = level * 100;
  const xpProgressPercentage = Math.min((xp / xpNeeded) * 100, 100);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    setLoading(true);

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('xp, level, claimed_quests, last_daily_reset, claimed_daily_quests')
        .eq('id', user.id)
        .single();

      if (profile) {
        setXp(profile.xp || 0);
        setLevel(profile.level || 1);
        setClaimedQuests(profile.claimed_quests || []);

        // --- THE DAILY RESET ENGINE ---
        // Get today's date in a simple format (e.g., "2026-05-12")
        const todayDateString = new Date().toLocaleDateString('en-CA'); 
        
        if (profile.last_daily_reset !== todayDateString) {
          // It's a new day! Reset their daily claims in the UI and Database
          setClaimedDailyQuests([]);
          setLastDailyReset(todayDateString);
          
          await supabase.from('profiles').update({
            last_daily_reset: todayDateString,
            claimed_daily_quests: []
          }).eq('id', user.id);
        } else {
          // Still the same day, load their current daily progress
          setClaimedDailyQuests(profile.claimed_daily_quests || []);
          setLastDailyReset(profile.last_daily_reset);
        }
      }

      // Count listings and trades for milestones...
      const { count: lCount } = await supabase.from('listings').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
      setListingCount(lCount || 0);

      const { count: tCount } = await supabase.from('transactions').select('*', { count: 'exact', head: true }).eq('status', 'completed').or(`initiator_id.eq.${user.id},receiver_id.eq.${user.id}`);
      setTradeCount(tCount || 0);

    } catch (error) {
      console.error("Error fetching quest data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handles both Milestone and Daily claims
  const handleClaimReward = async (questId, rewardAmount, isDaily = false) => {
    if (!user) return;
    
    // Check if they already claimed it to prevent cheating
    if (isDaily && claimedDailyQuests.includes(questId)) return;
    if (!isDaily && claimedQuests.includes(questId)) return;

    const newXp = xp + rewardAmount;
    let newLevel = level;

    if (newXp >= level * 100) {
      newLevel = level + 1;
      alert(`🎉 LEVEL UP! You are now Level ${newLevel}!`);
    }

    // Update Local UI instantly
    setXp(newXp);
    setLevel(newLevel);
    
    let dbUpdatePayload = { xp: newXp, level: newLevel };

    if (isDaily) {
      const newDailyClaims = [...claimedDailyQuests, questId];
      setClaimedDailyQuests(newDailyClaims);
      dbUpdatePayload.claimed_daily_quests = newDailyClaims;
    } else {
      const newClaims = [...claimedQuests, questId];
      setClaimedQuests(newClaims);
      dbUpdatePayload.claimed_quests = newClaims;
    }

    // Save to Database
    const { error } = await supabase.from('profiles').update(dbUpdatePayload).eq('id', user.id);

    if (error) {
      alert("Error saving reward. Please try again.");
      fetchUserData(); 
    }
  };

  // --- QUEST DEFINITIONS ---
  const lifetimeQuests = [
    { id: 'first_listing', title: 'List your first item', goal: 1, progress: listingCount, reward: 50 },
    { id: 'five_trades', title: 'Complete 5 successful trades', goal: 5, progress: tradeCount, reward: 100 }
  ];

  // Daily Quests
  const dailyQuests = [
    { id: 'daily_login', title: 'Daily Check-in', subtitle: 'Log in to UniLink today', goal: 1, progress: 1, reward: 15 },
    // If you want to track listings browsed, you would tie this progress to a state variable updated in Home.jsx!
    // For now, this is a freebie quest to show how the UI works.
    { id: 'daily_explore', title: 'Explore the Market', subtitle: 'Check out what is new today', goal: 1, progress: 1, reward: 20 }
  ];

  return (
    <div className="app-container">
      <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={onToggleSidebar} currentTab="quests" />
      
      <main className="main-content">
        <Topbar onToggleSidebar={onToggleSidebar} hideSearch={true} />

        <div style={{ padding: '0 20px', maxWidth: '800px', margin: '0 auto', paddingBottom: '50px' }}>
          
          <div style={{ marginBottom: '30px' }}>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <Target size={32} color="#610C9F" /> Student Quests
            </h1>
            <p style={{ color: '#64748b', margin: 0 }}>Complete tasks to earn UniPoints and level up your account.</p>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', color: '#64748b', padding: '40px' }}>Loading your progress...</p>
          ) : (
            <>
              {/* --- XP & LEVEL DASHBOARD --- */}
              <div className="quest-header-stats">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="level-badge">Level {level}</span>
                    <h3 style={{ margin: 0 }}>Apprentice Trader</h3>
                  </div>
                  <span style={{ fontWeight: 'bold', color: '#610C9F' }}>{xp} / {xpNeeded} XP</span>
                </div>
                
                <div className="xp-bar-container">
                  <div className="xp-bar-fill" style={{ width: `${xpProgressPercentage}%` }}></div>
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', textAlign: 'right' }}>
                  {xpNeeded - xp} XP to next level
                </p>
              </div>

              {/* --- MILESTONE QUESTS --- */}
              <div className="section-card" style={{ marginBottom: '30px' }}>
                <h3 style={{ borderBottom: '1px solid var(--border-color, #e2e8f0)', paddingBottom: '15px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Star size={20} color="#f59e0b" /> Milestone Quests
                </h3>
                
                {lifetimeQuests.map((quest) => {
                  const isCompleted = quest.progress >= quest.goal;
                  const isClaimed = claimedQuests.includes(quest.id);

                  return (
                    <div key={quest.id} className={`quest-card-item ${isClaimed ? 'completed' : ''}`}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        {isClaimed ? <CheckCircle size={24} color="#10b981" /> : <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid #cbd5e1' }}></div>}
                        <div>
                          <h4 style={{ margin: '0 0 5px 0', textDecoration: isClaimed ? 'line-through' : 'none' }}>{quest.title}</h4>
                          <p style={{ margin: 0, fontSize: '0.85rem' }}>Progress: {Math.min(quest.progress, quest.goal)} / {quest.goal}</p>
                        </div>
                      </div>

                      {isClaimed ? (
                        <span style={{ fontWeight: 'bold', color: '#10b981' }}>Claimed</span>
                      ) : isCompleted ? (
                        <button className="btn-claim" onClick={() => handleClaimReward(quest.id, quest.reward, false)}>
                          Claim +{quest.reward} XP
                        </button>
                      ) : (
                        <span style={{ fontWeight: 'bold', color: '#94a3b8' }}>+{quest.reward} XP</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* --- DAILY QUESTS --- */}
              <div className="section-card">
                <div style={{ borderBottom: '1px solid var(--border-color, #e2e8f0)', paddingBottom: '15px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Clock size={20} color="#4f6cff" /> Daily Tasks
                  </h3>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Resets at midnight</span>
                </div>
                
                {dailyQuests.map((quest) => {
                  const isCompleted = quest.progress >= quest.goal;
                  const isClaimed = claimedDailyQuests.includes(quest.id);

                  return (
                    <div key={quest.id} className={`quest-card-item ${isClaimed ? 'completed' : ''}`}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        {isClaimed ? <CheckCircle size={24} color="#10b981" /> : <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid #cbd5e1' }}></div>}
                        <div>
                          <h4 style={{ margin: '0 0 5px 0', textDecoration: isClaimed ? 'line-through' : 'none' }}>{quest.title}</h4>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>{quest.subtitle}</p>
                        </div>
                      </div>

                      {isClaimed ? (
                        <span style={{ fontWeight: 'bold', color: '#10b981' }}>Claimed</span>
                      ) : isCompleted ? (
                        <button className="btn-claim" style={{ background: '#4f6cff' }} onClick={() => handleClaimReward(quest.id, quest.reward, true)}>
                          Claim +{quest.reward} XP
                        </button>
                      ) : (
                        <span style={{ fontWeight: 'bold', color: '#94a3b8' }}>+{quest.reward} XP</span>
                      )}
                    </div>
                  );
                })}

              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Quests;