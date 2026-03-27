import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="not-found-page">
      <div className="not-found-card">
        <h1>404</h1>
        <p className="not-found-title">Page Not Found</p>
        <p className="not-found-text">
          The page you are looking for does not exist. If you received an
          invitation link, please check that it was entered correctly.
        </p>
        <Link to="/" className="btn btn-primary">
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
