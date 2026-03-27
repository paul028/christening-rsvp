import React from 'react';

interface HeaderProps {
  guestName?: string;
}

const Header: React.FC<HeaderProps> = ({ guestName }) => {
  return (
    <header className="header">
      <div className="header-decoration">
        <span className="header-ornament">&#10053;</span>
        <span className="header-ornament">&#10053;</span>
        <span className="header-ornament">&#10053;</span>
      </div>
      <p className="header-subtitle">You Are Cordially Invited</p>
      <h1 className="header-title">Our Baby's Christening</h1>
      <div className="header-divider">
        <span className="divider-line"></span>
        <span className="divider-icon">&#9829;</span>
        <span className="divider-line"></span>
      </div>
      {guestName && (
        <p className="header-guest">
          Dear <strong>{guestName}</strong>, we would be honored by your presence
        </p>
      )}
      <p className="header-date">May 16, 2026</p>
    </header>
  );
};

export default Header;
