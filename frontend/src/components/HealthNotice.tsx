import React from 'react';

const HealthNotice: React.FC = () => {
  return (
    <div className="health-notice">
      <div className="health-notice-inner">
        <span className="health-notice-icon">🤍</span>
        <p className="health-notice-title">A Little Note from Danya's Family</p>
        <p className="health-notice-message">
          Danya was recently hospitalized and is still building up her little immune system.
          We would love to see everyone, but if you are feeling under the weather, even a
          mild cough, cold, or flu, we kindly ask that you wear a mask while at the
          ceremony and reception.
        </p>
        <p className="health-notice-sub">
          Thank you for your love and care in helping keep Danya safe and healthy on her
          special day.
        </p>
      </div>
    </div>
  );
};

export default HealthNotice;
