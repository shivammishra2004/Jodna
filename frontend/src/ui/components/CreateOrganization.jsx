import React, { useState } from 'react';
import axios from 'axios';
import './CreateOrganization.css';

import config from "../../config";
const { BACKEND_URL } = config;

const CreateOrganization = ({ onOrgCreated, user }) => {
  const [orgName, setOrgName] = useState('');
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
    if (!orgName.trim()) {
      setError('Organization name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/organizations`,
        { name: orgName },
        authConfig()
      );

      // Call parent callback with new organization data
      onOrgCreated(response.data);
    } catch (err) {
      console.error('Error creating organization:', err);
      setError(err.response?.data?.message || 'Failed to create organization');
      setLoading(false);
    }
  };

  return (
    <div className="create-org-container">
      <div className="create-org-card">
        <h1 className="create-org-title">Create Your Organization</h1>
        <p className="create-org-subtitle">
          Get started by creating your organization workspace
        </p>
        <div className="create-org-form">
          <div className="form-group">
            <label className="form-label">Organization Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., Acme Design Studio"
              value={orgName}
              onChange={(e) => {
                setOrgName(e.target.value);
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
            disabled={loading || !orgName.trim()}
          >
            {loading ? 'Creating...' : 'Create Organization'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateOrganization;