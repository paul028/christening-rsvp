import React, { useState } from 'react';

interface HeaderProps {
  guestName?: string;
  sponsorRole?: 'ninong' | 'ninang' | null;
}

const CornerDeco: React.FC<{ flip?: boolean }> = ({ flip }) => (
  <svg
    className={`header-corner-deco ${flip ? 'header-corner-deco-right' : ''}`}
    viewBox="0 0 90 90"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    {/* large leaf */}
    <path d="M 10,80 C 15,55 40,35 70,10 C 45,30 25,55 10,80 Z" fill="#C9A84C" opacity="0.55" />
    {/* mid leaf */}
    <path d="M 5,65 C 18,45 45,28 75,18 C 48,32 20,50 5,65 Z" fill="#C9A84C" opacity="0.40" />
    {/* small leaf */}
    <path d="M 15,85 C 20,65 35,45 55,25 C 38,48 22,68 15,85 Z" fill="#8B5A6A" opacity="0.35" />
    {/* accent dots */}
    <circle cx="68" cy="12" r="2.5" fill="#C9A84C" opacity="0.5" />
    <circle cx="76" cy="20" r="2" fill="#C9A84C" opacity="0.4" />
    <circle cx="55" cy="22" r="2" fill="#8B5A6A" opacity="0.35" />
  </svg>
);

const WreathPhoto: React.FC = () => {
  const [photoError, setPhotoError] = useState(false);
  const size = 300;
  const cx = size / 2;
  const cy = size / 2;
  const photoR = 83;
  const wreathR = 108;
  const leafCount = 28;

  const leaves = Array.from({ length: leafCount }, (_, i) => {
    const angleDeg = i * (360 / leafCount);
    const rad = (angleDeg - 90) * (Math.PI / 180);
    const x = cx + wreathR * Math.cos(rad);
    const y = cy + wreathR * Math.sin(rad);
    const isMauve = i % 4 === 3;
    const isLarge = i % 7 === 0;
    const h = isLarge ? 14 : 11;
    const w = isLarge ? 6 : 4.5;
    return { x, y, angleDeg, isMauve, h, w };
  });

  const flowerAngles = [0, 60, 120, 180, 240, 300];
  const flowers = flowerAngles.map((a) => {
    const rad = (a - 90) * (Math.PI / 180);
    const r = wreathR + 10;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  });

  const dots = [30, 90, 150, 210, 270, 330].map((a) => {
    const rad = (a - 90) * (Math.PI / 180);
    const r = wreathR - 14;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  });

  return (
    <div className="wreath-container">
      {/* photo underneath */}
      {!photoError ? (
        <img
          className="danya-photo"
          src="/danya.jpg"
          alt="Danya"
          onError={() => setPhotoError(true)}
        />
      ) : (
        <div className="danya-photo-placeholder" />
      )}

      {/* wreath SVG on top */}
      <svg
        className="wreath-svg"
        viewBox={`0 0 ${size} ${size}`}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* leaves */}
        {leaves.map((leaf, i) => (
          <path
            key={i}
            d={`M 0,-${leaf.h} C ${leaf.w},-${+(leaf.h * 0.55).toFixed(1)} ${leaf.w},${+(leaf.h * 0.55).toFixed(1)} 0,${leaf.h} C -${leaf.w},${+(leaf.h * 0.55).toFixed(1)} -${leaf.w},-${+(leaf.h * 0.55).toFixed(1)} 0,-${leaf.h}`}
            fill={leaf.isMauve ? '#8B5A6A' : '#C9A84C'}
            opacity={leaf.isMauve ? 0.72 : 0.82}
            transform={`translate(${leaf.x.toFixed(1)},${leaf.y.toFixed(1)}) rotate(${leaf.angleDeg.toFixed(1)})`}
          />
        ))}

        {/* small flower clusters */}
        {flowers.map((f, i) => (
          <g key={i} transform={`translate(${f.x.toFixed(1)},${f.y.toFixed(1)})`}>
            {[0, 60, 120, 180, 240, 300].map((a) => (
              <ellipse
                key={a}
                rx="2.5"
                ry="5"
                fill="#C9A84C"
                opacity="0.65"
                transform={`rotate(${a}) translate(0,-3.5)`}
              />
            ))}
            <circle r="3" fill="#D4A84C" opacity="0.85" />
          </g>
        ))}

        {/* inner accent dots */}
        {dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r="2" fill="#C9A84C" opacity="0.45" />
        ))}

        {/* gold ring border */}
        <circle
          cx={cx}
          cy={cy}
          r={photoR}
          fill="none"
          stroke="#C9A84C"
          strokeWidth="2.5"
          opacity="0.9"
        />
      </svg>
    </div>
  );
};

const Header: React.FC<HeaderProps> = ({ guestName, sponsorRole }) => {
  const isSponsor = !!sponsorRole;
  const sponsorTitle =
    sponsorRole === 'ninong' ? 'Ninong' : sponsorRole === 'ninang' ? 'Ninang' : null;

  return (
    <header className="header">
      <div className="header-top-border" />

      <div className="header-corner-wrap header-corner-wrap-left">
        <CornerDeco />
      </div>
      <div className="header-corner-wrap header-corner-wrap-right">
        <CornerDeco flip />
      </div>

      <div className="header-inner">
        <WreathPhoto />

        <div className="header-title-block">
          <h1 className="header-baptism">BAPTISM</h1>
          <p className="header-of-label">of</p>
          <p className="header-baby-name">Danya Penelope</p>
        </div>

        {guestName && (
          <p className="header-tagline">
            Dear <em>{sponsorTitle ?? guestName}</em>
            {sponsorTitle && <span className="header-guest-name">&nbsp;{guestName}</span>}
            , we cordially invite you to celebrate with us on this special occasion.
          </p>
        )}
        {!guestName && (
          <p className="header-tagline">
            We cordially invite you to celebrate with us on this special occasion.
          </p>
        )}

        <div className="header-gold-divider">
          <span className="header-divider-line" />
          <span className="header-divider-ornament">❧</span>
          <span className="header-divider-line" />
        </div>

        <div className="header-event-row">
          <div className="header-event-col">
            <p className="header-event-label">Saturday</p>
            <p className="header-event-value">May 16, 2026</p>
            <p className="header-event-time">{isSponsor ? '10:00 AM' : '11:00 AM'}</p>
          </div>
          <div className="header-event-sep">
            <span className="header-church-icon">⛪</span>
          </div>
          <div className="header-event-col">
            <p className="header-event-label">Mary the Queen</p>
            <p className="header-event-value">Parish</p>
            <p className="header-event-sub">Quezon City</p>
          </div>
        </div>

        <div className="header-reception-divider">
          <span className="header-divider-line" />
          <span className="header-reception-dot">✦</span>
          <span className="header-divider-line" />
        </div>

        <div className="header-event-row">
          <div className="header-event-col">
            <p className="header-event-label">Reception</p>
            <p className="header-event-value">After the Ceremony</p>
            <p className="header-event-time">12:00 PM</p>
          </div>
          <div className="header-event-sep">
            <span className="header-church-icon">🍽️</span>
          </div>
          <div className="header-event-col">
            <p className="header-event-label">Lasa BBQ</p>
            <p className="header-event-value">SM Fairview</p>
            <p className="header-event-sub">Quezon City</p>
          </div>
        </div>

      </div>

      <div className="header-bottom-border" />
    </header>
  );
};

export default Header;
