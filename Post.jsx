// src/pages/Post.jsx
import React, { useState, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { CheckCircle, Camera, X, Banknote, PackageOpen, Handshake, AlertCircle } from 'lucide-react';
import '../styles/AccountSettings.css'; 
import '../styles/Post.css'; 
import { useAuth } from '../AuthContext';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const Post = ({ sidebarCollapsed, onToggleSidebar }) => {
  // NEW: Top-level listing type
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listingType, setListingType] = useState('product'); // 'product' or 'service'

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState(''); // NEW: Product condition
  const [description, setDescription] = useState('');
  
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null);
  
  const [tradeOptions, setTradeOptions] = useState({
    cash: true, 
    product: false,
    service: false
  });

  const [tradeDetails, setTradeDetails] = useState({
    cashPrice: '',
    itemsWanted: '',
    servicesWanted: ''
  });

  const [tradeError, setTradeError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // --- Image Handling Logic ---
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      alert('You can only upload up to 5 images.');
      return;
    }
    const newImages = files.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file)
    }));
    setImages([...images, ...newImages]);
  };

  const removeImage = (indexToRemove) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };

  // --- Trade Option Logic ---
  const toggleTradeOption = (option) => {
    setTradeError(''); 
    setTradeOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const handleTradeDetailChange = (field, value) => {
    setTradeDetails(prev => ({ ...prev, [field]: value }));
  };

  // --- Form Submission ---
const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert("You must be logged in to post a listing.");
      return;
    }

    if (!tradeOptions.cash && !tradeOptions.product && !tradeOptions.service) {
      setTradeError('You must select at least one accepted trade method.');
      return; 
    }

    setLoading(true);

    try {
      let uploadedImageUrl = null;

      // 1. THE BULLETPROOF IMAGE UPLOAD
      if (images.length > 0) {
        // Extra safe: handles both array of objects and array of raw Files
        const file = images[0].file || images[0]; 
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        
        // We define the path right here:
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('listing-images')
          .upload(filePath, file);
          
        if (uploadError) {
          alert("Image upload failed: " + uploadError.message);
          setLoading(false);
          return; 
        }

        // 2. THE BYPASS FIX: We use our own 'filePath' variable instead of data.path!
        const { data: publicUrlData } = supabase.storage
          .from('listing-images')
          .getPublicUrl(filePath);
        
        uploadedImageUrl = publicUrlData.publicUrl;
      }

      // 3. INSERT INTO DATABASE
      const { error } = await supabase.from('listings').insert([
        {
          user_id: user.id,
          title: title,
          price: price,
          category: category,
          condition: listingType === 'product' ? condition : null,
          description: description,
          listing_type: listingType,
          image_url: uploadedImageUrl,
          
          accepts_cash: tradeOptions.cash,
          accepts_items: tradeOptions.product,
          accepts_services: tradeOptions.service,
          cash_price: tradeDetails.cashPrice ? parseFloat(tradeDetails.cashPrice) : null,
          items_wanted: tradeDetails.itemsWanted,
          services_wanted: tradeDetails.servicesWanted
        }
      ]);

      if (error) throw error;

      // 4. Trigger our new custom Success Modal!
      setShowSuccessModal(true); 
      
      // Reset form
      setListingType('product');
      setTitle(''); setPrice(''); setCategory(''); setCondition(''); setDescription('');
      setImages([]); 
      setTradeOptions({ cash: true, product: false, service: false });
      setTradeDetails({ cashPrice: '', itemsWanted: '', servicesWanted: '' });

    } catch (error) {
      console.error("Error creating listing:", error);
      alert("Failed to publish listing: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={onToggleSidebar} currentTab="post" />
      
      <main className="main-content">
        <Topbar onToggleSidebar={onToggleSidebar} hideSearch={true} />

        <div style={{ padding: '0 20px', maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ marginBottom: '10px' }}>Create New Listing</h1>
          <p style={{ color: '#64748b', marginBottom: '30px' }}>What would you like to offer to the campus community?</p>

          <form onSubmit={handleSubmit} className="post-form-layout">
            
            {/* NEW: Listing Type Toggle */}
            <div style={{ display: 'flex', gap: '15px' }}>
              <button 
                type="button" 
                className={`trade-option-btn ${listingType === 'product' ? 'selected' : ''}`} 
                onClick={() => { setListingType('product'); setCategory(''); }}
                style={{ flex: 1, padding: '20px' }}
              >
                <PackageOpen size={24} /> I'm offering a Product
              </button>
              <button 
                type="button" 
                className={`trade-option-btn ${listingType === 'service' ? 'selected' : ''}`} 
                onClick={() => { setListingType('service'); setCategory(''); setCondition(''); }}
                style={{ flex: 1, padding: '20px' }}
              >
                <Handshake size={24} /> I'm offering a Service
              </button>
            </div>

            {/* 1. Image Upload */}
            <div className="section-card">
              <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Photos (Optional for Services)</h3>
              <div className="image-upload-box" onClick={() => fileInputRef.current.click()}>
                <Camera size={32} color="#64748b" />
                <p>Click to upload images (Max 5)</p>
                <input type="file" multiple accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleImageUpload} />
              </div>
              {images.length > 0 && (
                <div className="image-preview-grid">
                  {images.map((img, index) => (
                    <div key={index} className="image-preview-wrapper">
                      <button type="button" className="remove-image-btn" onClick={() => removeImage(index)}><X size={14} /></button>
                      <img src={img.previewUrl} alt={`Preview ${index}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Basic Details */}
            <div className="section-card">
              <div className="input-group">
                <label className="input-label">{listingType === 'product' ? 'Product Name' : 'Service Title'}</label>
                <input required type="text" className="form-input" placeholder={listingType === 'product' ? "e.g., Casio Calculator FX-991EX" : "e.g., C++ Programming Tutoring"} value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>

              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <div className="input-group" style={{ flex: 1, minWidth: '200px' }}>
                  <label className="input-label">{listingType === 'product' ? 'Estimated Value (₱)' : 'Service Rate (₱)'}</label>
                  <input required type="number" min="0" className="form-input" placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value)} onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }} />
                </div>
                
                <div className="input-group" style={{ flex: 1, minWidth: '200px' }}>
                  <label className="input-label">Category</label>
                  <select 
                    required 
                    className="form-input" 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                  >
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

              {/* NEW: Conditional Product Condition */}
              {listingType === 'product' && (
                <div className="input-group trade-details-wrapper" style={{ marginTop: '5px', paddingTop: '15px' }}>
                  <label className="input-label">Item Condition</label>
                  <select required className="form-input" value={condition} onChange={(e) => setCondition(e.target.value)}>
                    <option value="" disabled>Select the condition of your item...</option>
                    <option value="Brand New">Brand New (Unopened/Unused)</option>
                    <option value="Like New">Like New (Used once or twice, perfect condition)</option>
                    <option value="Good">Good (Normal wear and tear, fully functional)</option>
                    <option value="Fair">Fair (Noticeable cosmetic damage, but works)</option>
                    <option value="Poor">Poor (Broken parts, needs repair)</option>
                  </select>
                </div>
              )}

              <div className="input-group" style={{ marginBottom: 0, marginTop: '20px' }}>
                <label className="input-label">Description</label>
                <textarea required rows="4" className="form-textarea" placeholder={listingType === 'product' ? "Describe your item, its features, and any flaws..." : "Describe your service, your experience, and your availability..."} value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
            </div>

            {/* 3. Trade Preferences */}
            <div className="section-card">
              <h3 style={{ marginTop: 0, marginBottom: '5px' }}>Accepted Payments & Trades</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '15px' }}>Select the ways you are willing to be compensated.</p>
              
              <div className="trade-options-grid">
                <button type="button" className={`trade-option-btn ${tradeOptions.cash ? 'selected' : ''}`} onClick={() => toggleTradeOption('cash')}>
                  <Banknote size={20} /> Accept Cash
                </button>
                <button type="button" className={`trade-option-btn ${tradeOptions.product ? 'selected' : ''}`} onClick={() => toggleTradeOption('product')}>
                  <PackageOpen size={20} /> Accept Items
                </button>
                <button type="button" className={`trade-option-btn ${tradeOptions.service ? 'selected' : ''}`} onClick={() => toggleTradeOption('service')}>
                  <Handshake size={20} /> Accept Services
                </button>
              </div>

              {(tradeOptions.cash || tradeOptions.product || tradeOptions.service) && (
                <div className="trade-details-wrapper">
                  {tradeOptions.cash && (
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label className="input-label">Acceptable Cash Amount (₱)</label>
                      <input type="number" min="0" className="form-input" placeholder="e.g., 850 (Leave blank if same as Estimated Value)" value={tradeDetails.cashPrice} onChange={(e) => handleTradeDetailChange('cashPrice', e.target.value)} onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }} />
                    </div>
                  )}
                  {tradeOptions.product && (
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label className="input-label">Specific Items You Would Accept</label>
                      <input type="text" className="form-input" placeholder="e.g., Scientific Calculator, Drafting Table..." value={tradeDetails.itemsWanted} onChange={(e) => handleTradeDetailChange('itemsWanted', e.target.value)} />
                    </div>
                  )}
                  {tradeOptions.service && (
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label className="input-label">Specific Services You Would Accept</label>
                      <input type="text" className="form-input" placeholder="e.g., 2 hours of C++ tutoring, Graphic design..." value={tradeDetails.servicesWanted} onChange={(e) => handleTradeDetailChange('servicesWanted', e.target.value)} />
                    </div>
                  )}
                </div>
              )}

              {tradeError && (
                <div className="error-message">
                  <AlertCircle size={16} /> {tradeError}
                </div>
              )}
            </div>

            <button type="submit" className="btn-save" style={{ width: '100%', padding: '16px', fontSize: '1.1rem' }} disabled={loading}>
              {loading ? 'Publishing Listing...' : 'Publish Listing'}
            </button>

          </form>
        </div>
      </main>
{/* --- GORGEOUS SUCCESS MODAL --- */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '400px', textAlign: 'center', padding: '40px 30px' }}>
            <CheckCircle size={64} color="#10b981" style={{ margin: '0 auto 20px auto', display: 'block' }} />
            <h2 style={{ color: '#1e293b', marginTop: 0 }}>Listing Published!</h2>
            <p style={{ color: '#64748b', marginBottom: '30px' }}>Your item is now live on the marketplace.</p>
            
            <div style={{ display: 'flex', gap: '15px' }}>
              <button 
                className="btn-save" 
                onClick={() => setShowSuccessModal(false)} 
                style={{ flex: 1, padding: '15px', backgroundColor: '#cbd5e1', color: '#1e293b' }}
              >
                Post Another
              </button>
              <button 
                className="btn-save" 
                onClick={() => navigate('/')} 
                style={{ flex: 1, padding: '15px' }}
              >
                View Feed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Post;