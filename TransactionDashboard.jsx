// src/pages/TransactionDashboard.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import ReviewModal from '../components/ReviewModal';
import { 
  Package, Banknote, Repeat, CheckCircle, 
  Clock, AlertTriangle, Truck, ArrowRight, Star
} from 'lucide-react';
import '../styles/AccountSettings.css';

const TransactionDashboard = ({ sidebarCollapsed, onToggleSidebar }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('buying'); // 'buying' or 'selling'
  const [reviewingTx, setReviewingTx] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, [user, activeTab]);

  const fetchTransactions = async () => {
    if (!user) return;
    setLoading(true);

    // We fetch transactions where the user is either the initiator (buying) or receiver (selling)
    const roleColumn = activeTab === 'buying' ? 'initiator_id' : 'receiver_id';

    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        target_listing:listings!transactions_listing_id_fkey(id, title, image_url, price, listing_type),
        offered_item:listings!transactions_offered_item_id_fkey(id, title, image_url, listing_type),
        initiator:profiles!transactions_initiator_id_fkey(username, avatar_url),
        receiver:profiles!transactions_receiver_id_fkey(username, avatar_url)
      `)
      .eq(roleColumn, user.id)
      .order('updated_at', { ascending: false });

    if (!error && data) {
      setTransactions(data);
    }
    setLoading(false);
  };

  // --- THE ACTION ENGINE ---
  const updateTransactionStatus = async (transactionId, newStatus) => {
    const { error } = await supabase
      .from('transactions')
      .update({ status: newStatus, updated_at: new Date() })
      .eq('id', transactionId);

    if (!error) {
      fetchTransactions(); // Refresh the list
    } else {
      alert("Error updating transaction: " + error.message);
    }
  };

  // --- DYNAMIC UI RENDERER ---
  const renderActionButtons = (tx) => {
    const isInitiator = user.id === tx.initiator_id;

    if (tx.status === 'pending') {
      if (!isInitiator) {
        return (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-save" onClick={() => updateTransactionStatus(tx.id, 'awaiting_shipment')} style={{ flex: 1 }}>Accept Offer</button>
            <button className="btn-save" onClick={() => updateTransactionStatus(tx.id, 'cancelled')} style={{ flex: 1, backgroundColor: '#ef4444' }}>Decline</button>
          </div>
        );
      }
      return <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>Awaiting seller's response...</p>;
    }

    if (tx.status === 'awaiting_payment') {
      if (isInitiator) {
        return <button className="btn-save" style={{ width: '100%', backgroundColor: '#10b981' }}>Pay ₱{tx.cash_amount}</button>;
      }
      return <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>Awaiting buyer's payment...</p>;
    }

    if (tx.status === 'awaiting_shipment' || tx.status === 'awaiting_service') {
      if (!isInitiator || tx.exchange_type.includes('product_for_product')) {
        return <button className="btn-save" onClick={() => updateTransactionStatus(tx.id, 'in_progress')} style={{ width: '100%', backgroundColor: '#3b0764' }}><Truck size={16} style={{ display: 'inline', marginRight: '5px' }}/> Mark as Shipped/Started</button>;
      }
      return <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>Waiting for fulfillment...</p>;
    }

    if (tx.status === 'in_progress') {
      if (isInitiator) {
        return <button className="btn-save" onClick={() => updateTransactionStatus(tx.id, 'completed')} style={{ width: '100%', backgroundColor: '#10b981' }}><CheckCircle size={16} style={{ display: 'inline', marginRight: '5px' }}/> Confirm Receipt & Complete</button>;
      }
      return <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>Awaiting buyer confirmation...</p>;
    }

    if (tx.status === 'completed') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
          <div style={{ color: '#10b981', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}><CheckCircle size={18} /> Complete</div>
          <button className="btn-save" onClick={() => setReviewingTx(tx)} style={{ background: 'transparent', border: '1px solid #610C9F', color: '#c084fc', padding: '8px 15px', fontSize: '0.85rem' }}>
              <Star size={14} style={{ display: 'inline', marginRight: '5px' }}/> Leave Review
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="app-container">
      <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={onToggleSidebar} currentTab="transactions" />
      
      <main className="main-content">
        <Topbar onToggleSidebar={onToggleSidebar} hideSearch={true} />

        <div style={{ padding: '0 20px', maxWidth: '1000px', margin: '0 auto', paddingBottom: '50px' }}>
          
          {/* HEADER SECTION (Fixed Layout) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <h1 style={{ marginBottom: '10px' }}>Transaction Hub</h1>
              <p style={{ color: '#64748b', margin: 0 }}>Manage your purchases, sales, and barter exchanges.</p>
            </div>
            
            {/* TABS */}
            <div className="transaction-tabs-container" style={{ display: 'flex', gap: '5px' }}>
              <button 
                className={`transaction-tab ${activeTab === 'buying' ? 'active' : ''}`}
                onClick={() => setActiveTab('buying')}
                style={{ whiteSpace: 'nowrap' }}
              >
                Buying / Offering
              </button>
              <button 
                className={`transaction-tab ${activeTab === 'selling' ? 'active' : ''}`}
                onClick={() => setActiveTab('selling')}
                style={{ whiteSpace: 'nowrap' }}
              >
                Selling / Receiving
              </button>
            </div>
          </div> {/* <-- Properly closes Header row */}

          {/* TRANSACTION LIST */}
          {loading ? (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>Loading transactions...</p>
          ) : transactions.length === 0 ? (
            <div className="section-card" style={{ textAlign: 'center', padding: '80px 20px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Package size={48} color="#64748b" style={{ marginBottom: '15px' }} />
              <h3 className="empty-state-title" style={{ marginTop: 0 }}>No active transactions</h3>
              <p style={{ color: '#64748b', margin: 0 }}>When you buy, sell, or trade items, they will appear here.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {transactions.map(tx => {
                const otherParty = activeTab === 'buying' ? tx.receiver : tx.initiator;
                
                return (
                  <div key={tx.id} className="section-card" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                    
                    {/* LEFT: Item Details */}
                    <div style={{ flex: 2, minWidth: '300px', display: 'flex', gap: '15px' }}>
                      <img src={tx.target_listing?.image_url || "https://via.placeholder.com/100"} alt="Item" style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover' }} />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                          <span style={{ fontSize: '0.8rem', background: '#1e293b', color: '#c084fc', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                            {tx.status.replace('_', ' ')}
                          </span>
                        </div>
                        <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1rem', color: '#f1f5f9' }}>{tx.target_listing?.title}</h3>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          {tx.exchange_type.includes('product_for_product') ? <Repeat size={14} /> : <Banknote size={14} />}
                          {tx.exchange_type.replace(/_/g, ' ').toUpperCase()}
                        </p>
                      </div>
                    </div>

                    {/* MIDDLE: Trade/Payment Info */}
                    <div style={{ flex: 1, minWidth: '200px', borderLeft: '1px solid #262626', paddingLeft: '20px' }}>
                      <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 5px 0' }}>{activeTab === 'buying' ? 'You offered:' : 'They offered:'}</p>
                      {tx.exchange_type.includes('cash') ? (
                        <h3 style={{ margin: 0, color: '#10b981' }}>₱{tx.cash_amount}</h3>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img src={tx.offered_item?.image_url} alt="Offered Item" style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                          <p style={{ margin: 0, fontSize: '0.9rem', color: '#f1f5f9', fontWeight: 'bold' }}>{tx.offered_item?.title}</p>
                        </div>
                      )}
                    </div>

                    {/* RIGHT: Dynamic Actions */}
                    <div style={{ flex: 1, minWidth: '200px', textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                      <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img src={otherParty?.avatar_url || "https://via.placeholder.com/30"} alt="User" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                        {otherParty?.username || 'User'}
                      </p>
                      {renderActionButtons(tx)}
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div> {/* <-- Properly closes Main Content Padding container */}
      </main>

      {/* REVIEW MODAL POPUP */}
      {reviewingTx && (
        <ReviewModal 
          transaction={reviewingTx} 
          currentUser={user} 
          onClose={() => setReviewingTx(null)} 
          onReviewSubmitted={() => {
            setReviewingTx(null);
            alert("Review submitted successfully!");
            fetchTransactions(); 
          }} 
        />
      )}

    </div>
  );
};

export default TransactionDashboard;