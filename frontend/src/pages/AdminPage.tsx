import React, { useEffect, useState, useCallback } from 'react';
import type { Guest, RsvpStats } from '../types';
import {
  getAdminGuests,
  addGuest,
  updateGuest,
  deleteGuest,
  getStats,
} from '../api/client';

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
  const [addLoading, setAddLoading] = useState(false);
  const [lastAddedGuest, setLastAddedGuest] = useState<Guest | null>(null);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');

  // Copied URL feedback
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [guestsData, statsData] = await Promise.all([
        getAdminGuests(),
        getStats(),
      ]);
      setGuests(guestsData);
      setStats(statsData);
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
        newPhone.trim() || undefined
      );
      setLastAddedGuest(guest);
      setNewName('');
      setNewEmail('');
      setNewPhone('');
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
  };

  const handleUpdate = async () => {
    if (!editingId || !editName.trim()) return;
    try {
      await updateGuest(
        editingId,
        editName.trim(),
        editEmail.trim() || undefined,
        editPhone.trim() || undefined
      );
      setEditingId(null);
      await fetchData();
    } catch {
      setError('Failed to update guest.');
    }
  };

  const copyUrl = (token: string) => {
    const url = `${window.location.origin}/rsvp/${token}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 2000);
    });
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
        </div>
      )}

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
              <code>{window.location.origin}/rsvp/{lastAddedGuest.token}</code>
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
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
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
                      <td colSpan={3}></td>
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
                      <td>{guest.number_of_companions}</td>
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
                  <td colSpan={8} className="empty-row">
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
