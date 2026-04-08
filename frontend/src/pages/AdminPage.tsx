import React, { useEffect, useState, useCallback } from 'react';
import type { Guest, RsvpStats } from '../types';
import {
  getAdminGuests,
  addGuest,
  updateGuest,
  deleteGuest,
  getStats,
  getAdminRsvpWindow,
  setAdminRsvpWindow,
} from '../api/client';
import type { RsvpWindowStatus } from '../types';

const AdminPage: React.FC = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [stats, setStats] = useState<RsvpStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Add guest form
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newMaxCompanions, setNewMaxCompanions] = useState(0);
  const [newSponsorRole, setNewSponsorRole] = useState<'ninong' | 'ninang' | ''>('');
  const [addLoading, setAddLoading] = useState(false);
  const [lastAddedGuest, setLastAddedGuest] = useState<Guest | null>(null);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editMaxCompanions, setEditMaxCompanions] = useState(0);
  const [editSponsorRole, setEditSponsorRole] = useState<'ninong' | 'ninang' | ''>('');

  // RSVP window
  const [rsvpWindow, setRsvpWindow] = useState<RsvpWindowStatus | null>(null);
  const [windowStart, setWindowStart] = useState('');
  const [windowEnd, setWindowEnd] = useState('');
  const [windowSaving, setWindowSaving] = useState(false);

  // Copied URL feedback
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const toLocalDatetimeInput = (iso: string) => {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const toIsoFromInput = (local: string) => local ? new Date(local).toISOString() : null;

  const handleSaveWindow = async () => {
    setWindowSaving(true);
    try {
      const updated = await setAdminRsvpWindow(toIsoFromInput(windowStart), toIsoFromInput(windowEnd));
      setRsvpWindow(updated);
    } catch {
      setError('Failed to save RSVP window.');
    } finally {
      setWindowSaving(false);
    }
  };

  const handleClearWindow = async () => {
    setWindowSaving(true);
    try {
      const updated = await setAdminRsvpWindow(null, null);
      setRsvpWindow(updated);
      setWindowStart('');
      setWindowEnd('');
    } catch {
      setError('Failed to clear RSVP window.');
    } finally {
      setWindowSaving(false);
    }
  };

  const fetchData = useCallback(async () => {
    try {
      const [guestsData, statsData, windowData] = await Promise.all([
        getAdminGuests(),
        getStats(),
        getAdminRsvpWindow(),
      ]);
      setGuests(guestsData);
      setStats(statsData);
      setRsvpWindow(windowData);
      setWindowStart(windowData.start_date ? toLocalDatetimeInput(windowData.start_date) : '');
      setWindowEnd(windowData.end_date ? toLocalDatetimeInput(windowData.end_date) : '');
    } catch {
      setError('Failed to load data. Is the API server running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setAddLoading(true);
    try {
      const guest = await addGuest(
        newName.trim(),
        newEmail.trim() || undefined,
        newPhone.trim() || undefined,
        newMaxCompanions,
        newSponsorRole || null,
      );
      setLastAddedGuest(guest);
      setNewName('');
      setNewEmail('');
      setNewPhone('');
      setNewMaxCompanions(0);
      setNewSponsorRole('');
      await fetchData();
    } catch {
      setError('Failed to add guest.');
    } finally {
      setAddLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this guest?')) return;
    try {
      await deleteGuest(id);
      await fetchData();
    } catch {
      setError('Failed to delete guest.');
    }
  };

  const startEdit = (guest: Guest) => {
    setEditingId(guest.id);
    setEditName(guest.name);
    setEditEmail(guest.email || '');
    setEditPhone(guest.phone || '');
    setEditMaxCompanions(guest.max_companions);
    setEditSponsorRole(guest.sponsor_role ?? '');
  };

  const handleUpdate = async () => {
    if (!editingId || !editName.trim()) return;
    try {
      await updateGuest(
        editingId,
        editName.trim(),
        editEmail.trim() || undefined,
        editPhone.trim() || undefined,
        editMaxCompanions,
        editSponsorRole || null,
      );
      setEditingId(null);
      await fetchData();
    } catch {
      setError('Failed to update guest.');
    }
  };

  const copyUrl = (token: string) => {
    const base = import.meta.env.VITE_PUBLIC_URL || window.location.origin;
    const url = `${base}/rsvp/${token}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedToken(token);
        setTimeout(() => setCopiedToken(null), 2000);
      });
    } else {
      const ta = document.createElement('textarea');
      ta.value = url;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 2000);
    }
  };

  const filteredGuests = guests.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      (g.email && g.email.toLowerCase().includes(search.toLowerCase()));
    const matchesFilter =
      filterStatus === 'all' || g.rsvp_status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const statusColor = (status: string) => {
    switch (status) {
      case 'attending':
        return '#4caf50';
      case 'not_attending':
        return '#f44336';
      default:
        return '#ff9800';
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'attending':
        return 'Attending';
      case 'not_attending':
        return 'Not Attending';
      default:
        return 'Pending';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Christening RSVP Dashboard</h1>
      </div>

      {error && (
        <div className="admin-error">
          <p>{error}</p>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Guests</div>
          </div>
          <div className="stat-card stat-attending">
            <div className="stat-number">{stats.attending}</div>
            <div className="stat-label">Attending</div>
          </div>
          <div className="stat-card stat-not-attending">
            <div className="stat-number">{stats.not_attending}</div>
            <div className="stat-label">Not Attending</div>
          </div>
          <div className="stat-card stat-pending">
            <div className="stat-number">{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card stat-companions">
            <div className="stat-number">{stats.total_companions}</div>
            <div className="stat-label">Total Companions</div>
          </div>
          <div className="stat-card stat-headcount">
            <div className="stat-number">{stats.attending_headcount}</div>
            <div className="stat-label">Total Attending</div>
          </div>
        </div>
      )}

      {/* RSVP Window */}
      <div className="admin-card">
        <h2>
          RSVP Window
          {rsvpWindow && (
            <span className={`window-status-badge ${rsvpWindow.is_open ? 'window-open' : 'window-closed'}`}>
              {rsvpWindow.is_open ? 'Open' : 'Closed'}
            </span>
          )}
        </h2>
        <p className="window-hint">
          Set the period during which guests may submit or edit their RSVP. Leave blank for no restriction.
        </p>
        <div className="window-form">
          <label>
            Start
            <input
              type="datetime-local"
              value={windowStart}
              onChange={(e) => setWindowStart(e.target.value)}
            />
          </label>
          <label>
            End
            <input
              type="datetime-local"
              value={windowEnd}
              onChange={(e) => setWindowEnd(e.target.value)}
            />
          </label>
        </div>
        <div className="window-actions">
          <button className="btn btn-primary" onClick={handleSaveWindow} disabled={windowSaving}>
            {windowSaving ? 'Saving...' : 'Save Window'}
          </button>
          <button className="btn btn-secondary" onClick={handleClearWindow} disabled={windowSaving}>
            Clear
          </button>
        </div>
      </div>

      {/* Add Guest Form */}
      <div className="admin-card">
        <h2>Add New Guest</h2>
        <form className="add-guest-form" onSubmit={handleAddGuest}>
          <input
            type="text"
            placeholder="Name *"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email (optional)"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
          <input
            type="tel"
            placeholder="Phone (optional)"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
          />
          <input
            type="number"
            placeholder="Max companions"
            min="0"
            value={newMaxCompanions}
            onChange={(e) => setNewMaxCompanions(parseInt(e.target.value) || 0)}
          />
          <select
            value={newSponsorRole}
            onChange={(e) => setNewSponsorRole(e.target.value as 'ninong' | 'ninang' | '')}
          >
            <option value="">Not a sponsor</option>
            <option value="ninong">Ninong (Male)</option>
            <option value="ninang">Ninang (Female)</option>
          </select>
          <button type="submit" className="btn btn-primary" disabled={addLoading}>
            {addLoading ? 'Adding...' : 'Add Guest'}
          </button>
        </form>
        {lastAddedGuest && (
          <div className="added-guest-info">
            <p>
              <strong>{lastAddedGuest.name}</strong> added successfully!
            </p>
            <div className="rsvp-url-display">
              <code>{import.meta.env.VITE_PUBLIC_URL || window.location.origin}/rsvp/{lastAddedGuest.token}</code>
              <button
                className="btn-copy"
                onClick={() => copyUrl(lastAddedGuest.token)}
              >
                {copiedToken === lastAddedGuest.token ? 'Copied!' : 'Copy URL'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Guest List */}
      <div className="admin-card">
        <h2>Guest List ({filteredGuests.length})</h2>
        <div className="guest-filters">
          <input
            type="text"
            className="search-input"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="attending">Attending</option>
            <option value="not_attending">Not Attending</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <div className="table-wrapper">
          <table className="guest-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Max</th>
                <th>Companions</th>
                <th>Message</th>
                <th>RSVP Link</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGuests.map((guest) => (
                <tr key={guest.id}>
                  {editingId === guest.id ? (
                    <>
                      <td>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="edit-input"
                        />
                      </td>
                      <td>
                        <input
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          className="edit-input"
                        />
                      </td>
                      <td>
                        <input
                          type="tel"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          className="edit-input"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          value={editMaxCompanions}
                          onChange={(e) => setEditMaxCompanions(parseInt(e.target.value) || 0)}
                          className="edit-input"
                          style={{ width: '60px' }}
                        />
                      </td>
                      <td>
                        <select
                          value={editSponsorRole}
                          onChange={(e) => setEditSponsorRole(e.target.value as 'ninong' | 'ninang' | '')}
                          className="edit-input"
                        >
                          <option value="">None</option>
                          <option value="ninong">Ninong</option>
                          <option value="ninang">Ninang</option>
                        </select>
                      </td>
                      <td colSpan={1}></td>
                      <td></td>
                      <td className="action-cell">
                        <button className="btn-action btn-save" onClick={handleUpdate}>
                          Save
                        </button>
                        <button
                          className="btn-action btn-cancel"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{guest.name}</td>
                      <td>
                        {guest.sponsor_role && (
                          <span className={`sponsor-badge sponsor-badge-${guest.sponsor_role}`}>
                            {guest.sponsor_role === 'ninong' ? 'Ninong' : 'Ninang'}
                          </span>
                        )}
                      </td>
                      <td>{guest.email || '—'}</td>
                      <td>{guest.phone || '—'}</td>
                      <td>
                        <span
                          className="table-status-badge"
                          style={{
                            backgroundColor: statusColor(guest.rsvp_status),
                          }}
                        >
                          {statusLabel(guest.rsvp_status)}
                        </span>
                      </td>
                      <td>{guest.max_companions}</td>
                      <td>
                        {guest.companions.length === 0 ? '—' : (
                          <ul style={{ margin: 0, padding: '0 0 0 1rem' }}>
                            {guest.companions.map((c, i) => (
                              <li key={i}>{c.first_name} {c.last_name}</li>
                            ))}
                          </ul>
                        )}
                      </td>
                      <td className="message-cell">
                        {guest.message
                          ? guest.message.length > 30
                            ? guest.message.slice(0, 30) + '...'
                            : guest.message
                          : '—'}
                      </td>
                      <td>
                        <button
                          className="btn-copy-small"
                          onClick={() => copyUrl(guest.token)}
                        >
                          {copiedToken === guest.token ? 'Copied!' : 'Copy URL'}
                        </button>
                      </td>
                      <td className="action-cell">
                        <button
                          className="btn-action btn-edit"
                          onClick={() => startEdit(guest)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-action btn-delete"
                          onClick={() => handleDelete(guest.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {filteredGuests.length === 0 && (
                <tr>
                  <td colSpan={10} className="empty-row">
                    No guests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
