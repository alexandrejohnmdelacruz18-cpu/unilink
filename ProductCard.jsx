import React from 'react';
import { Heart, User } from 'lucide-react';

const ProductCard = ({ item, toggleFavorite, openDetails, user }) => {
  // Safety check: if no item is passed, don't try to render a broken card
  if (!item) return null;

  return (
    <div className="listing-card-modern">
      
      {/* 1. Image & Floating Favorite */}
      <div className="image-wrapper">
        <img src={item.image_url || "https://via.placeholder.com/300"} alt={item.title} />
        <button 
          className={`btn-favorite-float ${item.isFavorite ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation(); // Prevents opening the details modal when clicking the heart
            if(toggleFavorite) toggleFavorite(item.id); 
          }}
        >
          <Heart size={20} fill={item.isFavorite ? "#ef4444" : "none"} />
        </button>
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
          <span className="category-pill">{item.category || "Uncategorized"}</span>
        </div>

        {/* Spacer pushes the button to the bottom if cards are different heights */}
        <div style={{ flex: 1 }}></div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <User size={14} /> {item.user_id === user?.id ? 'Yours' : (item.seller_name || 'Student')}
          </p>
          
          <button 
            className="btn-save" 
            style={{ padding: '8px 16px', fontSize: '0.9rem' }} 
            onClick={() => {
              if(openDetails) openDetails(item);
            }}
          >
            View Details
          </button>
        </div>
      </div>
      
    </div>
  );
};

export default ProductCard;