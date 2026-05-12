// src/pages/Cart.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import '../styles/AccountSettings.css';

const Cart = ({ sidebarCollapsed, onToggleSidebar }) => {
  const navigate = useNavigate();

  // Note: We will hook this up to your database or local storage later!
  const cartItems = []; 

  return (
    <div className="app-container">
      <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={onToggleSidebar} currentTab="" />
      
      <main className="main-content">
        <Topbar onToggleSidebar={onToggleSidebar} hideSearch={true} />

        <div style={{ padding: '0 20px', maxWidth: '900px', margin: '0 auto', paddingBottom: '50px' }}>
          <h1 style={{ marginBottom: '10px' }}>Your Cart</h1>
          <p style={{ color: '#64748b', marginBottom: '30px' }}>Review the items you want to acquire or trade for.</p>

          {cartItems.length === 0 ? (
            <div className="section-card" style={{ textAlign: 'center', padding: '80px 20px' }}>
              <ShoppingCart size={64} color="#334155" style={{ margin: '0 auto 20px auto', display: 'block' }} />
              <h2 style={{ color: '#f1f5f9', margin: '0 0 10px 0' }}>Your cart is empty</h2>
              <p style={{ color: '#94a3b8', marginBottom: '30px' }}>Looks like you haven't added anything to your cart yet.</p>
              <button 
                className="btn-save" 
                onClick={() => navigate('/')} 
                style={{ padding: '15px 30px', display: 'inline-flex', alignItems: 'center', gap: '10px' }}
              >
                Browse Marketplace <ArrowRight size={18} />
              </button>
            </div>
          ) : (
            <div className="section-card">
              {/* Cart items will render here once we hook up the backend */}
              <p style={{ color: '#f1f5f9' }}>Cart items loading...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Cart;