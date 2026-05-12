// src/pages/Favorites.jsx
import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { supabase } from './supabaseClient';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingCart, MessageCircle, Heart, HeartCrack, Briefcase, User } from 'lucide-react';
import './Home.css';

const Favorites = ({ sidebarCollapsed, onToggleSidebar }) => {
  const [favoriteListings, setFavoriteListings] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch only items the user has favorited!
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          listing_id,
          listings (*)
        `)
        .eq('user_id', user.id);
      
      if (!error && data) {
        // Extract the full listing object from the join
        const listings = data.map(fav => fav.listings).filter(Boolean);
        setFavoriteListings(listings);
      }
      setLoading(false);
    };
    fetchFavorites();
  }, [user]);

  const getSafeImage = (url) => {
    if (url && url.trim() !== '') return url;
    return "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400"; 
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => { setToastMessage(null); }, 3000);
  };

  // REMOVE FROM FAVORITES (Since they are already on the favorites page)
  const handleRemoveFavorite = async (e, listingId) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    
    const { error } = await supabase.from('favorites').delete().match({ user_id: user.id, listing_id: listingId });
    if (!error) {
      // Instantly remove it from the screen
      setFavoriteListings(prev => prev.filter(item => item.id !== listingId));
      showToast("Removed from favorites.");
      if(selectedItem && selectedItem.id === listingId) setSelectedItem(null); // Close modal if open
    }
  };

  const handleBuyNow = async () => {
    if (!user) return;
    await supabase.from('cart').insert({ user_id: user.id, listing_id: selectedItem.id });
    setSelectedItem(null);
    navigate('/checkout'); 
  };

  const handleContactSeller = () => {
    if (!user) return;
    setSelectedItem(null);
    navigate('/messages', { state: { sellerId: selectedItem.user_id, itemOfInterest: selectedItem.title } });
  };

  return (
    <div className="app-container">
      <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={onToggleSidebar} currentTab="favorites" />
      
      <main className="main-content">
        <Topbar onToggleSidebar={onToggleSidebar} hideSearch={true} />

        <div style={{ padding: '0 20px' }}>
          <h1 style={{ marginBottom: '10px' }}>Your Favorites <Heart size={28} color="#DA0C81" fill="#DA0C81" style={{ verticalAlign: 'middle' }}/></h1>
          <p style={{ color: '#64748b', marginBottom: '30px' }}>Items you've saved for later.</p>

          {favoriteListings.length > 0 ? (
            <div className="favorites-grid">
              {favoriteListings.map(item => (
                  <div key={item.id} className="favorite-item-card" style={{ padding: '15px' }}>
                    <div className="image-container" style={{ position: 'relative' }}>
                      
                      {/* Trash/Remove Icon specific to Favorites Page */}
                      <button 
                        className="card-favorite-btn active-heart" 
                        onClick={(e) => handleRemoveFavorite(e, item.id)}
                        style={{ zIndex: 20 }}
                        title="Remove from Favorites"
                      >
                        <HeartCrack size={18} color="#DA0C81" />
                      </button>
                      
                      <img src={getSafeImage(item.image_url)} alt={item.title} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '12px' }} />
                    </div>
                    
                    <h3 style={{ margin: '15px 0 5px 0', color: '#1e293b' }}>{item.title}</h3>
                    <span className="student-tag">{item.category}</span>
                    <p className="card-price">₱{item.price}</p>
                    
                    <button className="view-details-btn" onClick={() => setSelectedItem(item)}>
                      View Details
                    </button>
                  </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
              <Heart size={48} opacity={0.5} style={{ marginBottom: '15px' }} />
              <h2>No favorites yet</h2>
              <p>Go to the marketplace and click the heart icon on items you like!</p>
              <button className="btn-save" onClick={() => navigate('/')} style={{ marginTop: '20px' }}>Browse Marketplace</button>
            </div>
          )}
        </div>
      </main>

      {/* TOAST */}
      {toastMessage && <div className="toast-notification">{toastMessage}</div>}

      {/* FULLY FUNCTIONAL MODAL FOR FAVORITES PAGE */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setSelectedItem(null)}><X size={20} /></button>

            <div className="modal-body">
              <img src={getSafeImage(selectedItem.image_url)} alt={selectedItem.title} className="modal-image" />
              
              <div className="modal-info">
                <h2 style={{ marginTop: 0, marginBottom: '10px', color: '#1e293b' }}>{selectedItem.title}</h2>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
                  <span className="student-tag" style={{ margin: 0 }}>{selectedItem.category}</span>
                  {selectedItem.condition && (
                    <span className="student-tag" style={{ margin: 0, background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' }}>Condition: {selectedItem.condition}</span>
                  )}
                </div>
                <p className="modal-price">₱{selectedItem.price}</p>

                <div style={{ background: '#f5f3ff', border: '1px solid #e0d4f5', padding: '15px', borderRadius: '12px', marginBottom: '20px' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#610C9F', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Briefcase size={16} /> Accepted Trade Methods
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: '#475569', fontSize: '0.9rem', lineHeight: '1.8' }}>
                    {selectedItem.accepts_cash && <li><b>Cash:</b> ₱{selectedItem.cash_price || selectedItem.price}</li>}
                    {selectedItem.accepts_items && <li><b>Items Wanted:</b> {selectedItem.items_wanted || 'Open to item offers'}</li>}
                    {selectedItem.accepts_services && <li><b>Services Wanted:</b> {selectedItem.services_wanted || 'Open to service offers'}</li>}
                  </ul>
                </div>
                
                <div style={{ flex: 1, marginBottom: '20px' }}>
                  <h4 style={{ margin: '0 0 5px 0', color: '#475569' }}>Description</h4>
                  <p style={{ margin: 0, color: '#64748b', lineHeight: '1.6' }}>{selectedItem.description || "No description provided."}</p>
                </div>
                
                <div className="modal-actions">
                  <button className="btn-save" onClick={handleBuyNow} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <ShoppingCart size={18} /> Buy Now
                  </button>
                  <button className="btn-save" onClick={handleContactSeller} style={{ flex: 1, backgroundColor: '#940B92', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <MessageCircle size={18} /> Contact Seller
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Favorites;