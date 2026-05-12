// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useAuth } from './AuthContext';
import { supabase } from './supabaseClient';
import { BarChart3, Package, Heart, ShoppingCart, Loader2 } from 'lucide-react';
import './Dashboard.css';

const Dashboard = ({ sidebarCollapsed, onToggleSidebar }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  
  // Real Database States
  const [stats, setStats] = useState({
    activeListings: 0,
    savedFavorites: 0,
    cartItems: 0
  });
  const [recentListings, setRecentListings] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        // 1. Get exact count of user's active listings
        const { count: listingsCount } = await supabase
          .from('listings')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // 2. Get exact count of user's favorites
        const { count: favoritesCount } = await supabase
          .from('favorites')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // 3. Get exact count of user's cart items
        const { count: cartCount } = await supabase
          .from('cart')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // 4. Fetch the 5 most recent listings created by this user for the table
        const { data: recent } = await supabase
          .from('listings')
          .select('id, title, price, category, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        setStats({
          activeListings: listingsCount || 0,
          savedFavorites: favoritesCount || 0,
          cartItems: cartCount || 0
        });
        
        setRecentListings(recent || []);

      } catch (error) {
        console.error("Error fetching dashboard data:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  return (
    <div className="app-container"> 
      <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={onToggleSidebar} currentTab="dashboard" />

      <main className="main-content"> 
        <Topbar onToggleSidebar={onToggleSidebar} hideSearch={true} />

        <div style={{ padding: '0 20px', maxWidth: '1200px', margin: '0 auto' }}>
          
          <div className="dashboard-header">
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <BarChart3 size={32} color="#610C9F" /> 
              Dashboard
            </h1>
            <p style={{ color: '#64748b' }}>Real-time overview of your marketplace activity.</p>
          </div>

          {loading ? (
             <div style={{ display: 'flex', justifyContent: 'center', padding: '60px', color: '#610C9F' }}>
               <Loader2 className="lucide-spin" size={48} />
             </div>
          ) : (
            <>
              {/* LIVE DATABASE STATS */}
              <div className="stats-grid">
                <div className="stat-card">
                  <Package size={40} color="#610C9F" />
                  <div>
                    <h3>{stats.activeListings}</h3>
                    <p>My Active Listings</p>
                  </div>
                </div>
                
                <div className="stat-card">
                  <Heart size={40} color="#DA0C81" />
                  <div>
                    <h3>{stats.savedFavorites}</h3>
                    <p>Saved Favorites</p>
                  </div>
                </div>
                
                <div className="stat-card">
                  <ShoppingCart size={40} color="#940B92" />
                  <div>
                    <h3>{stats.cartItems}</h3>
                    <p>Items in Cart</p>
                  </div>
                </div>
              </div>

              {/* REPLACED THE PLACEHOLDER WITH A REAL DATA TABLE */}
              <div className="dashboard-content-tabs" style={{ display: 'block', padding: '25px', alignItems: 'flex-start' }}>
                 <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#1e293b', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
                   My Recent Listings
                 </h3>
                 
                 {recentListings.length > 0 ? (
                   <div style={{ overflowX: 'auto' }}>
                     <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                       <thead>
                         <tr style={{ color: '#64748b', fontSize: '0.9rem', borderBottom: '1px solid #e2e8f0' }}>
                           <th style={{ padding: '12px 8px' }}>Title</th>
                           <th style={{ padding: '12px 8px' }}>Category</th>
                           <th style={{ padding: '12px 8px' }}>Price</th>
                           <th style={{ padding: '12px 8px' }}>Date Posted</th>
                         </tr>
                       </thead>
                       <tbody>
                         {recentListings.map(item => (
                           <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                             <td style={{ padding: '12px 8px', fontWeight: '500', color: '#1e293b' }}>{item.title}</td>
                             <td style={{ padding: '12px 8px' }}><span className="student-tag" style={{ marginTop: 0 }}>{item.category}</span></td>
                             <td style={{ padding: '12px 8px', color: '#610C9F', fontWeight: 'bold' }}>₱{item.price}</td>
                             <td style={{ padding: '12px 8px', color: '#64748b', fontSize: '0.9rem' }}>
                               {new Date(item.created_at).toLocaleDateString()}
                             </td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                 ) : (
                   <p style={{ color: '#64748b', textAlign: 'center', padding: '30px 0' }}>
                     You haven't posted any items or services yet. Head over to the Post tab to get started!
                   </p>
                 )}
              </div>
            </>
          )}

        </div>
      </main>
    </div>
  );
};

export default Dashboard;