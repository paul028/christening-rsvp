import React, { useState } from 'react';

const photos = [
  { src: '/gallery-1.jpg', alt: 'Danya smiling' },
  { src: '/gallery-2.jpg', alt: 'Danya on the couch' },
  { src: '/gallery-3.jpg', alt: 'Newborn Danya' },
  { src: '/gallery-4.jpg', alt: 'Baby Danya with headband' },
  { src: '/gallery-5.jpg', alt: 'Danya sitting up' },
  { src: '/gallery-6.jpg', alt: 'Danya with glasses' },
];

const PhotoGallery: React.FC = () => {
  const [lightbox, setLightbox] = useState<number | null>(null);

  const prev = () => setLightbox((i) => (i! + photos.length - 1) % photos.length);
  const next = () => setLightbox((i) => (i! + 1) % photos.length);

  return (
    <section className="section photo-gallery">
      <h2 className="section-title">Precious Moments</h2>
      <div className="section-divider-small"></div>
      <p className="section-description">A glimpse of our little blessing</p>

      <div className="gallery-grid">
        {photos.map((photo, index) => (
          <div
            key={index}
            className="gallery-item gallery-item-photo"
            onClick={() => setLightbox(index)}
          >
            <img src={photo.src} alt={photo.alt} className="gallery-photo" />
          </div>
        ))}
      </div>

      {lightbox !== null && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <button className="lightbox-close" onClick={() => setLightbox(null)}>✕</button>
          <button className="lightbox-prev" onClick={(e) => { e.stopPropagation(); prev(); }}>‹</button>
          <img
            src={photos[lightbox].src}
            alt={photos[lightbox].alt}
            className="lightbox-img"
            onClick={(e) => e.stopPropagation()}
          />
          <button className="lightbox-next" onClick={(e) => { e.stopPropagation(); next(); }}>›</button>
        </div>
      )}
    </section>
  );
};

export default PhotoGallery;
