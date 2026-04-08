import React from 'react';

interface Props {
  role: 'ninong' | 'ninang';
}

const SponsorNotice: React.FC<Props> = ({ role }) => {
  const title = role === 'ninong' ? 'Ninong' : 'Ninang';

  return (
    <div className="sponsor-notice">
      <div className="sponsor-notice-inner">
        <p className="sponsor-notice-label">To my {title}</p>
        <p className="sponsor-notice-message">
          As my {title}, I would love for you to be there a little earlier —
          please arrive at the church by
        </p>
        <p className="sponsor-notice-time">10:00 AM</p>
        <p className="sponsor-notice-sub">
          one hour before my baptism begins, so you can be by my side
          as I am welcomed into the faith 🤍
        </p>
      </div>
    </div>
  );
};

export default SponsorNotice;
