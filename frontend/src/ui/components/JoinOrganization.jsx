import React, { useState } from 'react';
import axios from 'axios';
import './CreateOrganization.css'; // Reusing the same CSS as it's similar layout

const BACKEND_URL = 'http://localhost:5000';

const JoinOrganization = ({ onOrgJoined, user, onLogout }) => {
    const [inviteCode, setInviteCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const getToken = () => localStorage.getItem('token');

    const authConfig = () => {
        const token = getToken();
        return {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
    };

    const handleSubmit = async () => {
        if (!inviteCode.trim()) {
            setError('Invite code is required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await axios.post(
                `${BACKEND_URL}/api/organizations/join`,
                { inviteCode: inviteCode.trim() },
                authConfig()
            );

            // Call parent callback with joined organization data
            onOrgJoined(response.data);
        } catch (err) {
            console.error('Error joining organization:', err);
            setError(err.response?.data?.error || 'Failed to join organization. Invalid code?');
            setLoading(false);
        }
    };

    return (
        <div className="create-org-container">
            <div className="create-org-card">
                <h1 className="create-org-title">Join an Organization</h1>
                <p className="create-org-subtitle">
                    Enter the invite code provided by your administrator
                </p>
                <div className="create-org-form">
                    <div className="form-group">
                        <label className="form-label">Invite Code</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. a1b2c3d4"
                            value={inviteCode}
                            onChange={(e) => {
                                setInviteCode(e.target.value);
                                setError('');
                            }}
                            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                            disabled={loading}
                        />
                        {error && <p className="error-message">{error}</p>}
                    </div>
                    <button
                        onClick={handleSubmit}
                        className="btn-primary"
                        disabled={loading || !inviteCode.trim()}
                    >
                        {loading ? 'Joining...' : 'Join Organization'}
                    </button>
                </div>
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <button
                        onClick={onLogout}
                        style={{ background: 'none', border: 'none', color: '#6e6e6e', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </div>

    );
};

export default JoinOrganization;
