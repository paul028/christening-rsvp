import React from 'react';

const Directions: React.FC = () => {
  return (
    <section className="section directions">
      <h2 className="section-title">Getting There</h2>
      <div className="section-divider-small"></div>

      <div className="directions-cards">
        <div className="direction-card">
          <div className="direction-icon">&#9769;</div>
          <h3>Mary the Queen Parish</h3>
          <p className="direction-area">Diocese of Novaliches</p>
          <p className="direction-text">
            The church is located in the Diocese of Novaliches area.
            Please plan to arrive by <strong>10:30 AM</strong> to be
            seated before the ceremony begins at 11:00 AM.
          </p>
          <a
            href="https://share.google/uTAkofHats2o7UATM"
            target="_blank"
            rel="noopener noreferrer"
            className="map-button"
          >
            Open in Google Maps
          </a>
        </div>

        <div className="direction-card">
          <div className="direction-icon">&#127860;</div>
          <h3>Lasa - SM Fairview</h3>
          <p className="direction-area">Reception Venue</p>
          <p className="direction-text">
            The reception will be held at Lasa, located inside SM Fairview mall.
            From Mary the Queen Parish, it is approximately a 15-20 minute drive.
            SM Fairview has ample parking space available for all guests.
          </p>
          <a
            href="https://share.google/gBZW5Q3hQ6IEsYRKB"
            target="_blank"
            rel="noopener noreferrer"
            className="map-button"
          >
            Open in Google Maps
          </a>
        </div>
      </div>
    </section>
  );
};

export default Directions;
