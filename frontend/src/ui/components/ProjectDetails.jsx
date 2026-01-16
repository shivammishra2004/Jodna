import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Projects.css'; // Reusing styles

const BACKEND_URL = 'http://localhost:5000';

const ProjectDetails = ({ project, user, onBack }) => {
    const [tickets, setTickets] = useState([]);
    const [ticketsLoading, setTicketsLoading] = useState(true);
    const [showCreateTicket, setShowCreateTicket] = useState(false);
    const [members, setMembers] = useState([]);

    // New Ticket State
    const [newTicket, setNewTicket] = useState({
        title: '',
        description: '',
        status: 'Open',
        assignee: ''
    });
    const [creating, setCreating] = useState(false);
    const [deletingTicketId, setDeletingTicketId] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

    // Permissions
    const canCreateTicket = user.role === 'ADMIN' || user.role === 'MANAGER';
    const canDeleteTicket = user.role === 'ADMIN'; // Admin only
    // canEditTicket logic: Admin/Manager OR the Assignee
    const canEditTicket = (ticket) => {
        if (user.role === 'ADMIN' || user.role === 'MANAGER') return true;
        if (user.role === 'DESIGNER' && ticket.assignee && ticket.assignee._id === user._id) return true;
        return false;
    };

    useEffect(() => {
        fetchTickets();
        if (canCreateTicket) {
            fetchMembers();
        }
    }, [project._id]);

    const fetchTickets = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${BACKEND_URL}/api/tickets?project=${project._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTickets(res.data);
        } catch (err) {
            console.error("Failed to fetch tickets", err);
        } finally {
            setTicketsLoading(false);
        }
    };

    const fetchMembers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${BACKEND_URL}/api/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMembers(res.data);
        } catch (err) {
            console.error("Failed to fetch members", err);
        }
    };

    const handleCreateTicket = async () => {
        if (!newTicket.title.trim()) return;

        setCreating(true);
        try {
            const token = localStorage.getItem('token');
            const payload = {
                ...newTicket,
                project: project._id,
                assignee: newTicket.assignee || null // Ensure null if empty string
            };

            const res = await axios.post(`${BACKEND_URL}/api/tickets`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTickets([res.data, ...tickets]);
            setShowCreateTicket(false);
            setNewTicket({ title: '', description: '', status: 'Open', assignee: '' });
        } catch (err) {
            console.error("Failed to create ticket", err);
            alert("Failed to create ticket");
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteTicket = async (ticketId) => {
        setDeletingTicketId(ticketId);
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${BACKEND_URL}/api/tickets/${ticketId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTickets(tickets.filter(t => t._id !== ticketId));
            setShowDeleteConfirm(null);
        } catch (err) {
            console.error("Failed to delete ticket", err);
            alert(err.response?.data?.error || "Failed to delete ticket");
        } finally {
            setDeletingTicketId(null);
        }
    };

    const handleStatusChange = async (ticketId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`${BACKEND_URL}/api/tickets/${ticketId}`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Update local state
            setTickets(tickets.map(t => t._id === ticketId ? res.data : t));
        } catch (err) {
            console.error("Failed to update status", err);
            alert(err.response?.data?.error || "Failed to update status");
        }
    };

    // Helper to get initials
    const getInitials = (name) => name ? name.charAt(0).toUpperCase() : '?';

    return (
        <div className="project-details-container">
            <div className="project-header">
                <button className="back-button" onClick={onBack}>
                    &larr; Back to Projects
                </button>
                <div className="project-title-row">
                    <h1>{project.name}</h1>
                    {canCreateTicket && (
                        <button className="btn-primary" onClick={() => setShowCreateTicket(true)}>
                            + New Ticket
                        </button>
                    )}
                </div>
                <p className="project-desc">{project.description}</p>
            </div>

            <div className="tickets-section">
                <h2>Tickets ({tickets.length})</h2>
                {ticketsLoading ? (
                    <p>Loading tickets...</p>
                ) : tickets.length === 0 ? (
                    <div className="no-tickets">
                        <p>No tickets in this project yet.</p>
                    </div>
                ) : (
                    <div className="tickets-list">
                        {tickets.map(ticket => (
                            <div key={ticket._id} className="ticket-card">
                                <div className="ticket-main">
                                    <div className="ticket-title">{ticket.title}</div>
                                    <div className="ticket-desc">{ticket.description}</div>
                                </div>
                                <div className="ticket-meta">
                                    <div className="status-row">
                                        {canEditTicket(ticket) ? (
                                            <select
                                                className={`status-select status-${ticket.status.toLowerCase()}`}
                                                value={ticket.status}
                                                onChange={(e) => handleStatusChange(ticket._id, e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <option value="Open">Open</option>
                                                <option value="InProgress">In Progress</option>
                                                <option value="Review">Review</option>
                                                <option value="Done">Done</option>
                                            </select>
                                        ) : (
                                            <span className={`status-badge status-${ticket.status.toLowerCase()}`}>
                                                {ticket.status}
                                            </span>
                                        )}
                                        {canDeleteTicket && (
                                            <button
                                                className="delete-ticket-btn"
                                                onClick={(e) => { 
                                                    e.stopPropagation(); 
                                                    setShowDeleteConfirm(ticket._id);
                                                }}
                                                title="Delete Ticket"
                                                disabled={deletingTicketId === ticket._id}
                                            >
                                                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M12 4V13.3333C12 13.6869 11.8595 14.0261 11.6095 14.2761C11.3594 14.5262 11.0203 14.6667 10.6667 14.6667H5.33333C4.97971 14.6667 4.64057 14.5262 4.39052 14.2761C4.14048 14.0261 4 13.6869 4 13.3333V4M5.33333 2.66667H10.6667L12 4H4L5.33333 2.66667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                    <path d="M6.66667 7.33333V11.3333M9.33333 7.33333V11.3333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                                </svg>
                                            </button>
                                        )}
                                    </div>

                                    {ticket.assignee ? (
                                        <div className="assignee-avatar" title={`Assigned to ${ticket.assignee.displayName}`}>
                                            {getInitials(ticket.assignee.displayName)}
                                        </div>
                                    ) : (
                                        <span className="unassigned">Unassigned</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Ticket Modal */}
            {showCreateTicket && (
                <div className="modal-overlay" onClick={() => setShowCreateTicket(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Create New Ticket</h2>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Title</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={newTicket.title}
                                    onChange={e => setNewTicket({ ...newTicket, title: e.target.value })}
                                    placeholder="Task title"
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    className="form-input"
                                    value={newTicket.description}
                                    onChange={e => setNewTicket({ ...newTicket, description: e.target.value })}
                                    placeholder="Task description"
                                    rows="3"
                                />
                            </div>
                            <div className="form-group">
                                <label>Assignee</label>
                                <select
                                    className="form-input"
                                    value={newTicket.assignee}
                                    onChange={e => setNewTicket({ ...newTicket, assignee: e.target.value })}
                                >
                                    <option value="">Unassigned</option>
                                    {members.map(member => (
                                        <option key={member._id} value={member._id}>
                                            {member.displayName} ({member.role})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Status</label>
                                <select
                                    className="form-input"
                                    value={newTicket.status}
                                    onChange={e => setNewTicket({ ...newTicket, status: e.target.value })}
                                >
                                    <option value="Open">Open</option>
                                    <option value="InProgress">In Progress</option>
                                    <option value="Review">Review</option>
                                    <option value="Done">Done</option>
                                </select>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button
                                className="modal-button cancel-button"
                                onClick={() => setShowCreateTicket(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="modal-button confirm-button"
                                onClick={handleCreateTicket}
                                disabled={creating || !newTicket.title.trim()}
                            >
                                {creating ? 'Creating...' : 'Create Ticket'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="modal-overlay" onClick={() => !deletingTicketId && setShowDeleteConfirm(null)}>
                    <div className="modal-content delete-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Delete Ticket</h2>
                        </div>
                        <div className="modal-body">
                            <p>Are you sure you want to delete this ticket?</p>
                            <p className="warning-text">
                                This action cannot be undone. The ticket will be permanently removed.
                            </p>
                        </div>
                        <div className="modal-actions">
                            <button
                                className="modal-button cancel-button"
                                onClick={() => setShowDeleteConfirm(null)}
                                disabled={deletingTicketId !== null}
                            >
                                Cancel
                            </button>
                            <button
                                className="modal-button delete-confirm-button"
                                onClick={() => handleDeleteTicket(showDeleteConfirm)}
                                disabled={deletingTicketId !== null}
                            >
                                {deletingTicketId === showDeleteConfirm ? 'Deleting...' : 'Delete Ticket'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectDetails;
