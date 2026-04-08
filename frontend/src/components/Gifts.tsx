import React from 'react';

const Gifts: React.FC = () => {
  return (
    <section className="section gifts">
      <h2 className="section-title">Gifts</h2>
      <div className="section-divider-small"></div>

      <div className="gifts-card">
        <div className="gifts-icon">🎀</div>

        <p className="gifts-message">
          Your presence at Danya's Baptism is the greatest gift of all. However, if you
          wish to give, we kindly ask that you consider a <strong>monetary gift</strong> in
          lieu of traditional presents.
        </p>

        <div className="gifts-purpose">
          <div className="gifts-purpose-item">
            <span className="gifts-purpose-icon">🎓</span>
            <div>
              <strong>Education Fund</strong>
              <p>Contributions will be set aside to support Danya's future education.</p>
            </div>
          </div>
          <div className="gifts-purpose-item">
            <span className="gifts-purpose-icon">📈</span>
            <div>
              <strong>Investment Portfolio</strong>
              <p>A portion will be invested to grow alongside Danya as she grows up.</p>
            </div>
          </div>
        </div>

        <p className="gifts-note">
          Monetary gifts may be handed to the family during the reception. Thank you for your
          generosity and love for our little one. 💛
        </p>
      </div>
    </section>
  );
};

export default Gifts;
