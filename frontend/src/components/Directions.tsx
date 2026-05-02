import React, { useState } from 'react';

type TravelMode = 'driving' | 'walking' | 'transit';

const CHURCH_QUERY = 'Mary+the+Queen+Parish,+Novaliches,+Quezon+City,+Philippines';
const RECEPTION_QUERY = 'SM+Fairview,+Quezon+City,+Philippines';

const TRAVEL_MODES: { mode: TravelMode; label: string; icon: string; flag: string }[] = [
  { mode: 'driving',  label: 'By Car',    icon: '🚗', flag: 'd' },
  { mode: 'walking',  label: 'On Foot',   icon: '🚶', flag: 'w' },
  { mode: 'transit',  label: 'By Commute', icon: '🚌', flag: 'r' },
];

function embedUrl(query: string) {
  return `https://maps.google.com/maps?q=${query}&output=embed`;
}

function directionsUrl(flag: string) {
  return `https://maps.google.com/maps?saddr=${CHURCH_QUERY}&daddr=${RECEPTION_QUERY}&dirflg=${flag}&output=embed`;
}

const Directions: React.FC = () => {
  const [activeMode, setActiveMode] = useState<TravelMode>('driving');
  const activeFlag = TRAVEL_MODES.find((m) => m.mode === activeMode)!.flag;

  return (
    <section className="section directions">
      <h2 className="section-title">Getting There</h2>
      <div className="section-divider-small"></div>

      {/* Venue maps */}
      <div className="directions-cards">
        <div className="direction-card">
          <div className="direction-icon">&#9769;</div>
          <h3>Mary the Queen Parish</h3>
          <p className="direction-area">Diocese of Novaliches, Quezon City</p>
          <p className="direction-text">
            Please arrive by <strong>10:30 AM</strong> to be seated before the ceremony starts at 11:00 AM.
          </p>
          <div className="map-embed-wrapper">
            <iframe
              title="Church location"
              src={embedUrl(CHURCH_QUERY)}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
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
          <h3>Lasa BBQ at SM Fairview</h3>
          <p className="direction-area">Reception Venue</p>
          <p className="direction-text">
            Located inside SM Fairview mall. Ample parking is available. Approximately 15–20 minutes from the church.
          </p>
          <div className="map-embed-wrapper">
            <iframe
              title="Reception location"
              src={embedUrl(RECEPTION_QUERY)}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
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

      {/* Directions between venues */}
      <div className="directions-route">
        <h3 className="route-title">Church → Reception</h3>

        <div className="travel-tabs">
          {TRAVEL_MODES.map(({ mode, label, icon }) => (
            <button
              key={mode}
              className={`travel-tab ${activeMode === mode ? 'travel-tab-active' : ''}`}
              onClick={() => setActiveMode(mode)}
            >
              <span>{icon}</span> {label}
            </button>
          ))}
        </div>

        <div className="map-embed-wrapper map-embed-large">
          <iframe
            key={activeMode}
            title={`Directions by ${activeMode}`}
            src={directionsUrl(activeFlag)}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <a
          href={`https://www.google.com/maps/dir/Mary+the+Queen+Parish,+Novaliches,+Quezon+City/SM+Fairview,+Quezon+City`}
          target="_blank"
          rel="noopener noreferrer"
          className="map-button"
          style={{ marginTop: '1rem', display: 'inline-block' }}
        >
          Open Directions in Google Maps
        </a>
      </div>
    </section>
  );
};

export default Directions;
