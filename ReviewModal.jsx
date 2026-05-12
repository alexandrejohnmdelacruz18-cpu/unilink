// src/components/ReviewModal.jsx
import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import { supabase } from '../supabaseClient';
import '../styles/Reviews.css';

const ReviewModal = ({ transaction, currentUser, onClose, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Figure out who the user is reviewing based on the transaction
  const isInitiator = currentUser.id === transaction.initiator_id;
  const revieweeId = isInitiator ? transaction.receiver_id : transaction.initiator_id;
  const revieweeName = isInitiator ? transaction.receiver?.username : transaction.initiator?.username;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }

    // Safety Check: Enforce transaction completion
    if (transaction.status !== 'completed') {
      setError("You can only review users after the transaction is fully completed.");
      return;
    }

    setLoading(true);
    try {
      const { error: submitError } = await supabase
        .from('reviews')
        .insert({
          transaction_id: transaction.id,
          reviewer_id: currentUser.id,
          reviewee_id: revieweeId,
          rating: rating,
          comment: comment
        });

      if (submitError) {
        if (submitError.code === '23505') throw new Error("You have already reviewed this transaction.");
        throw submitError;
      }
      
      onReviewSubmitted();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '450px', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
          <X size={24} />
        </button>

        <h2 style={{ marginTop: 0, color: '#1e293b' }}>Rate your experience</h2>
        <p style={{ color: '#64748b' }}>How was your transaction with <b>{revieweeName || 'this user'}</b> for "{transaction.target_listing?.title}"?</p>

        {error && <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', marginBottom: '15px', fontSize: '0.9rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* STAR RATING */}
          <div className="star-rating-container">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                className="star-btn"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                <Star 
                  size={40} 
                  fill={(hoverRating || rating) >= star ? "#fbbf24" : "none"} 
                  color={(hoverRating || rating) >= star ? "#fbbf24" : "#cbd5e1"} 
                />
              </button>
            ))}
          </div>

          <div className="input-group" style={{ marginTop: '20px' }}>
            <label className="input-label">Written Review (Optional)</label>
            <textarea 
              className="form-textarea" 
              placeholder="Was the item as described? Was the user communicative?"
              rows="4"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px' }}
            ></textarea>
          </div>

          <button type="submit" className="btn-save" disabled={loading} style={{ width: '100%', padding: '15px', marginTop: '10px' }}>
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;