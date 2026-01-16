import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = 'http://localhost:5000';

const TestDashboard = () => {
    const [user, setUser] = useState(null);
    const [orgName, setOrgName] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    const [tickets, setTickets] = useState([]);
    const [newTicket, setNewTicket] = useState({ title: '', description: '' });
    const [loading, setLoading] = useState(true);

    // Fetch user on mount
    useEffect(() => {
        const fetchUser = async () => {
            try {
                // We must set withCredentials to true for cookies
                const res = await axios.get(`${BACKEND_URL}/auth/current_user`, { withCredentials: true });
                if (res.data) {
                    setUser(res.data);
                    if (res.data.organization) {
                        fetchTickets();
                    }
                }
            } catch (err) {
                console.error("Not logged in or error", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const fetchTickets = async () => {
        try {
            const res = await axios.get(`${BACKEND_URL}/api/tickets`, { withCredentials: true });
            setTickets(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateOrg = async () => {
        try {
            const res = await axios.post(`${BACKEND_URL}/api/organizations`, { name: orgName }, { withCredentials: true });
            setUser(prev => ({ ...prev, organization: res.data._id, role: 'ADMIN' })); // Optimistic update
            alert('Organization Created!');
            // window.location.reload(); 
        } catch (err) {
            console.error(err);
            alert('Error creating org');
        }
    };

    const handleJoinOrg = async () => {
        try {
            const res = await axios.post(`${BACKEND_URL}/api/organizations/join`, { inviteCode }, { withCredentials: true });
            alert('Joined Organization!');
            // Refetch user to get updated org details
            const userRes = await axios.get(`${BACKEND_URL}/auth/current_user`, { withCredentials: true });
            setUser(userRes.data);
            fetchTickets();
        } catch (err) {
            console.error(err);
            alert('Invalid code');
        }
    };

    const handleCreateTicket = async () => {
        try {
            await axios.post(`${BACKEND_URL}/api/tickets`, { ...newTicket }, { withCredentials: true });
            setNewTicket({ title: '', description: '' });
            fetchTickets();
        } catch (err) {
            console.error(err);
            alert('Error creating ticket (Are you a Manager/Admin?)');
        }
    };

    if (loading) return <div>Loading...</div>;

    if (!user || !user.googleId) {
        return (
            <div style={{ padding: 20 }}>
                <h1>Login Required</h1>
                <a href={`${BACKEND_URL}/auth/google`} style={{ padding: '10px 20px', background: 'blue', color: 'white' }}>
                    Sign in with Google
                </a>
            </div>
        );
    }

    if (!user.organization) {
        return (
            <div style={{ padding: 20 }}>
                <h1>Welcome, {user.displayName}</h1>
                <div style={{ border: '1px solid #ccc', padding: 20, marginBottom: 20 }}>
                    <h3>Create Organization</h3>
                    <input
                        placeholder="Org Name"
                        value={orgName}
                        onChange={e => setOrgName(e.target.value)}
                    />
                    <button onClick={handleCreateOrg}>Create</button>
                </div>
                <div style={{ border: '1px solid #ccc', padding: 20 }}>
                    <h3>Join Organization</h3>
                    <input
                        placeholder="Invite Code"
                        value={inviteCode}
                        onChange={e => setInviteCode(e.target.value)}
                    />
                    <button onClick={handleJoinOrg}>Join</button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h1>Dashboard ({user.role})</h1>
                <p>Org ID: {user.organization}</p>
                <a href={`${BACKEND_URL}/auth/logout`}>Logout</a>
            </div>

            <div style={{ marginBottom: 20, border: '1px solid #ddd', padding: 10 }}>
                <h3>Create Ticket</h3>
                <input
                    placeholder="Title"
                    value={newTicket.title}
                    onChange={e => setNewTicket({ ...newTicket, title: e.target.value })}
                    style={{ display: 'block', marginBottom: 5 }}
                />
                <textarea
                    placeholder="Description"
                    value={newTicket.description}
                    onChange={e => setNewTicket({ ...newTicket, description: e.target.value })}
                    style={{ display: 'block', marginBottom: 5 }}
                />
                <button onClick={handleCreateTicket}>Submit</button>
            </div>

            <h3>Tickets</h3>
            <ul>
                {tickets.map(t => (
                    <li key={t._id} style={{ border: '1px solid #666', margin: 5, padding: 5 }}>
                        <strong>{t.title}</strong> - {t.status}
                        <br />
                        <small>Assignee: {t.assignee ? t.assignee.displayName : 'Unassigned'}</small>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TestDashboard;
