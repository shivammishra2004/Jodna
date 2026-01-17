import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Organization.css';
import refreshIcon from '../assets/refresh.svg';

import config from "../../config";
const { BACKEND_URL } = config;

const Organization = ({ organization, user, onLeave }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const isAdmin = user.role === 'ADMIN';

  const fetchMembers = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${BACKEND_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMembers(res.data);
    } catch (err) {
      console.error("Failed to fetch members", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (organization) {
      fetchMembers();
    }
  }, [organization]);

  const handleLeave = async () => {
    setLeaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${BACKEND_URL}/api/organizations/leave`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Call onLeave callback to update parent state and redirect
      if (onLeave) {
        onLeave();
      }
    } catch (err) {
      console.error("Error leaving organization:", err);
      alert(err.response?.data?.error || "Failed to leave organization");
      setLeaving(false);
      setShowLeaveConfirm(false);
    }
  };

  return (
    <div className="organization-container">
      <div className="organization-header">
        <div className="header-content">
          <div className="header-text">

            <p>Manage your organization settings and team members</p>
          </div>
          {!isAdmin && (
            <button
              onClick={() => setShowLeaveConfirm(true)}
              className="leave-org-button"
              disabled={leaving}
            >
              {leaving ? 'Leaving...' : 'Leave Organization'}
            </button>
          )}
        </div>

        {isAdmin && organization?.inviteCode && (
          <div className="invite-section">
            <strong>Invite Code:</strong>
            <div className="invite-code">{organization.inviteCode}</div>
            <p className="invite-hint">
              Share this code with team members to join. They can enter this code upon signup.
            </p>
          </div>
        )}
      </div>

      <div className="members-section">
        <div className="members-header">
          <h2>Team Members ({members.length})</h2>
          {isAdmin && !loading && (
            <button
              onClick={() => fetchMembers(true)}
              className="refresh-button"
              disabled={refreshing}
              title="Refresh members list"
            >
              <img 
                src={refreshIcon} 
                alt="Refresh" 
                className={`refresh-icon ${refreshing ? 'spinning' : ''}`}
                width="12"
                height="12"
              />
              {refreshing ? '...' : ''}
            </button>
          )}
        </div>
        {loading ? (
          <div className="loading-members">Loading members...</div>
        ) : members.length === 0 ? (
          <div className="no-members">No members found</div>
        ) : (
          <div className="members-list">
            {members.map(member => (
              <div key={member._id} className="member-card">
                <div className="member-info">
                  <div className="user-avatar">
                    {member.displayName ? member.displayName.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div className="member-details">
                    <div className="member-name-row">
                      <div className="member-name">{member.displayName}</div>
                      <span className={`role-badge role-${member.role?.toLowerCase()}`}>
                        {member.role}
                      </span>
                    </div>
                    <div className="member-email">{member.email}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Leave Organization Confirmation Modal */}
      {showLeaveConfirm && (
        <div className="modal-overlay" onClick={() => !leaving && setShowLeaveConfirm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Leave Organization</h2>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to leave <strong>{organization?.name}</strong>?</p>
              <p className="warning-text">
                You will lose access to all projects and tickets in this organization.
                You can rejoin later using an invite code.
              </p>
            </div>
            <div className="modal-actions">
              <button
                className="modal-button cancel-button"
                onClick={() => setShowLeaveConfirm(false)}
                disabled={leaving}
              >
                Cancel
              </button>
              <button
                className="modal-button confirm-button"
                onClick={handleLeave}
                disabled={leaving}
              >
                {leaving ? 'Leaving...' : 'Leave Organization'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Organization;