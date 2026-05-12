// src/pages/EditListing.jsx
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { supabase } from '../supabaseClient';
import { useLocation, useNavigate } from 'react-router-dom';
import { Banknote, PackageOpen, Handshake, AlertCircle, Trash2, CheckCircle } from 'lucide-react';
import '../styles/AccountSettings.css'; 
import '../styles/Post.css'; 

const EditListing = ({ sidebarCollapsed, onToggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const listingData = location.state?.listing;

  useEffect(() => { if (!listingData) navigate('/'); }, [listingData, navigate]);

  const [title, setTitle] = useState(listingData?.title || '');
  const [price, setPrice] = useState(listingData?.price || '');
  const [category, setCategory] = useState(listingData?.category || '');
  const [condition, setCondition] = useState(listingData?.condition || '');
  const [description, setDescription] = useState(listingData?.description || '');
  
  const [tradeOptions, setTradeOptions] = useState({
    cash: listingData?.accepts_cash || false, 
    product: listingData?.accepts_items || false,
    service: listingData?.accepts_services || false
  });

  const [tradeDetails, setTradeDetails] = useState({
    cashPrice: listingData?.cash_price || '',
    itemsWanted: listingData?.items_wanted || '',
    servicesWanted: listingData?.services_wanted || ''
  });

  const [tradeError, setTradeError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false); 
  const [showDeleteModal, setShowDeleteModal] = useState(false); // NEW: Track delete modal state

  if (!listingData) return null;

  const toggleTradeOption = (option) => {
    setTradeError(''); 
    setTradeOptions(prev => ({ ...prev, [option]: !prev[option] }));
  };

  const handleTradeDetailChange = (field, value) => {
    setTradeDetails(prev => ({ ...prev, [field]: value }));
  };

  // --- SAVE CHANGES ---
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!tradeOptions.cash && !tradeOptions.product && !tradeOptions.service) {
      setTradeError('You must select at least one accepted trade method.');
      return; 
    }
    setLoading(true);

    try {
      const { error } = await supabase.from('listings').update({
          title, price, category, condition, description,
          accepts_cash: tradeOptions.cash,
          accepts_items: tradeOptions.product,
          accepts_services: tradeOptions.service,
          cash_price: tradeDetails.cashPrice ? parseFloat(tradeDetails.cashPrice) : null,
          items_wanted: tradeDetails.itemsWanted,
          services_wanted: tradeDetails.servicesWanted
        }).eq('id', listingData.id);

      if (error) throw error;
      
      setShowSuccessModal(true);

    } catch (error) {
      console.error("Error updating:", error);
      alert("Failed to update listing: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- DELETE LISTING LOGIC ---
  const handleDeleteClick = () => {
    setShowDeleteModal(true); // Open the custom modal instead of window.confirm
  };

  const confirmDeleteListing = async () => {
    setLoading(true);
    const { error } = await supabase.from('listings').delete().eq('id', listingData.id);
    
    if (error) {
      alert("Error deleting listing: " + error.message);
      setLoading(false);
      setShowDeleteModal(false);
    } else {
      navigate('/'); // Go home immediately after deletion
    }
  };

  return (
    <div className="app-container">
      <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={onToggleSidebar} currentTab="" />
      
      <main className="main-content">
        <Topbar onToggleSidebar={onToggleSidebar} hideSearch={true} />

        <div style={{ padding: '0 20px', maxWidth: '800px', margin: '0 auto', paddingBottom: '50px' }}>
          <h1 style={{ marginBottom: '10px' }}>Edit Listing</h1>
          <p style={{ color: '#64748b', marginBottom: '30px' }}>Update the details of your offering.</p>

          <form onSubmit={handleUpdate} className="post-form-layout">
            
            {/* Form Fields (Title, Price, etc) */}
            <div className="section-card">
              <div className="input-group">
                <label className="input-label">Title</label>
                <input required type="text" className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>

              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <div className="input-group" style={{ flex: 1, minWidth: '200px' }}>
                  <label className="input-label">Estimated Value (₱)</label>
                  <input required type="number" min="0" className="form-input" value={price} onChange={(e) => setPrice(e.target.value)} />
                </div>
                
                <div className="input-group" style={{ flex: 1, minWidth: '200px' }}>
                  <label className="input-label">Category</label>
                  <select required className="form-input" value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="" disabled>Select a Category</option>
                    <option value="Textbooks and Papers">Textbooks and Papers</option>
                    <option value="School Uniforms and Institutional Apparel">School Uniforms and Institutional Apparel</option>
                    <option value="Laboratory and Technical Materials">Laboratory and Technical Materials</option>
                    <option value="Dormitory and Student Living Essentials">Dormitory and Student Living Essentials</option>
                    <option value="Electronic and Gadgets">Electronic and Gadgets</option>
                    <option value="Student-offered Services">Student-offered Services</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
              </div>

              <div className="input-group" style={{ marginTop: '5px', paddingTop: '15px' }}>
                <label className="input-label">Item Condition</label>
                <select required className="form-input" value={condition} onChange={(e) => setCondition(e.target.value)}>
                  <option value="Brand New">Brand New</option>
                  <option value="Like New">Like New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                  <option value="N/A">Not Applicable (Service)</option>
                </select>
              </div>

              <div className="input-group" style={{ marginBottom: 0, marginTop: '20px' }}>
                <label className="input-label">Description</label>
                <textarea required rows="4" className="form-textarea" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
            </div>

            {/* Trade Options */}
            <div className="section-card">
              <h3 style={{ marginTop: 0, marginBottom: '5px' }}>Accepted Payments & Trades</h3>
              <div className="trade-options-grid" style={{ marginTop: '15px' }}>
                <button type="button" className={`trade-option-btn ${tradeOptions.cash ? 'selected' : ''}`} onClick={() => toggleTradeOption('cash')}><Banknote size={20} /> Accept Cash</button>
                <button type="button" className={`trade-option-btn ${tradeOptions.product ? 'selected' : ''}`} onClick={() => toggleTradeOption('product')}><PackageOpen size={20} /> Accept Items</button>
                <button type="button" className={`trade-option-btn ${tradeOptions.service ? 'selected' : ''}`} onClick={() => toggleTradeOption('service')}><Handshake size={20} /> Accept Services</button>
              </div>

              {(tradeOptions.cash || tradeOptions.product || tradeOptions.service) && (
                <div className="trade-details-wrapper">
                  {tradeOptions.cash && (
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label className="input-label">Acceptable Cash Amount (₱)</label>
                      <input type="number" min="0" className="form-input" value={tradeDetails.cashPrice} onChange={(e) => handleTradeDetailChange('cashPrice', e.target.value)} />
                    </div>
                  )}
                  {tradeOptions.product && (
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label className="input-label">Specific Items You Would Accept</label>
                      <input type="text" className="form-input" value={tradeDetails.itemsWanted} onChange={(e) => handleTradeDetailChange('itemsWanted', e.target.value)} />
                    </div>
                  )}
                  {tradeOptions.service && (
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label className="input-label">Specific Services You Would Accept</label>
                      <input type="text" className="form-input" value={tradeDetails.servicesWanted} onChange={(e) => handleTradeDetailChange('servicesWanted', e.target.value)} />
                    </div>
                  )}
                </div>
              )}
              {tradeError && <div className="error-message"><AlertCircle size={16} /> {tradeError}</div>}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
              <button type="button" className="btn-save" style={{ flex: 1, backgroundColor: '#cbd5e1', color: '#1e293b' }} onClick={() => navigate('/')}>Cancel</button>
              <button type="submit" className="btn-save" style={{ flex: 2, padding: '16px', fontSize: '1.1rem' }} disabled={loading}>
                {loading ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </div>

            {/* Delete Button */}
            <div style={{ marginTop: '40px', padding: '20px', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
              <button type="button" onClick={handleDeleteClick} disabled={loading} style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', margin: '0 auto' }}>
                <Trash2 size={18} /> Delete This Listing Permanently
              </button>
            </div>

          </form>
        </div>
      </main>

      {/* --- GORGEOUS SUCCESS MODAL --- */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '400px', textAlign: 'center', padding: '40px 30px' }}>
            <CheckCircle size={64} color="#10b981" style={{ margin: '0 auto 20px auto', display: 'block' }} />
            <h2 style={{ color: '#1e293b', marginTop: 0 }}>Changes Saved!</h2>
            <p style={{ color: '#64748b', marginBottom: '30px' }}>Your listing has been successfully updated on the marketplace.</p>
            <button className="btn-save" onClick={() => navigate('/')} style={{ width: '100%', padding: '15px' }}>
              Return to Feed
            </button>
          </div>
        </div>
      )}

      {/* --- NEW: GORGEOUS DELETE CONFIRMATION MODAL --- */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '400px', textAlign: 'center', padding: '40px 30px' }}>
            <AlertCircle size={64} color="#ef4444" style={{ margin: '0 auto 20px auto', display: 'block' }} />
            <h2 style={{ color: '#1e293b', marginTop: 0 }}>Delete Listing?</h2>
            <p style={{ color: '#64748b', marginBottom: '30px' }}>Are you absolutely sure you want to delete this listing? This action cannot be undone.</p>
            
            <div style={{ display: 'flex', gap: '15px' }}>
              <button 
                className="btn-save" 
                onClick={() => setShowDeleteModal(false)} 
                style={{ flex: 1, backgroundColor: '#cbd5e1', color: '#1e293b', padding: '12px' }}
              >
                Cancel
              </button>
              <button 
                className="btn-save" 
                onClick={confirmDeleteListing} 
                disabled={loading} 
                style={{ flex: 1, backgroundColor: '#ef4444', color: 'white', padding: '12px' }}
              >
                {loading ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default EditListing;