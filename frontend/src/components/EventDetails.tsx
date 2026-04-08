import React from 'react';

const EventDetails: React.FC = () => {
  return (
    <section className="section event-details">
      <h2 className="section-title">Celebration Details</h2>
      <div className="section-divider-small"></div>

      <div className="event-cards">
        <div className="event-card">
          <div className="event-card-icon">&#9769;</div>
          <h3>Holy Baptism</h3>
          <p className="event-date">Saturday, May 16, 2026</p>
          <p className="event-time">11:00 AM</p>
          <p className="event-venue">Mary the Queen Parish</p>
          <p className="event-venue-sub">Diocese of Novaliches</p>
          <a
            href="https://share.google/uTAkofHats2o7UATM"
            target="_blank"
            rel="noopener noreferrer"
            className="map-button"
          >
            Open in Google Maps
          </a>
        </div>

        <div className="event-card">
          <div className="event-card-icon">&#127860;</div>
          <h3>Reception</h3>
          <p className="event-date">After the Ceremony</p>
          <p className="event-time">Lunch Celebration</p>
          <p className="event-venue">Lasa BBQ</p>
          <p className="event-venue-sub">SM Fairview</p>
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

export default EventDetails;
