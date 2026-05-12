// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  X, ShoppingCart, MessageCircle, Heart, Edit, 
  LayoutGrid, BookOpen, Shirt, Beaker, Bed, Laptop, Briefcase, User, Package
} from 'lucide-react';
import '../styles/Home.css';
import ImageCarousel from '../components/ImageCarousel';

const Home = ({ sidebarCollapsed, onToggleSidebar }) => {
  const [listings, setListings] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  // Add these new states:
  // Update your state to track the new inputs
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ category: '', condition: '', priceSort: '', minPrice: '', maxPrice: '' });
  const [userFavorites, setUserFavorites] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListings = async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) setListings(data);
      setLoading(false);
    };
    fetchListings();
  }, []);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) {
        setUserFavorites([]);
        return;
      }
      const { data, error } = await supabase
        .from('favorites')
        .select('listing_id')
        .eq('user_id', user.id);
        
      if (!error && data) {
        setUserFavorites(data.map(fav => fav.listing_id));
      }
    };
    fetchFavorites();
  }, [user]);

  const getSafeImage = (url) => {
    if (url && url.trim() !== '') return url;
    return "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400"; 
  };

  const categories = [
    { name: 'All', subtitle: 'Live items', icon: <LayoutGrid size={24} /> },
    { name: 'Textbooks and Papers', subtitle: 'Notes & Books', icon: <BookOpen size={24} /> },
    { name: 'School Uniforms and Institutional Apparel', subtitle: 'Clothing', icon: <Shirt size={24} /> },
    { name: 'Laboratory and Technical Materials', subtitle: 'Tools & Gear', icon: <Beaker size={24} /> },
    { name: 'Dormitory and Student Living Essentials', subtitle: 'Housing', icon: <Bed size={24} /> },
    { name: 'Electronic and Gadgets', subtitle: 'Tech', icon: <Laptop size={24} /> },
    { name: 'Student-offered Services', subtitle: 'Freelance', icon: <Briefcase size={24} /> },
    { name: 'Others', subtitle: 'Miscellaneous', icon: <Package size={24} /> }
  ];

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => { setToastMessage(null); }, 3000);
  };

  const handleAddFavorite = async (e, listingId) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    
    if (!user) return showToast("Please log in to save favorites. 🔒");
    
    const isAlreadyFavorited = userFavorites.includes(listingId);

    if (isAlreadyFavorited) {
      const { error } = await supabase.from('favorites').delete().match({ user_id: user.id, listing_id: listingId });
      if (!error) {
        setUserFavorites(prev => prev.filter(id => id !== listingId));
        showToast("Removed from favorites.");
      }
    } else {
      const { error } = await supabase.from('favorites').insert({ user_id: user.id, listing_id: listingId });
      if (!error) {
        setUserFavorites(prev => [...prev, listingId]);
        showToast("Added to favorites! 💜");
      }
    }
  };

  const handleBuyNow = async () => {
    if (!user) return showToast("Please log in to purchase. 🔒");
    await supabase.from('cart').insert({ user_id: user.id, listing_id: selectedItem.id });
    setSelectedItem(null);
    navigate('/cart'); 
  };

  const handleContactSeller = () => {
    if (!user) return showToast("Please log in to message sellers. 🔒");
    setSelectedItem(null);
    navigate('/messages', { state: { sellerId: selectedItem.user_id, itemOfInterest: selectedItem.title } });
  };

  // --- REAL-TIME FILTERING LOGIC ---
