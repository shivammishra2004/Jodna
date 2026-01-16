// To support: system="express" scale="medium" color="light"
import "@spectrum-web-components/theme/express/scale-medium.js";
import "@spectrum-web-components/theme/express/theme-light.js";

import { Theme } from "@swc-react/theme";
import React, { useState, useEffect } from "react";
import "./App.css";
import TestDashboard from "./TestDashboard";

// Import your components
import Header from "./Header";
import CreateOrganization from "./CreateOrganization";
import Home from "./Home";
import Projects from "./Projects";
import Tickets from "./Tickets";
import Organization from "./Organization";

const App = ({ addOnUISdk, sandboxProxy }) => {
    const [user, setUser] = useState(null);
    const [organization, setOrganization] = useState(null);
    const [currentTab, setCurrentTab] = useState('Projects');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Initialize and check authentication
        const initializeApp = async () => {
            try {
                // Check if user is authenticated (you'll replace this with your OAuth logic)
                const authStatus = await checkAuthStatus();
                
                if (authStatus) {
                    setIsAuthenticated(true);
                    // Fetch user data from your backend
                    const userData = await fetchUserData();
                    setUser(userData);
                    
                    // Fetch organization if user has one
                    if (userData.organization) {
                        const orgData = await fetchOrganization(userData.organization);
                        setOrganization(orgData);
                    }
                }
            } catch (error) {
                console.error('Initialization error:', error);
            } finally {
                setLoading(false);
            }
        };

        initializeApp();
    }, []);

    // Mock functions - replace with your actual API calls
    const checkAuthStatus = async () => {
        // TODO: Check if user has valid OAuth token
        // For now, return mock data
        return true;
    };

    const fetchUserData = async () => {
        // TODO: Fetch from your backend API
        // const response = await fetch('YOUR_BACKEND_URL/api/user', {
        //     credentials: 'include'
        // });
        // return await response.json();
        
        // Mock data for now
        return {
            id: '1',
            googleId: 'google123',
            email: 'user@example.com',
            displayName: 'John Doe',
            organization: null,
            role: 'ADMIN' // Change to 'MANAGER' or 'DESIGNER' to test different views
        };
    };

    const fetchOrganization = async (orgId) => {
        // TODO: Fetch organization data
        // const response = await fetch(`YOUR_BACKEND_URL/api/organizations/${orgId}`, {
        //     credentials: 'include'
        // });
        // return await response.json();
        return null;
    };

    const handleOrgCreated = async (org) => {
        setOrganization(org);
        setUser({ ...user, organization: org.id });
        
        // TODO: Update user in backend
        // await fetch(`YOUR_BACKEND_URL/api/users/${user.id}`, {
        //     method: 'PATCH',
        //     headers: { 'Content-Type': 'application/json' },
        //     credentials: 'include',
        //     body: JSON.stringify({ organization: org.id })
        // });
    };

    useEffect(() => {
        // Set default tab based on role
        if (user && user.role === 'DESIGNER') {
            setCurrentTab('Tickets');
        } else if (user && organization) {
            setCurrentTab('Projects');
        }
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

    // Show auth required (you'll replace this with OAuth flow)
    if (!isAuthenticated) {
        return (
            <Theme system="express" scale="medium" color="light">
                <div className="container auth-container">
                    <h2>Authentication Required</h2>
                    <p>Please sign in to continue</p>
                    <button onClick={() => {
                        // TODO: Trigger OAuth flow
                        console.log('Trigger OAuth');
                    }}>
                        Sign in with Google
                    </button>
                </div>
            </Theme>
        );
    }

    // Show create organization page
    if (!organization) {
        return (
            <Theme system="express" scale="medium" color="light">
                <CreateOrganization onOrgCreated={handleOrgCreated} user={user} />
            </Theme>
        );
    }

    // Render main app with header and pages
    const renderPage = () => {
        switch (currentTab) {
            case 'Projects':
                return <Projects user={user} sandboxProxy={sandboxProxy} />;
            case 'Tickets':
                return <Tickets user={user} />;
            case 'Organization':
                return <Organization organization={organization} user={user} />;
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
                />
                {renderPage()}
            </div>
        </Theme>
    );
};

export default App;