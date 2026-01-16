// To support: system="express" scale="medium" color="light"
import "@spectrum-web-components/theme/express/scale-medium.js";
import "@spectrum-web-components/theme/express/theme-light.js";

import { Theme } from "@swc-react/theme";
import React, { useState, useEffect } from "react";
import axios from 'axios';
import "./App.css";

// Import your components
import Header from "./Header";
import CreateOrganization from "./CreateOrganization";
import JoinOrganization from "./JoinOrganization";
import Home from "./Home";
import Projects from "./Projects";
import Tickets from "./Tickets";
import Organization from "./Organization";
import Assets from "./Assets";
import NoOrganizationMessage from "./NoOrganizationMessage";
import Login from "./Login";

const BACKEND_URL = 'http://localhost:5000';

const App = ({ addOnUISdk, sandboxProxy }) => {
    const [user, setUser] = useState(null);
    const [organization, setOrganization] = useState(null);
    const [currentTab, setCurrentTab] = useState('Projects');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    const getToken = () => localStorage.getItem('token');

    const authConfig = () => {
        const token = getToken();
        return {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
    };

    const fetchUserData = async () => {
        try {
            const token = getToken();
            if (!token) return null;

            const response = await axios.get(`${BACKEND_URL}/auth/me`, authConfig());
            return response.data;
        } catch (error) {
            console.error('Error fetching user:', error);
            if (error.response && error.response.status === 401) {
                localStorage.removeItem('token');
                setIsAuthenticated(false);
                setUser(null);
            }
            return null;
        }
    };

    const fetchOrganization = async (orgId) => {
        try {
            const token = getToken();
            const response = await axios.get(`${BACKEND_URL}/api/organizations/my`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (err) {
            console.error("Error fetching org:", err);
            return null;
        }
    };

    const handleLogout = () => {
        // Clear token
        localStorage.removeItem('token');

        // Reset state
        setUser(null);
        setOrganization(null);
        setIsAuthenticated(false);
        setCurrentTab('Projects'); // Optional: reset to default tab
    };


    const initializeApp = async () => {
        setLoading(true);
        try {
            const token = getToken();
            if (token) {
                const userData = await fetchUserData();
                if (userData) {
                    setIsAuthenticated(true);
                    setUser(userData);

                    if (userData.organization) {
                        const orgData = await fetchOrganization(userData.organization);
                        setOrganization(orgData);
                    }
                } else {
                    setIsAuthenticated(false);
                }
            } else {
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error('Initialization error:', error);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        initializeApp();
    }, []);

    const handleLoginSuccess = async (data) => {
        // Store token if not already stored by Login component
        if (data.token) {
            localStorage.setItem('token', data.token);
        }

        // Set authentication state immediately
        setIsAuthenticated(true);

        // Use the same structure as returned from backend
        const userData = {
            _id: data._id,
            displayName: data.displayName,
            email: data.email,
            organization: data.organization,
            role: data.role
        };

        setUser(userData);

        // Fetch organization if exists
        if (data.organization) {
            try {
                const orgData = await fetchOrganization(data.organization);
                setOrganization(orgData);
            } catch (error) {
                console.error('Error fetching organization:', error);
            }
        } else {
            setOrganization(null);
        }

        // Force a re-render by setting loading state
        setLoading(false);
    };

    const handleOrgCreated = async (org) => {
        setOrganization(org);

        // Refresh user to get updated role and org ID
        const userData = await fetchUserData();
        if (userData) {
            setUser(userData);
        }
    };

    const handleOrgLeft = async () => {
        setOrganization(null);
        // Refresh user to get updated role (reset to DESIGNER) and org ID (null)
        const userData = await fetchUserData();
        if (userData) {
            setUser(userData);
        }
    };

    useEffect(() => {
        // Set default tab based on role
        if (!user) return;

        // Force Projects for now
        setCurrentTab('Projects');
    }, [user, organization]);

    // Show loading state
    if (loading) {
        return (
            <Theme system="express" scale="medium" color="light">
                <div className="container loading-container">
                    <p>Loading...</p>
                </div>
            </Theme>
        );
    }

    // Show login page if not authenticated
    if (!isAuthenticated) {
        return (
            <Theme system="express" scale="medium" color="light">
                <Login onLoginSuccess={handleLoginSuccess} addOnUISdk={addOnUISdk} />
            </Theme>
        );
    }

    // Check user role and organization status
    const isAdmin = user && user.role === 'ADMIN';
    const hasOrganization = organization !== null;
    
    // Admin without organization -> Create Organization
    if (isAdmin && !hasOrganization) {
        return (
            <Theme system="express" scale="medium" color="light">
                <div className="app-container">
                    <CreateOrganization onOrgCreated={handleOrgCreated} user={user} />
                </div>
            </Theme>
        );
    }

    // Non-admin without organization -> Show Join Organization Screen
    if (!isAdmin && !hasOrganization) {
        return (
            <Theme system="express" scale="medium" color="light">
                <div className="app-container">
                    <JoinOrganization onOrgJoined={handleOrgCreated} user={user} onLogout={handleLogout} />
                </div>
            </Theme>
        );
    }

    // Has organization (admin or non-admin) -> Show full app
    const renderPage = () => {
        switch (currentTab) {
            case 'Projects':
                return <Projects user={user} sandboxProxy={sandboxProxy} />;
            case 'Tickets':
                return <Tickets user={user} />;
            case 'Organization':
                return <Organization organization={organization} user={user} onLeave={handleOrgLeft} />;
            case 'Assets':
                return <Assets user={user} organization={organization} sandboxProxy={sandboxProxy} />;
            default:
                return <Home user={user} organization={organization} />;
        }
    };

    return (
        <Theme system="express" scale="medium" color="light">
            <div className="app-container">
                <Header
                    currentTab={currentTab}
                    setCurrentTab={setCurrentTab}
                    user={user}
                    onLogout={handleLogout}
                />
                {renderPage()}
            </div>
        </Theme>
    );
};

export default App;