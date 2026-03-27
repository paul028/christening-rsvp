import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { Guest } from '../types';
import { getGuestByToken } from '../api/client';
import Header from '../components/Header';
import EventDetails from '../components/EventDetails';
import PhotoGallery from '../components/PhotoGallery';
import RsvpForm from '../components/RsvpForm';
import Directions from '../components/Directions';
import FAQ from '../components/FAQ';

const RsvpPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [guest, setGuest] = useState<Guest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    getGuestByToken(token)
      .then(setGuest)
      .catch(() => setError('Invalid or expired invitation link.'))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your invitation...</p>
      </div>
    );
  }

  if (error || !guest) {
    return (
      <div className="error-container">
        <div className="error-card">
          <h2>Oops!</h2>
          <p>{error || 'Something went wrong.'}</p>
          <p className="error-hint">
            Please check your invitation link or contact the family.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rsvp-page">
      <Header guestName={guest.name} />
      <EventDetails />
      <PhotoGallery />
      <RsvpForm guest={guest} onUpdate={setGuest} />
      <Directions />
      <FAQ />
      <footer className="page-footer">
        <p>With love and blessings</p>
        <p className="footer-heart">&#9829;</p>
      </footer>
    </div>
  );
};

export default RsvpPage;
