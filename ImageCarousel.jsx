import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ImageCarousel = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fallback if no images are provided
  if (!images || images.length === 0) {
    return (
      <div className="carousel-container" style={{ aspectRatio: '4/3', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}>
        <p style={{ color: '#94a3b8' }}>No images available</p>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <div className="carousel-container" style={{ aspectRatio: '4/3' }}>
      {/* Main Image */}
      <img 
        src={images[currentIndex]} 
        alt={`Item ${currentIndex + 1}`} 
        style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
      />

      {/* Only show arrows if there is more than 1 image */}
      {images.length > 1 && (
        <>
          <button className="carousel-btn left" onClick={prevImage}>
            <ChevronLeft size={24} color="#1e293b" />
          </button>
          <button className="carousel-btn right" onClick={nextImage}>
            <ChevronRight size={24} color="#1e293b" />
          </button>

          {/* Pagination Dots */}
          <div style={{ position: 'absolute', bottom: '15px', left: '0', right: '0', display: 'flex', justifyContent: 'center', gap: '8px' }}>
            {images.map((_, idx) => (
              <div 
                key={idx}
                style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: currentIndex === idx ? '#610C9F' : 'rgba(255,255,255,0.6)',
                  transition: 'background 0.3s'
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ImageCarousel;