// --- REAL-TIME FILTERING LOGIC ---
  const filteredListings = listings.filter(item => {
    // 1. Search Bar Match
    const searchLower = searchQuery ? searchQuery.toLowerCase() : '';
    const titleMatch = item.title ? item.title.toLowerCase().includes(searchLower) : false;
    const descMatch = item.description ? item.description.toLowerCase().includes(searchLower) : false;
    const matchesSearch = titleMatch || descMatch;

    // 2. Category Match
    const matchesCategory = 
      (activeCategory === 'All' || item.category === activeCategory) &&
      (filters.category === '' || item.category === filters.category);

    // 3. Condition Match
    const matchesCondition = 
      filters.condition === '' || item.condition === filters.condition;

    // 4. NEW: Price Range Match
    const itemPrice = parseFloat(item.price) || 0;
    const minP = parseFloat(filters.minPrice);
    const maxP = parseFloat(filters.maxPrice);
    
    // If the input is empty (isNaN), it automatically passes the test
    const matchesMinPrice = isNaN(minP) || itemPrice >= minP;
    const matchesMaxPrice = isNaN(maxP) || itemPrice <= maxP;

    return matchesSearch && matchesCategory && matchesCondition && matchesMinPrice && matchesMaxPrice;
  });

  // 5. Sort by Price
  if (filters.priceSort === 'lowToHigh') {
    filteredListings.sort((a, b) => a.price - b.price);
  } else if (filters.priceSort === 'highToLow') {
    filteredListings.sort((a, b) => b.price - a.price);
  }

  return (
    <div className="app-container">
      <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={onToggleSidebar} currentTab="home" />
      
      <main className="main-content">
        <Topbar 
          onToggleSidebar={onToggleSidebar} 
          hideSearch={false} 
          onSearchChange={setSearchQuery} 
          onFilterChange={(key, value) => setFilters(prev => ({ ...prev, [key]: value }))}
          currentFilters={filters}
        />

        <div style={{ padding: '0 20px' }}>
          
          <div className="category-tabs-container">
            {categories.map((cat) => (
              <button 
                key={cat.name}
                className={`category-tab ${activeCategory === cat.name ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.name)}
              >
                {cat.icon}
                <div className="category-tab-info">
                  <span>{cat.name}</span>
                  <span className="category-tab-subtitle">{cat.subtitle}</span>
                </div>
              </button>
            ))}
          </div>

          {filteredListings.length > 0 ? (
            <div className="listings-grid-container">
              {filteredListings.map(item => {
                
                const isFavorited = userFavorites.includes(item.id);
                const isOwner = user?.id === item.user_id;

                return (
                  <div key={item.id} className="listing-card-modern">
                    
                    {/* 1. Image & Floating Favorite */}
                    <div className="image-wrapper">
                      <img src={getSafeImage(item.image_url)} alt={item.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                      
                      {/* Only show the heart button if it is NOT the user's own listing */}
                      {/* (If you want to see it on your own items to test it, just delete the "!isOwner &&" part!) */}
                      {!isOwner && (
                        <button 
                          className={`btn-favorite-float ${isFavorited ? 'active' : ''}`}
                          onClick={(e) => handleAddFavorite(e, item.id)}
                        >
                          <Heart size={20} fill={isFavorited ? "#ef4444" : "none"} color={isFavorited ? "#ef4444" : "#94a3b8"} />
                        </button>
                      )}
                    </div>

                    {/* 2. Card Details */}
                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.title}
                        </h3>
                        <h3 style={{ margin: 0, color: '#610C9F', fontWeight: 'bold' }}>
                          ₱{item.price}
                        </h3>
                      </div>

                      {/* The clean, automatically truncating pill */}
                      <div>
                        <span className="category-pill">{item.category}</span>
                      </div>

                      {/* Spacer pushes the button to the bottom if cards are different heights */}
                      <div style={{ flex: 1 }}></div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <User size={14} /> {isOwner ? 'Yours' : (item.seller_name || 'Student')}
                        </p>
                        
                        <button className="btn-save" style={{ padding: '8px 16px', fontSize: '0.9rem' }} onClick={() => setSelectedItem({ ...item, isOwner })}>
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
              <LayoutGrid size={48} opacity={0.5} style={{ marginBottom: '15px' }} />
              <h2>No items found</h2>
              <p>Be the first to post a listing in the {activeCategory} category!</p>
            </div>
          )}
        </div>

        
      </main>

      {toastMessage && (
        <div className="toast-notification">
          {toastMessage}
        </div>
      )}

      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setSelectedItem(null)}>
              <X size={20} />
            </button>

            <div className="modal-body">
              <img src={getSafeImage(selectedItem.image_url)} alt={selectedItem.title} className="modal-image" />
              
              <div className="modal-info">
                <h2 style={{ marginTop: 0, marginBottom: '10px', color: '#1e293b' }}>{selectedItem.title}</h2>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
                  <span className="student-tag" style={{ margin: 0 }}>{selectedItem.category}</span>
                  {selectedItem.condition && (
                    <span className="student-tag" style={{ margin: 0, background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' }}>
                      Condition: {selectedItem.condition}
                    </span>
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
                
                {/* Replace the old isOwner block inside the modal in Home.jsx with this: */}
                {selectedItem.isOwner ? (
                  <button 
                    className="btn-save" 
                    onClick={() => {
                      setSelectedItem(null); // Close modal
                      navigate('/edit-listing', { state: { listing: selectedItem } }); // Send data to edit page
                    }} 
                    style={{ width: '100%', padding: '15px', backgroundColor: '#475569', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'background 0.2s' }}
                  >
                    <Edit size={18} /> Edit Your Listing
                  </button>
                ) : (
                  <div className="modal-actions">
                    <button className="btn-save" onClick={handleBuyNow} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <ShoppingCart size={18} /> Buy Now
                    </button>
                    <button className="btn-save" onClick={handleContactSeller} style={{ flex: 1, backgroundColor: '#940B92', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <MessageCircle size={18} /> Contact Seller
                    </button>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;