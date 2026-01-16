import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Projects.css';
import './Tickets.css'; // Import shared ticket styles

const BACKEND_URL = 'http://localhost:5000';

const ProjectDetails = ({ project, user, onBack, sandboxProxy }) => {
    const [tickets, setTickets] = useState([]);
    const [ticketsLoading, setTicketsLoading] = useState(true);
    const [showCreateTicket, setShowCreateTicket] = useState(false);
    const [members, setMembers] = useState([]);

    // Ticket Selection & Modal State
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

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
    // Permissions
    const canCreateTicket = user.role === 'ADMIN' || user.role === 'MANAGER';
    const canDeleteTicket = user.role === 'ADMIN'; 
    
    // Helper: Admin/Manager OR the Assignee
    const canEditTicket = (ticket) => {
        if (!ticket) return false;
        if (user.role === 'ADMIN' || user.role === 'MANAGER') return true;
        if (user.role === 'DESIGNER' && ticket.assignee && ticket.assignee._id === user._id) return true;
        return false;
    };

    const canManageContent = (ticket) => canEditTicket(ticket);
    const canUpdateStatus = (ticket) => canEditTicket(ticket);
    // Strict modification permission (Add/Delete/Generate) - Admin/Manager Only
    const canModifyContent = user.role === 'ADMIN' || user.role === 'MANAGER';

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
                assignee: newTicket.assignee || null
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
            closeTicketModal(); // Close detail modal if open
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
            const updatedTicket = res.data;
            setTickets(tickets.map(t => t._id === ticketId ? updatedTicket : t));

            // If the updated ticket is currently selected in the modal, update it there too
            if (selectedTicket && selectedTicket._id === ticketId) {
                setSelectedTicket(updatedTicket);
            }
        } catch (err) {
            console.error("Failed to update status", err);
            alert(err.response?.data?.error || "Failed to update status");
        }
    };

    const updateLocalTicket = (updatedTicket) => {
        setTickets(prev => prev.map(t => t._id === updatedTicket._id ? updatedTicket : t));
        setSelectedTicket(updatedTicket);
    };

    const handleGenerateTodos = async () => {
        if (!selectedTicket) return;
        const btn = document.getElementById('ai-sugg-btn');
        if(btn) btn.innerText = 'Generating...';

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${BACKEND_URL}/api/tickets/generate-todos`, {
                taskName: selectedTicket.title,
                description: selectedTicket.description,
                projectId: project._id
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // AI returns array of strings, we need to add them one by one or bulk add if backend supported it.
            // Current backend "generate" just returns JSON. We should probably use the "update" to save them all,
            // BUT our new backend architecture only supports "Add One".
            // To keep it simple for now, let's assume the AI route handles the saving? 
            // Wait, the AI route in backend just returns JSON.
            // We need a way to save these. Since we removed "PUT ALL", we have to add them one by one or restore a "Bulk Add" route.
            // Optimization: Let's assume for this specific AI feature we just loop add (not efficient but works) or rely on the user to add them?
            // BETTER: Let's accept that for AI, we might need a specific "Add Many" route or just iterate.
            
            // Actually, looking at the previous plan, we didn't specify bulk add.
            // Let's implement client-side iteration for now to be safe with the new API constraints.
            const newTodos = res.data; 
            
            // We'll iterate and add them.
            for (const todoText of newTodos) {
                 await axios.post(`${BACKEND_URL}/api/tickets/${selectedTicket._id}/todos`, { text: todoText }, {
                    headers: { Authorization: `Bearer ${token}` }
                 });
            }
            
            // Refresh ticket
            const refreshRes = await axios.get(`${BACKEND_URL}/api/tickets?project=${project._id}`, {
                 headers: { Authorization: `Bearer ${token}` }
            });
            // Find our ticket
            const reloadedTicket = refreshRes.data.find(t => t._id === selectedTicket._id);
            if (reloadedTicket) updateLocalTicket(reloadedTicket);

        } catch (err) {
            console.error("AI Error", err);
            alert(err.response?.data?.error || "Failed to generate todos");
        } finally {
             if(btn) btn.innerText = '✨ Generate';
        }
    };

    const handleToggleTodo = async (index) => {
        if (!canManageContent(selectedTicket)) return;
        
        // Optimistic Update
        const newTodos = [...(selectedTicket.todos || [])];
        newTodos[index].isCompleted = !newTodos[index].isCompleted;
        updateLocalTicket({ ...selectedTicket, todos: newTodos });

        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${BACKEND_URL}/api/tickets/${selectedTicket._id}/todos/${index}/toggle`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // No need to reload if successful, optimistic was correct
        } catch (err) {
            console.error("Toggle failed", err);
            // Revert
            fetchTickets(); 
        }
    };

    const handleDeleteTodo = async (index, e) => {
         if (e) e.stopPropagation();
         if (!canModifyContent) return; // Strict check
         
         console.log("Delete button clicked for index:", index);
         
         // Removing window.confirm for now to rule out browser blocking
         // if(!window.confirm("Delete this item?")) return;

         try {
             const token = localStorage.getItem('token');
             console.log(`Sending DELETE to: ${BACKEND_URL}/api/tickets/${selectedTicket._id}/todos/${index}`);
             
             const res = await axios.delete(`${BACKEND_URL}/api/tickets/${selectedTicket._id}/todos/${index}`, {
                 headers: { Authorization: `Bearer ${token}` }
             });
             console.log("Delete success, updating state", res.data);
             updateLocalTicket(res.data);
         } catch (err) {
             console.error("Delete failed", err);
             alert("Failed to delete todo: " + (err.response?.data?.error || err.message));
         }
    };

    const handleAddTodo = async (e) => {
        if (e.key === 'Enter' && e.target.value.trim()) {
            const text = e.target.value;
            e.target.value = ''; // clear input immediately

            try {
                const token = localStorage.getItem('token');
                const res = await axios.post(`${BACKEND_URL}/api/tickets/${selectedTicket._id}/todos`, { text }, {
                     headers: { Authorization: `Bearer ${token}` }
                });
                updateLocalTicket(res.data);
            } catch (err) {
                console.error("Add failed", err);
                alert("Failed to add todo");
            }
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('file', file);
            
            const res = await axios.post(`${BACKEND_URL}/api/tickets/${selectedTicket._id}/attachments`, formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            updateLocalTicket(res.data);
        } catch (err) {
            console.error("Upload failed", err);
            alert("Upload failed");
        }
    };

    const handleAddToCanvas = async (att) => {
        if (!sandboxProxy) {
            console.warn("Sandbox proxy not available");
            return;
        }

        try {
            console.log("Adding attachment to canvas:", att.filename);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${BACKEND_URL}/api/tickets/${selectedTicket._id}/files/${att._id}`, {
                responseType: 'blob',
                 headers: { Authorization: `Bearer ${token}` }
            });
            
            const blob = response.data;
            
            if (sandboxProxy.createImage) {
                 await sandboxProxy.createImage(blob);
            } else {
                console.log("createImage API not yet implemented in sandbox.");
            }

        } catch (err) {
            console.error("Error adding attachment to canvas:", err);
            alert("Failed to add to canvas");
        }
    };



    const handleTicketClick = (ticket) => {
        setSelectedTicket(ticket);
        setIsTicketModalOpen(true);
    };

    const closeTicketModal = () => {
        setSelectedTicket(null);
        setIsTicketModalOpen(false);
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
                            <div
                                key={ticket._id}
                                className="ticket-card"
                                onClick={() => handleTicketClick(ticket)}
                            >
                                <div className="ticket-main">
                                    <div className="ticket-title">{ticket.title}</div>
                                    <div className="ticket-description">{ticket.description}</div>
                                    <div className="ticket-footer">
                                        <span>Assigned to: {ticket.assignee ? ticket.assignee.displayName : 'Unassigned'}</span>
                                        <span>Updated {ticket.updated_at ? new Date(ticket.updated_at).toLocaleDateString() : '—'}</span>
                                    </div>
                                </div>
                                <span className={`status-badge status-${ticket.status.toLowerCase()}`}>
                                    {ticket.status}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* TICKET DETAIL MODAL (Redesigned) */}
            {isTicketModalOpen && selectedTicket && (
                <div className="modal-overlay" onClick={closeTicketModal}>
                    <div className="modal-content ticket-detail-modal" onClick={e => e.stopPropagation()}>
                        
                        <div className="modal-header">
                            <h2>{selectedTicket.title}</h2>
                            <div className="header-actions">
                                <span className={`status-badge status-${selectedTicket.status.toLowerCase()}`}>
                                    {selectedTicket.status}
                                </span>
                                <button className="close-btn" onClick={closeTicketModal}>&times;</button>
                            </div>
                        </div>

                        <div className="ticket-modal-body">
                            {/* LEFT COLUMN: Info */}
                            <div className="ticket-left-col">
                                <div className="modal-section">
                                    <h4>Description</h4>
                                    <p className="ticket-desc-text">{selectedTicket.description || 'No description provided.'}</p>
                                </div>

                                <div className="modal-grid-compact">
                                     <div>
                                        <label>Assignee</label>
                                        <div className="user-pill">{selectedTicket.assignee ? selectedTicket.assignee.displayName : 'Unassigned'}</div>
                                    </div>
                                    <div>
                                        <label>Reporter</label>
                                        <div className="user-pill">{selectedTicket.created_by ? selectedTicket.created_by.displayName : '—'}</div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="modal-section actions-section">
                                    <h4>Actions</h4>
                                    <div className="actions-row">
                                        {canUpdateStatus(selectedTicket) && (
                                            <select
                                                className="status-select"
                                                value={selectedTicket.status}
                                                onChange={(e) => handleStatusChange(selectedTicket._id, e.target.value)}
                                            >
                                                <option value="Open">Open</option>
                                                <option value="InProgress">In Progress</option>
                                                <option value="Review">Review</option>
                                                <option value="Done">Done</option>
                                            </select>
                                        )}
                                        {canDeleteTicket && (
                                            <button className="btn-icon delete-btn" onClick={() => setShowDeleteConfirm(selectedTicket._id)}>
                                                &#128465; Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT COLUMN: Content (Todos + Attachments) */}
                            <div className="ticket-right-col">
                                {/* TODOS */}
                                <div className="modal-section">
                                    <div className="section-header">
                                        <h4>Checklist</h4>
                                        {canModifyContent && (
                                            <button id="ai-sugg-btn" className="btn-small ai-btn" onClick={handleGenerateTodos}>
                                                ✨ Generate
                                            </button>
                                        )}
                                    </div>
                                    <div className="todo-list">
                                        {(selectedTicket.todos || []).map((todo, idx) => (
                                            <div key={idx} className="todo-item">
                                                <input 
                                                    type="checkbox" 
                                                    checked={todo.isCompleted} 
                                                    onChange={() => handleToggleTodo(idx)}
                                                    disabled={!canManageContent(selectedTicket)}
                                                />
                                                <span className={todo.isCompleted ? 'completed' : ''}>{todo.text}</span>
                                                {canModifyContent && (
                                                     <span className="remove-todo" onClick={(e) => handleDeleteTodo(idx, e)}>&times;</span>
                                                )}
                                            </div>
                                        ))}
                                        {canModifyContent && (
                                            <input 
                                                type="text" 
                                                className="new-todo-input" 
                                                placeholder="+ Add item" 
                                                onKeyDown={handleAddTodo}
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* ATTACHMENTS */}
                                <div className="modal-section">
                                     <div className="section-header">
                                        <h4>Attachments</h4>
                                        {canModifyContent && (
                                            <label className="btn-small upload-btn">
                                                &#128206; Add
                                                <input type="file" hidden onChange={handleFileUpload} accept="image/*" />
                                            </label>
                                        )}
                                    </div>
                                    <div className="attachments-list">
                                        {(selectedTicket.attachments || []).map((att) => (
                                            <div key={att._id} className="attachment-item">
                                                <div className="att-info" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                                                    <span style={{fontSize: '16px'}}>{att.contentType.startsWith('image/') ? '🖼️' : '📄'}</span>
                                                    <span className="att-name" style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}} title={att.filename}>{att.filename}</span>
                                                    <span className="att-size">{Math.round(att.size / 1024)} KB</span>
                                                </div>
                                                <div className="att-actions" style={{ display: 'flex', gap: '8px' }}>
                                                    {att.contentType.startsWith('image/') && (
                                                        <button 
                                                            className="btn-icon" 
                                                            onClick={() => handleAddToCanvas(att)}
                                                            title="Add to Canvas"
                                                            style={{ cursor: 'pointer', background: 'none', border: 'none', fontSize: '16px' }}
                                                        >
                                                            ➕
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {(selectedTicket.attachments || []).length === 0 && <span className="empty-text">No files.</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                    <div className="modal-content delete-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h2>Delete Ticket</h2>
                        </div>
                        <div className="modal-body">
                            <p>Are you sure you want to delete this ticket?</p>
                            <p className="warning-text">
                                This action cannot be undone.
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
