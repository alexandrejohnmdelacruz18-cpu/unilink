// src/pages/Checkout.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { useAuth } from './AuthContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { Banknote, Repeat, CheckCircle, Package, ArrowRight } from 'lucide-react';
import './AccountSettings.css'; // Reusing your beautiful dark mode card styles

const Checkout = ({ sidebarCollapsed, onToggleSidebar }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // The listing the user clicked "Buy/Offer" on
  const targetListing = location.state?.listing; 

  const [myListings, setMyListings] = useState([]);
  const [offerType, setOfferType] = useState('cash'); // 'cash' or 'trade'
  const [selectedMyListingId, setSelectedMyListingId] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Redirect if they somehow got here without selecting an item
  useEffect(() => {
    if (!targetListing) {
      navigate('/');
      return;
    }

    // Default the offer type based on what the seller accepts
    if (!targetListing.accepts_cash && (targetListing.accepts_items || targetListing.accepts_services)) {
      setOfferType('trade');
    }

    // Fetch the logged-in user's own listings so they can offer them in a trade
    const fetchMyListings = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('listings')
        .select('id, title, listing_type')
        .eq('user_id', user.id);
        
      if (!error && data) {
        setMyListings(data);
      }
    };
    
    fetchMyListings();
  }, [targetListing, user, navigate]);

  if (!targetListing) return null;

  const handleSubmitOffer = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Determine the Exchange Type for the Database
      let exchangeType = '';
      let initialStatus = '';
      let offeredItemId = null;
      let cashAmount = null;

      if (offerType === 'cash') {
        // Cash transactions go straight to payment/shipping
        exchangeType = targetListing.listing_type === 'product' ? 'cash_for_product' : 'cash_for_service';
        initialStatus = 'awaiting_payment'; 
        cashAmount = targetListing.cash_price || targetListing.price;
      } else {
        // Trades go to 'pending' because the seller has to accept the offer first
        const myOfferedItem = myListings.find(item => item.id === selectedMyListingId);
        
        if (!myOfferedItem) throw new Error("Please select an item to offer.");
        
        if (targetListing.listing_type === 'product' && myOfferedItem.listing_type === 'product') exchangeType = 'product_for_product';
        if (targetListing.listing_type === 'service' && myOfferedItem.listing_type === 'product') exchangeType = 'product_for_service';
        if (targetListing.listing_type === 'product' && myOfferedItem.listing_type === 'service') exchangeType = 'service_for_product';
        
        initialStatus = 'pending';
        offeredItemId = myOfferedItem.id;
      }

      // 2. Insert into the Unified Transactions Table
      const { error } = await supabase
        .from('transactions')
        .insert({
          listing_id: targetListing.id,
          initiator_id: user.id,
          receiver_id: targetListing.user_id,
          exchange_type: exchangeType,
          status: initialStatus,
          escrow_status: offerType === 'cash' ? 'held' : 'none',
          cash_amount: cashAmount,
          offered_item_id: offeredItemId
        });

      if (error) throw error;
      
      setShowSuccessModal(true);

    } catch (error) {
      console.error("Transaction Error:", error);
      alert(error.message); // Temporarily using alert for catches, can swap to error modal later
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={onToggleSidebar} currentTab="" />
      
      <main className="main-content">
        <Topbar onToggleSidebar={onToggleSidebar} hideSearch={true} />

        <div style={{ padding: '0 20px', maxWidth: '900px', margin: '0 auto', paddingBottom: '50px' }}>
          <h1 style={{ marginBottom: '10px' }}>Secure Checkout & Offers</h1>
          <p style={{ color: '#64748b', marginBottom: '30px' }}>Configure your payment or trade offer for this listing.</p>

          <form onSubmit={handleSubmitOffer} style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
            
            {/* LEFT COLUMN: Target Listing Summary */}
            <div className="section-card" style={{ flex: 1, minWidth: '300px', alignSelf: 'flex-start' }}>
              <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#1e293b' }}>You are acquiring:</h3>
              
              <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                <img 
                  src={targetListing.image_url || "https://via.placeholder.com/150"} 
                  alt={targetListing.title} 
                  style={{ width: '100px', height: '100px', borderRadius: '12px', objectFit: 'cover' }} 
                />
                <div>
                  <h4 style={{ margin: '0 0 5px 0', fontSize: '1.1rem' }}>{targetListing.title}</h4>
                  <span className="student-tag">{targetListing.listing_type?.toUpperCase() || 'PRODUCT'}</span>
                  <p className="card-price" style={{ margin: '10px 0 0 0' }}>Est Value: ₱{targetListing.price}</p>
                </div>
              </div>

              <div style={{ padding: '15px', background: '#0a0a0a', borderRadius: '8px', border: '1px solid #262626' }}>
                <h5 style={{ margin: '0 0 10px 0', color: '#94a3b8' }}>Seller Accepts:</h5>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#cbd5e1', fontSize: '0.9rem' }}>
                  {targetListing.accepts_cash && <li>Cash (₱{targetListing.cash_price || targetListing.price})</li>}
                  {targetListing.accepts_items && <li>Item Trades</li>}
                  {targetListing.accepts_services && <li>Service Trades</li>}
                </ul>
              </div>
            </div>

            {/* RIGHT COLUMN: Offer Configuration */}
            <div className="section-card" style={{ flex: 1.5, minWidth: '300px' }}>
              <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#1e293b' }}>How would you like to pay?</h3>

              {/* Radio Option: CASH */}
              {targetListing.accepts_cash && (
                <div 
                  className={`radio-option ${offerType === 'cash' ? 'selected' : ''}`}
                  onClick={() => setOfferType('cash')}
                  style={{ padding: '15px', border: '2px solid', borderColor: offerType === 'cash' ? '#610C9F' : '#334155', borderRadius: '12px', marginBottom: '15px', cursor: 'pointer', display: 'flex', gap: '15px', alignItems: 'center' }}
                >
                  <Banknote size={24} color={offerType === 'cash' ? '#c084fc' : '#64748b'} />
                  <div>
                    <h4 style={{ margin: '0 0 5px 0' }}>Pay with Cash</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Proceed to secure payment. Escrow protection included.</p>
                  </div>
                </div>
              )}

              {/* Radio Option: TRADE */}
              {(targetListing.accepts_items || targetListing.accepts_services) && (
                <div 
                  className={`radio-option ${offerType === 'trade' ? 'selected' : ''}`}
                  onClick={() => setOfferType('trade')}
                  style={{ padding: '15px', border: '2px solid', borderColor: offerType === 'trade' ? '#610C9F' : '#334155', borderRadius: '12px', marginBottom: '20px', cursor: 'pointer', display: 'flex', gap: '15px', alignItems: 'center' }}
                >
                  <Repeat size={24} color={offerType === 'trade' ? '#c084fc' : '#64748b'} />
                  <div>
                    <h4 style={{ margin: '0 0 5px 0' }}>Offer a Trade</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Propose an exchange using your own listings.</p>
                  </div>
                </div>
              )}

              {/* Dynamic Trade Selector (Only shows if 'trade' is selected) */}
              {offerType === 'trade' && (
                <div className="input-group" style={{ marginTop: '20px', background: '#0a0a0a', padding: '15px', borderRadius: '12px', border: '1px solid #262626' }}>
                  <label className="input-label" style={{ color: '#e9d5ff' }}>Select an item/service to offer:</label>
                  
                  {myListings.length > 0 ? (
                    <select 
                      required 
                      className="form-input" 
                      value={selectedMyListingId} 
                      onChange={(e) => setSelectedMyListingId(e.target.value)}
                    >
                      <option value="" disabled>Choose from your active listings...</option>
                      {myListings.map(item => (
                        <option key={item.id} value={item.id}>
                          [{item.listing_type === 'product' ? 'Item' : 'Service'}] {item.title}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div style={{ padding: '15px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', fontSize: '0.9rem' }}>
                      You don't have any active listings to offer. You need to create a listing first!
                    </div>
                  )}
                </div>
              )}

              <button 
                type="submit" 
                className="btn-save" 
                disabled={loading || (offerType === 'trade' && myListings.length === 0)}
                style={{ width: '100%', padding: '16px', fontSize: '1.1rem', marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
              >
                {loading ? 'Processing...' : offerType === 'cash' ? 'Proceed to Payment' : 'Send Trade Offer'} <ArrowRight size={20} />
              </button>

            </div>
          </form>
        </div>
      </main>

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '400px', textAlign: 'center', padding: '40px 30px' }}>
            <CheckCircle size={64} color="#10b981" style={{ margin: '0 auto 20px auto', display: 'block' }} />
            <h2 style={{ color: '#f1f5f9', marginTop: 0 }}>
              {offerType === 'cash' ? 'Order Placed!' : 'Offer Sent!'}
            </h2>
            <p style={{ color: '#94a3b8', marginBottom: '30px' }}>
              {offerType === 'cash' 
                ? "Your payment is secured in escrow. Awaiting seller shipment." 
                : "Your barter offer has been sent to the seller. We'll notify you when they respond."}
            </p>
            <button className="btn-save" onClick={() => navigate('/transactions')} style={{ width: '100%', padding: '15px' }}>
              View Dashboard
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Checkout;