import React, { useState } from 'react';
import type { Guest, RsvpRequest } from '../types';
import { submitRsvp } from '../api/client';

interface RsvpFormProps {
  guest: Guest;
  onUpdate: (guest: Guest) => void;
}

const RsvpForm: React.FC<RsvpFormProps> = ({ guest, onUpdate }) => {
  const hasResponded = guest.rsvp_status !== 'pending';
  const [isEditing, setIsEditing] = useState(!hasResponded);
  const [status, setStatus] = useState<'attending' | 'not_attending'>(
    guest.rsvp_status === 'not_attending' ? 'not_attending' : 'attending'
  );
  const [companions, setCompanions] = useState(guest.number_of_companions);
  const [dietary, setDietary] = useState(guest.dietary_restrictions || '');
  const [message, setMessage] = useState(guest.message || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const data: RsvpRequest = {
      rsvp_status: status,
      number_of_companions: status === 'attending' ? companions : 0,
      dietary_restrictions: dietary.trim() || null,
      message: message.trim() || null,
    };

    try {
      const updated = await submitRsvp(guest.token, data);
      onUpdate(updated);
      setIsEditing(false);
      setShowConfirmation(true);
      setTimeout(() => setShowConfirmation(false), 5000);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section rsvp-section">
      <h2 className="section-title">RSVP</h2>
      <div className="section-divider-small"></div>

      {showConfirmation && (
        <div className="confirmation-message">
          <span className="confirmation-icon">&#10003;</span>
          <p>
            {status === 'attending'
              ? 'Thank you! We look forward to celebrating with you!'
              : 'Thank you for letting us know. You will be missed!'}
          </p>
        </div>
      )}

      {hasResponded && !isEditing ? (
        <div className="rsvp-response-card">
          <h3>Your Response</h3>
          <div className="response-details">
            <p>
              <strong>Status:</strong>{' '}
              <span
                className={`status-badge status-${guest.rsvp_status}`}
              >
                {guest.rsvp_status === 'attending'
                  ? 'Joyfully Attending'
                  : 'Regretfully Declining'}
              </span>
            </p>
            {guest.rsvp_status === 'attending' && guest.number_of_companions > 0 && (
              <p>
                <strong>Companions:</strong> {guest.number_of_companions}
              </p>
            )}
            {guest.dietary_restrictions && (
              <p>
                <strong>Dietary Restrictions:</strong> {guest.dietary_restrictions}
              </p>
            )}
            {guest.message && (
              <p>
                <strong>Message:</strong> {guest.message}
              </p>
            )}
          </div>
          <button
            className="btn btn-secondary"
            onClick={() => setIsEditing(true)}
          >
            Update My Response
          </button>
        </div>
      ) : (
        <form className="rsvp-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Guest Name</label>
            <input
              type="text"
              className="form-input"
              value={guest.name}
              disabled
            />
          </div>

          <div className="form-group">
            <label className="form-label">Will you be joining us?</label>
            <div className="radio-group">
              <label className={`radio-card ${status === 'attending' ? 'radio-card-selected' : ''}`}>
                <input
                  type="radio"
                  name="rsvp_status"
                  value="attending"
                  checked={status === 'attending'}
                  onChange={() => setStatus('attending')}
                />
                <span className="radio-card-icon">&#127881;</span>
                <span className="radio-card-text">Joyfully Attending</span>
              </label>
              <label className={`radio-card ${status === 'not_attending' ? 'radio-card-selected' : ''}`}>
                <input
                  type="radio"
                  name="rsvp_status"
                  value="not_attending"
                  checked={status === 'not_attending'}
                  onChange={() => setStatus('not_attending')}
                />
                <span className="radio-card-icon">&#128532;</span>
                <span className="radio-card-text">Regretfully Declining</span>
              </label>
            </div>
          </div>

          {status === 'attending' && (
            <div className="form-group">
              <label className="form-label">Number of Companions</label>
              <input
                type="number"
                className="form-input"
                min="0"
                max="10"
                value={companions}
                onChange={(e) => setCompanions(parseInt(e.target.value) || 0)}
              />
              <small className="form-hint">
                How many additional guests will you bring?
              </small>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Dietary Restrictions (optional)</label>
            <input
              type="text"
              className="form-input"
              value={dietary}
              onChange={(e) => setDietary(e.target.value)}
              placeholder="e.g., vegetarian, allergies..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Message for the Family (optional)</label>
            <textarea
              className="form-textarea"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share your warm wishes..."
              rows={4}
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <button
            type="submit"
            className="btn btn-primary btn-submit"
            disabled={loading}
          >
            {loading ? 'Sending...' : hasResponded ? 'Update RSVP' : 'Send RSVP'}
          </button>

          {hasResponded && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsEditing(false)}
              style={{ marginTop: '0.5rem' }}
            >
              Cancel
            </button>
          )}
        </form>
      )}
    </section>
  );
};

export default RsvpForm;
