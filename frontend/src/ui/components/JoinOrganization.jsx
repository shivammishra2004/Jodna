import React, { useState } from 'react';
import { Users, PlusCircle, LogOut, ArrowRight, Hash, Type, AlertCircle, Loader2 } from 'lucide-react';
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
        <div className="card">
          <div className="header">
            <div className="logo-wrapper">
              <img src={require("../assets/logo.png")} alt="Jodna" className="logo-icon" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <h1 className="title">Welcome to Jodna</h1>
            {/* <p className="subtitle">
              {mode === 'join' 
                ? 'Enter your invite code to collaborate with your team' 
                : 'Create a new workspace to start your journey'}
            </p> */}
          </div>

          <div className="mode-toggle">
            <button
              onClick={() => { setMode('join'); setError(''); }}
              className={`toggle-btn ${mode === 'join' ? 'active' : ''}`}
            >
              <Users size={18} /> Join Team
            </button>
            <button
              onClick={() => { setMode('create'); setError(''); }}
              className={`toggle-btn ${mode === 'create' ? 'active' : ''}`}
            >
              <PlusCircle size={18} /> Create New
            </button>
          </div>

          <div className="form-content">
            {mode === 'join' ? (
              <div className="form-group">
                <label className="form-label">Invite Code</label>
                <div className="input-wrapper">
                  {/* <Hash className="input-icon" size={18} /> */}
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => { setInviteCode(e.target.value); setError(''); }}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter 6-digit code"
                    disabled={loading}
                    autoFocus
                    className="form-input"
                  />
                </div>
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">Organization Name</label>
                <div className="input-wrapper">
                  {/* <Type className="input-icon" size={18} /> */}
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => { setOrgName(e.target.value); setError(''); }}
                    onKeyPress={handleKeyPress}
                    placeholder="e.g. Acme Design Studio"
                    disabled={loading}
                    autoFocus
                    className="form-input"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="error-message">
                <AlertCircle className="error-icon" />
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
                  <Loader2 className="spinner" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{mode === 'join' ? 'Join Organization' : 'Create Workspace'}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>

        <div className="footer-section">
          <button onClick={onLogout} className="logout-btn">
            <LogOut size={14} /> Sign Out
          </button>

          {user && (
            <p className="user-info">
              Signed in as <span className="user-email">{user.email || user.username}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default JoinOrganization;