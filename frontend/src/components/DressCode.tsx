import React from 'react';

const DressCode: React.FC = () => {
  return (
    <section className="section dress-code">
      <h2 className="section-title">Dress Code</h2>
      <div className="section-divider-small"></div>

      <div className="dress-code-card">
        <p className="dress-code-note">
          Smart casual — it's the peak of summer, so dress light and comfortable!
        </p>
        <div className="dress-code-items">
          <div className="dress-code-item">
            <span className="dress-code-icon">👔</span>
            <div>
              <strong>Gentlemen</strong>
              <p>White polo or short-sleeved shirt</p>
            </div>
          </div>
          <div className="dress-code-item">
            <span className="dress-code-icon">👗</span>
            <div>
              <strong>Ladies</strong>
              <p>White outfit</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DressCode;
