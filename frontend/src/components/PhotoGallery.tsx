import React from 'react';

const gradients = [
  'linear-gradient(135deg, #f5e6d3, #e8b4b8)',
  'linear-gradient(135deg, #e8b4b8, #d4a574)',
  'linear-gradient(135deg, #d4a574, #f5e6d3)',
  'linear-gradient(135deg, #faf8f5, #e8b4b8)',
  'linear-gradient(135deg, #e8b4b8, #f5e6d3)',
  'linear-gradient(135deg, #f5e6d3, #d4a574)',
];

const PhotoGallery: React.FC = () => {
  return (
    <section className="section photo-gallery">
      <h2 className="section-title">Precious Moments</h2>
      <div className="section-divider-small"></div>
      <p className="section-description">A glimpse of our little blessing</p>

      <div className="gallery-grid">
        {gradients.map((gradient, index) => (
          <div
            key={index}
            className="gallery-item"
            style={{ background: gradient }}
          >
            <div className="gallery-placeholder">
              <span className="gallery-icon">&#128247;</span>
              <span className="gallery-label">Photo coming soon</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PhotoGallery;
