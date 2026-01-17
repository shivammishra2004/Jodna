import React, { useState } from 'react';
import './JoinOrganization.css';

const BACKEND_URL = 'http://localhost:5000';

const JoinOrganization = ({ onOrgJoined, user, onLogout }) => {
  const [mode, setMode] = useState('join');
  const [inviteCode, setInviteCode] = useState('');
  const [orgName, setOrgName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getToken = () => localStorage.getItem('token');
  const authConfig = () => {
    const token = getToken();
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const handleJoin = async () => {
    if (!inviteCode.trim()) {
      setError('Invite code is required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${BACKEND_URL}/api/organizations/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authConfig().headers
        },
        body: JSON.stringify({ inviteCode: inviteCode.trim() })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to join');
      onOrgJoined(data);
    } catch (err) {
      console.error('Error joining organization:', err);
      setError(err.message || 'Failed to join organization. Invalid code?');
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!orgName.trim()) {
      setError('Organization name is required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${BACKEND_URL}/api/organizations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authConfig().headers
        },
        body: JSON.stringify({ name: orgName })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to create');
      onOrgJoined(data);
    } catch (err) {
      console.error('Error creating organization:', err);
      setError(err.message || 'Failed to create organization');
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    mode === 'join' ? handleJoin() : handleCreate();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="join-org-container">
      <div className="join-org-content">
        <div className="header">
          <div className="logo-icon">✨</div>
          <h1 className="title">Welcome to Jodna</h1>
          <p className="subtitle">
            {mode === 'join' 
              ? 'Join your team with an invite code' 
              : 'Create a new workspace for your team'}
          </p>
        </div>

        <div className="card">
          <div className="mode-toggle">
            <button
              onClick={() => { setMode('join'); setError(''); }}
              className={`toggle-btn ${mode === 'join' ? 'active' : ''}`}
            >
              👥 Join
            </button>
            <button
              onClick={() => { setMode('create'); setError(''); }}
              className={`toggle-btn ${mode === 'create' ? 'active' : ''}`}
            >
              ➕ Create
            </button>
          </div>

          <div className="form-content">
            {mode === 'join' ? (
              <div className="form-group">
                <label className="form-label">Invite Code</label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => { setInviteCode(e.target.value); setError(''); }}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter invite code"
                  disabled={loading}
                  autoFocus
                  className="form-input"
                />
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">Organization Name</label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => { setOrgName(e.target.value); setError(''); }}
                  onKeyPress={handleKeyPress}
                  placeholder="e.g., Acme Corp"
                  disabled={loading}
                  autoFocus
                  className="form-input"
                />
              </div>
            )}

            {error && (
              <div className="error-message">
                <span className="error-icon">!</span>
                <p>{error}</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="submit-btn"
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  {mode === 'join' ? 'Joining...' : 'Creating...'}
                </>
              ) : (
                <>
                  {mode === 'join' ? '👥 Join Organization' : '🏢 Create Organization'}
                </>
              )}
            </button>
          </div>
        </div>

        <button onClick={onLogout} className="logout-btn">
          🚪 Sign Out
        </button>

        {user && (
          <p className="user-info">
            Signed in as <span className="user-email">{user.email || user.username}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default JoinOrganization;