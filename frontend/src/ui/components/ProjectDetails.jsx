import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trash2 } from 'lucide-react';
import axios from 'axios';
import './Projects.css';
import './Tickets.css'; // Import shared ticket styles

import config from "../../config";
const { BACKEND_URL } = config;

// Component for ticket image attachment thumbnail
const TicketImageAttachmentThumbnail = ({ ticketId, attachment, onView, onAddToCanvas, onDelete, canDelete, BACKEND_URL }) => {
    const [thumbnailUrl, setThumbnailUrl] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadThumbnail = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${BACKEND_URL}/api/tickets/${ticketId}/files/${attachment._id}`, {
                    responseType: 'blob',
                    headers: { Authorization: `Bearer ${token}` }
                });
                const url = window.URL.createObjectURL(response.data);
                setThumbnailUrl(url);
            } catch (err) {
                console.error('Failed to load thumbnail', err);
            } finally {
                setLoading(false);
            }
        };

        loadThumbnail();

        // Cleanup blob URL on unmount
        return () => {
            if (thumbnailUrl) {
                window.URL.revokeObjectURL(thumbnailUrl);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ticketId, attachment._id]);

    return (
        <>
            <div style={{
                position: 'relative',
                width: '100%',
                minHeight: '100px',
                maxHeight: '200px',
                borderRadius: '4px',
                overflow: 'hidden',
                backgroundColor: '#fff',
                marginBottom: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
                onClick={onView}
            >
                {loading ? (
                    <div style={{
                        padding: '20px',
                        color: '#586069',
                        fontSize: '12px',
                        textAlign: 'center'
                    }}>
                        🖼️ Loading...
                    </div>
                ) : thumbnailUrl ? (
                    <img
                        src={thumbnailUrl}
                        alt={attachment.filename}
                        style={{
                            width: '100%',
                            height: 'auto',
                            maxHeight: '200px',
                            objectFit: 'contain',
                            display: 'block'
                        }}
                    />
                ) : (
                    <div style={{
                        padding: '20px',
                        color: '#586069',
                        fontSize: '12px',
                        textAlign: 'center'
                    }}>
                        🖼️ Click to view
                    </div>
                )}
            </div>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                color: '#586069'
            }}>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {attachment.filename}
                </span>
                <span>{Math.round(attachment.size / 1024)} KB</span>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onView();
                    }}
                    style={{
                        padding: '4px 8px',
                        backgroundColor: '#0366d6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '10px',
                        cursor: 'pointer',
                        fontWeight: '500'
                    }}
                    title="View full size"
                >
                    View
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onAddToCanvas();
                    }}
                    style={{
                        padding: '4px 8px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '10px',
                        cursor: 'pointer',
                        fontWeight: '500'
                    }}
                    title="Add to canvas"
                >
                    ➕
                </button>
                {canDelete && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        style={{
                            padding: '4px 8px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '10px',
                            cursor: 'pointer',
                            fontWeight: '500'
                        }}
                        title="Delete attachment"
                    >
                        🗑️
                    </button>
                )}
            </div>
        </>
    );
};

// Component for image attachment thumbnail (comments)
const ImageAttachmentThumbnail = ({ ticketId, commentId, attachment, onView, onAddToCanvas, BACKEND_URL }) => {
    const [thumbnailUrl, setThumbnailUrl] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadThumbnail = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${BACKEND_URL}/api/reviews/ticket/${ticketId}/comments/${commentId}/attachments/${attachment._id}`, {
                    responseType: 'blob',
                    headers: { Authorization: `Bearer ${token}` }
                });
                const url = window.URL.createObjectURL(response.data);
                setThumbnailUrl(url);
            } catch (err) {
                console.error('Failed to load thumbnail', err);
            } finally {
                setLoading(false);
            }
        };

        loadThumbnail();

        // Cleanup blob URL on unmount
        return () => {
            if (thumbnailUrl) {
                window.URL.revokeObjectURL(thumbnailUrl);
            }
        };
    }, [ticketId, commentId, attachment._id, BACKEND_URL]);

    return (
        <>
            <div style={{
                position: 'relative',
                width: '100%',
                minHeight: '100px',
                maxHeight: '200px',
                borderRadius: '4px',
                overflow: 'hidden',
                backgroundColor: '#fff',
                marginBottom: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
                onClick={onView}
            >
                {loading ? (
                    <div style={{
                        padding: '20px',
                        color: '#586069',
                        fontSize: '12px',
                        textAlign: 'center'
                    }}>
                        🖼️ Loading...
                    </div>
                ) : thumbnailUrl ? (
                    <img
                        src={thumbnailUrl}
                        alt={attachment.filename}
                        style={{
                            width: '100%',
                            height: 'auto',
                            maxHeight: '200px',
                            objectFit: 'contain',
                            display: 'block'
                        }}
                    />
                ) : (
                    <div style={{
                        padding: '20px',
                        color: '#586069',
                        fontSize: '12px',
                        textAlign: 'center'
                    }}>
                        🖼️ Click to view
                    </div>
                )}
            </div>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                color: '#586069'
            }}>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {attachment.filename}
                </span>
                <span>{Math.round(attachment.size / 1024)} KB</span>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onView();
                    }}
                    style={{
                        padding: '4px 8px',
                        backgroundColor: '#0366d6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '10px',
                        cursor: 'pointer',
                        fontWeight: '500'
                    }}
                    title="View full size"
                >
                    View
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onAddToCanvas();
                    }}
                    style={{
                        padding: '4px 8px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '10px',
                        cursor: 'pointer',
                        fontWeight: '500'
                    }}
                    title="Add to canvas"
                >
                    ➕
                </button>
            </div>
        </>
    );
};

const ProjectDetails = ({ project, user, onBack, sandboxProxy }) => {
    const [tickets, setTickets] = useState([]);
    const [ticketsLoading, setTicketsLoading] = useState(true);
    const [showCreateTicket, setShowCreateTicket] = useState(false);
    const [members, setMembers] = useState([]);

    // Ticket Selection & Modal State
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
    const [review, setReview] = useState(null);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [newCommentText, setNewCommentText] = useState('');
    const [commentAttachments, setCommentAttachments] = useState([]);
    const [uploadingAttachment, setUploadingAttachment] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [commentError, setCommentError] = useState('');
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
    const [previewImageName, setPreviewImageName] = useState(null);
    const [editingDescription, setEditingDescription] = useState(false);
    const [tempDescription, setTempDescription] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

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
            setErrorMessage(err.response?.data?.error || "Failed to create ticket");
            setTimeout(() => setErrorMessage(''), 5000);
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
            setErrorMessage(err.response?.data?.error || "Failed to delete ticket");
            setTimeout(() => setErrorMessage(''), 5000);
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
            setErrorMessage(err.response?.data?.error || "Failed to update status");
            setTimeout(() => setErrorMessage(''), 5000);
        }
    };

    const handleUpdateDescription = async () => {
        if (!selectedTicket) return;

        try {
            const token = localStorage.getItem('token');
            await axios.put(`${BACKEND_URL}/api/tickets/${selectedTicket._id}`,
                { description: tempDescription },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Reload tickets from database
            const res = await axios.get(`${BACKEND_URL}/api/tickets?project=${project._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Update tickets list
            setTickets(res.data);

            // Find and update the selected ticket from the fresh data
            const updatedTicket = res.data.find(t => t._id === selectedTicket._id);
            if (updatedTicket) {
                setSelectedTicket(updatedTicket);
            }

            setEditingDescription(false);
        } catch (err) {
            console.error("Failed to update description", err);
            setErrorMessage(err.response?.data?.error || "Failed to update description");
            setTimeout(() => setErrorMessage(''), 5000);
        }
    };

    const handleStartEditDescription = () => {
        setTempDescription(selectedTicket.description || '');
        setEditingDescription(true);
    };

    const handleCancelEditDescription = () => {
        setEditingDescription(false);
        setTempDescription('');
    };

    const handleDeleteAttachment = async (attachmentId) => {
        if (!selectedTicket) return;

        try {
            const token = localStorage.getItem('token');
            const res = await axios.delete(`${BACKEND_URL}/api/tickets/${selectedTicket._id}/attachments/${attachmentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            updateLocalTicket(res.data);
        } catch (err) {
            console.error("Failed to delete attachment", err);
            setErrorMessage(err.response?.data?.error || "Failed to delete attachment");
            setTimeout(() => setErrorMessage(''), 5000);
        }
    };

    const updateLocalTicket = (updatedTicket) => {
        setTickets(prev => prev.map(t => t._id === updatedTicket._id ? updatedTicket : t));
        setSelectedTicket(updatedTicket);
    };

    const handleGenerateTodos = async () => {
        if (!selectedTicket) return;
        const btn = document.getElementById('ai-sugg-btn');
        if (btn) btn.innerText = 'Generating...';

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
            setErrorMessage(err.response?.data?.error || "Failed to generate todos");
            setTimeout(() => setErrorMessage(''), 5000);
        } finally {
            if (btn) btn.innerText = '✨ Generate';
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
        if (!canModifyContent) return; // Strict check - Admin/Manager only

        const todo = selectedTicket.todos?.[index];
        // Prevent deletion if todo is completed
        if (todo && todo.isCompleted) {
            setErrorMessage("Cannot delete completed checklist items");
            setTimeout(() => setErrorMessage(''), 3000);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await axios.delete(`${BACKEND_URL}/api/tickets/${selectedTicket._id}/todos/${index}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            updateLocalTicket(res.data);
        } catch (err) {
            console.error("Delete failed", err);
            setErrorMessage("Failed to delete todo: " + (err.response?.data?.error || err.message));
            setTimeout(() => setErrorMessage(''), 5000);
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
                setErrorMessage(err.response?.data?.error || "Failed to add todo");
                setTimeout(() => setErrorMessage(''), 5000);
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
            setErrorMessage(err.response?.data?.error || "Upload failed");
            setTimeout(() => setErrorMessage(''), 5000);
        }
    };

    const handleAddToCanvas = async (att) => {
        if (!sandboxProxy) {
            console.warn("Sandbox proxy not available");
            setErrorMessage("Canvas not available");
            setTimeout(() => setErrorMessage(''), 3000);
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
                setErrorMessage(''); // Clear any previous errors
            } else {
                console.log("createImage API not yet implemented in sandbox.");
                setErrorMessage("Add to canvas feature not available");
                setTimeout(() => setErrorMessage(''), 3000);
            }

        } catch (err) {
            console.error("Error adding attachment to canvas:", err);
            setErrorMessage(err.response?.data?.error || "Failed to add to canvas");
            setTimeout(() => setErrorMessage(''), 5000);
        }
    };

    const handleViewTicketImage = async (attachmentId, filename, contentType) => {
        if (!contentType.startsWith('image/')) {
            // For non-images, trigger download
            const token = localStorage.getItem('token');
            const response = await axios.get(`${BACKEND_URL}/api/tickets/${selectedTicket._id}/files/${attachmentId}`, {
                responseType: 'blob',
                headers: { Authorization: `Bearer ${token}` }
            });
            const blob = response.data;
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${BACKEND_URL}/api/tickets/${selectedTicket._id}/files/${attachmentId}`, {
                responseType: 'blob',
                headers: { Authorization: `Bearer ${token}` }
            });

            const blob = response.data;
            const url = window.URL.createObjectURL(blob);
            setImagePreviewUrl(url);
            setPreviewImageName(filename);
        } catch (err) {
            console.error("Failed to load image", err);
            setErrorMessage(err.response?.data?.error || "Failed to load image");
            setTimeout(() => setErrorMessage(''), 5000);
        }
    };



    const handleTicketClick = async (ticket) => {
        setSelectedTicket(ticket);
        setIsTicketModalOpen(true);
        setEditingDescription(false);
        setTempDescription('');
        // Fetch review data for this ticket
        await fetchReview(ticket._id);
    };

    const fetchReview = async (ticketId) => {
        setReviewLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${BACKEND_URL}/api/reviews/ticket/${ticketId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReview(res.data);
        } catch (err) {
            console.error("Failed to fetch review", err);
            setReview(null);
        } finally {
            setReviewLoading(false);
        }
    };

    const handleUpdateExpressLink = async (ticketId, link) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`${BACKEND_URL}/api/tickets/${ticketId}/express-link`,
                { expressProjectLink: link },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            updateLocalTicket(res.data);
        } catch (err) {
            console.error("Failed to update express link", err);
            setErrorMessage(err.response?.data?.error || "Failed to update Express project link");
            setTimeout(() => setErrorMessage(''), 5000);
        }
    };

    const handleCopyExpressLink = (link) => {
        if (!link) return;

        // Fallback method for sandboxed environments (Adobe Express add-on)
        try {
            // Try modern Clipboard API first
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(link).then(() => {
                    setErrorMessage('Link copied to clipboard!');
                    setTimeout(() => setErrorMessage(''), 2000);
                }).catch(() => {
                    // Fallback to textarea method
                    fallbackCopyText(link);
                });
            } else {
                // Use fallback method
                fallbackCopyText(link);
            }
        } catch (err) {
            // Use fallback method if Clipboard API fails
            fallbackCopyText(link);
        }
    };

    const fallbackCopyText = (text) => {
        // Create a temporary textarea element
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            const successful = document.execCommand('copy');
            if (successful) {
                setErrorMessage('Link copied to clipboard!');
                setTimeout(() => setErrorMessage(''), 2000);
            } else {
                setErrorMessage('Failed to copy link. Please copy manually.');
                setTimeout(() => setErrorMessage(''), 3000);
            }
        } catch (err) {
            setErrorMessage('Failed to copy link. Please copy manually.');
            setTimeout(() => setErrorMessage(''), 3000);
        } finally {
            document.body.removeChild(textArea);
        }
    };

    const handleCommentFileChange = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            setCommentAttachments(prev => [...prev, ...files]);
        }
        // Reset input so same file can be selected again
        e.target.value = '';
    };

    const removeCommentAttachment = (index) => {
        setCommentAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleAddComment = async () => {
        const commentText = newCommentText.trim();
        if (!commentText || !selectedTicket) return;

        setCommentError('');
        try {
            const token = localStorage.getItem('token');
            if (!selectedTicket._id) {
                setCommentError('Invalid ticket ID');
                return;
            }

            const url = `${BACKEND_URL}/api/reviews/ticket/${selectedTicket._id}/comments`;
            console.log('Adding comment to URL:', url, 'Ticket ID:', selectedTicket._id);

            // Create FormData if there are attachments
            let requestData;
            let headers = { Authorization: `Bearer ${token}` };

            if (commentAttachments.length > 0) {
                const formData = new FormData();
                formData.append('text', commentText);
                commentAttachments.forEach(file => {
                    formData.append('attachments', file);
                });
                requestData = formData;
                // Don't set Content-Type manually - axios will set it with boundary
            } else {
                requestData = { text: commentText };
                headers['Content-Type'] = 'application/json';
            }

            const res = await axios.post(url, requestData, { headers });
            setReview(res.data);
            setNewCommentText('');
            setCommentAttachments([]);
            setCommentError('');
        } catch (err) {
            console.error("Failed to add comment", err);
            console.error("Error details:", {
                status: err.response?.status,
                statusText: err.response?.statusText,
                data: err.response?.data,
                url: err.config?.url,
                method: err.config?.method
            });
            const errorMsg = err.response?.data?.error || err.response?.statusText || err.message || "Failed to add comment";
            setCommentError(errorMsg);
            // Auto-clear error after 5 seconds
            setTimeout(() => setCommentError(''), 5000);
        }
    };


    const handleDownloadAttachment = async (commentId, attachmentId, filename) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${BACKEND_URL}/api/reviews/ticket/${selectedTicket._id}/comments/${commentId}/attachments/${attachmentId}`, {
                responseType: 'blob',
                headers: { Authorization: `Bearer ${token}` }
            });

            const blob = response.data;
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error("Download failed", err);
            setErrorMessage(err.response?.data?.error || "Failed to download file");
            setTimeout(() => setErrorMessage(''), 5000);
        }
    };

    const handleViewImage = async (commentId, attachmentId, filename, contentType) => {
        if (!contentType.startsWith('image/')) {
            handleDownloadAttachment(commentId, attachmentId, filename);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${BACKEND_URL}/api/reviews/ticket/${selectedTicket._id}/comments/${commentId}/attachments/${attachmentId}`, {
                responseType: 'blob',
                headers: { Authorization: `Bearer ${token}` }
            });

            const blob = response.data;
            const url = window.URL.createObjectURL(blob);
            setImagePreviewUrl(url);
            setPreviewImageName(filename);
        } catch (err) {
            console.error("Failed to load image", err);
            setErrorMessage(err.response?.data?.error || "Failed to load image");
            setTimeout(() => setErrorMessage(''), 5000);
        }
    };

    const handleAddCommentImageToCanvas = async (commentId, attachmentId, filename, contentType) => {
        if (!contentType.startsWith('image/')) {
            return;
        }

        if (!sandboxProxy) {
            console.warn("Sandbox proxy not available");
            setErrorMessage("Canvas not available");
            setTimeout(() => setErrorMessage(''), 3000);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${BACKEND_URL}/api/reviews/ticket/${selectedTicket._id}/comments/${commentId}/attachments/${attachmentId}`, {
                responseType: 'blob',
                headers: { Authorization: `Bearer ${token}` }
            });

            const blob = response.data;

            if (sandboxProxy.createImage) {
                await sandboxProxy.createImage(blob);
                setErrorMessage(''); // Clear any previous errors
            } else {
                console.log("createImage API not yet implemented in sandbox.");
                setErrorMessage("Add to canvas feature not available");
                setTimeout(() => setErrorMessage(''), 3000);
            }
        } catch (err) {
            console.error("Error adding image to canvas:", err);
            setErrorMessage(err.response?.data?.error || "Failed to add to canvas");
            setTimeout(() => setErrorMessage(''), 5000);
        }
    };

    const closeImagePreview = () => {
        if (imagePreviewUrl) {
            window.URL.revokeObjectURL(imagePreviewUrl);
        }
        setImagePreviewUrl(null);
        setPreviewImageName(null);
    };

    const closeTicketModal = () => {
        closeImagePreview(); // Close any open image previews
        setSelectedTicket(null);
        setIsTicketModalOpen(false);
        setReview(null);
        setNewCommentText('');
        setCommentAttachments([]);
        setUploadingAttachment(null);
        setErrorMessage('');
        setCommentError('');
        setEditingDescription(false);
        setTempDescription('');
    };

    // Helper to get initials
    const getInitials = (name) => name ? name.charAt(0).toUpperCase() : '?';

    const filteredTickets = tickets.filter(ticket => {
        if (statusFilter === 'All') return true;
        return ticket.status === statusFilter;
    });

    return (
        <div className="project-details-container">
            <div className="project-header">
                <button 
                    className="back-button" 
                    onClick={onBack} 
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        padding: 0,
                        border: 'none',
                        background: 'transparent',
                        color: '#0366d6', // Blue color requested
                        cursor: 'pointer'
                    }}
                    title="Back to Projects"
                >
                    <ArrowLeft size={24} />
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
                <div className="tickets-header" style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    <h2 style={{ margin: 0 }}>Tickets ({filteredTickets.length})</h2>
                    <div className="filter-controls">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{
                                padding: '6px 12px',
                                fontSize: '13px',
                                borderRadius: '6px',
                                border: '1px solid #e1e4e8',
                                backgroundColor: '#ffffff',
                                cursor: 'pointer',
                                outline: 'none'
                            }}
                        >
                            <option value="All">All Status</option>
                            <option value="Open">Open</option>
                            <option value="InProgress">In Progress</option>
                            <option value="Review">Review</option>
                            <option value="Done">Done</option>
                        </select>
                    </div>
                </div>

                {ticketsLoading ? (
                    <p>Loading tickets...</p>
                ) : filteredTickets.length === 0 ? (
                    <div className="no-tickets">
                        <p>{statusFilter === 'All' ? 'No tickets in this project yet.' : `No tickets with status "${statusFilter}".`}</p>
                    </div>
                ) : (
                    <div className="tickets-list">
                        {filteredTickets.map(ticket => (
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
                                <div className="ticket-card-right" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                                    {canUpdateStatus(ticket) ? (
                                        <select
                                            className={`status-select ${ticket.status.toLowerCase()}`}
                                            value={ticket.status}
                                            onChange={(e) => handleStatusChange(ticket._id, e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                            style={{
                                                padding: '4px 8px',
                                                fontSize: '11px',
                                                borderRadius: '12px',
                                                border: '1px solid #e1e4e8',
                                                cursor: 'pointer',
                                                fontWeight: '600',
                                                height: 'auto',
                                                lineHeight: '1',
                                                appearance: 'none',
                                                backgroundPosition: 'right 4px center',
                                                paddingRight: '20px'
                                            }}
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
                                            className="icon-btn delete-ticket-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowDeleteConfirm(ticket._id);
                                            }}
                                            title="Delete Ticket"
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: '#d73a49',
                                                padding: '4px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                opacity: 0.6,
                                                transition: 'opacity 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.target.style.opacity = 1}
                                            onMouseLeave={(e) => e.target.style.opacity = 0.6}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
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
                            <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                {canUpdateStatus(selectedTicket) ? (
                                    <select
                                        className={`status-select ${selectedTicket.status.toLowerCase()}`}
                                        value={selectedTicket.status}
                                        onChange={(e) => handleStatusChange(selectedTicket._id, e.target.value)}
                                        style={{
                                            padding: '6px 10px',
                                            fontSize: '12px',
                                            borderRadius: '6px',
                                            border: '1px solid #ddd',
                                            cursor: 'pointer',
                                            fontWeight: '600'
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <option value="Open">Open</option>
                                        <option value="InProgress">In Progress</option>
                                        <option value="Review">Review</option>
                                        <option value="Done">Done</option>
                                    </select>
                                ) : (
                                    <span className={`status-badge status-${selectedTicket.status.toLowerCase()}`}>
                                        {selectedTicket.status}
                                    </span>
                                )}
                                
                                {canDeleteTicket && (
                                     <button
                                        className="icon-btn"
                                        onClick={() => setShowDeleteConfirm(selectedTicket._id)}
                                        title="Delete Ticket"
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: '#d73a49',
                                            padding: '4px',
                                            display: 'flex'
                                        }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}

                                <button className="close-btn" onClick={closeTicketModal} style={{ fontSize: '24px', lineHeight: '1', background: 'none', border: 'none', cursor: 'pointer', color: '#586069' }}>&times;</button>
                            </div>
                        </div>

                        <div className="ticket-modal-body" style={{ padding: '16px' }}>
                            {/* Error Message Display */}
                            {(errorMessage || commentError) && (
                                <div style={{
                                    padding: '10px 12px',
                                    marginBottom: '12px',
                                    backgroundColor: '#fff3cd',
                                    border: '1px solid #ffc107',
                                    borderRadius: '6px',
                                    color: '#856404',
                                    fontSize: '12px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span>{errorMessage || commentError}</span>
                                    <button
                                        onClick={() => {
                                            setErrorMessage('');
                                            setCommentError('');
                                        }}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#856404',
                                            cursor: 'pointer',
                                            fontSize: '16px',
                                            padding: '0 4px'
                                        }}
                                    >
                                        ×
                                    </button>
                                </div>
                            )}

                            {/* LEFT COLUMN: Info */}
                            <div className="ticket-left-col">
                                <div className="modal-section" style={{ marginBottom: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#24292e' }}>Description</h4>
                                        {!editingDescription && canModifyContent && (
                                            <button
                                                onClick={handleStartEditDescription}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: '#0366d6',
                                                    cursor: 'pointer',
                                                    fontSize: '12px',
                                                    padding: '4px 8px',
                                                    textDecoration: 'underline'
                                                }}
                                            >
                                                Edit
                                            </button>
                                        )}
                                    </div>
                                    {editingDescription ? (
                                        <div>
                                            <textarea
                                                value={tempDescription}
                                                onChange={(e) => setTempDescription(e.target.value)}
                                                style={{
                                                    width: '100%',
                                                    minHeight: '80px',
                                                    padding: '8px',
                                                    fontSize: '13px',
                                                    fontFamily: 'inherit',
                                                    border: '1px solid #d1d5da',
                                                    borderRadius: '6px',
                                                    resize: 'vertical',
                                                    boxSizing: 'border-box',
                                                    lineHeight: '1.5',
                                                    marginBottom: '8px'
                                                }}
                                                placeholder="Enter description..."
                                            />
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <button
                                                    onClick={handleCancelEditDescription}
                                                    style={{
                                                        padding: '6px 12px',
                                                        backgroundColor: '#f5f5f5',
                                                        color: '#24292e',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        fontSize: '12px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleUpdateDescription}
                                                    style={{
                                                        padding: '6px 12px',
                                                        backgroundColor: '#28a745',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        fontSize: '12px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Save
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p style={{
                                            fontSize: '13px',
                                            lineHeight: '1.6',
                                            color: '#24292e',
                                            margin: 0,
                                            whiteSpace: 'pre-wrap',
                                            wordBreak: 'break-word'
                                        }}>{selectedTicket.description || 'No description provided.'}</p>
                                    )}
                                </div>

                                <div className="modal-grid-compact" style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div>
                                        <label style={{
                                            display: 'block',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            color: '#586069',
                                            marginBottom: '6px'
                                        }}>Assignee</label>
                                        <div className="user-pill" style={{
                                            padding: '6px 10px',
                                            backgroundColor: '#f6f8fa',
                                            borderRadius: '6px',
                                            border: '1px solid #e1e4e8',
                                            fontSize: '13px'
                                        }}>{selectedTicket.assignee ? (selectedTicket.assignee.displayName || 'Unassigned') : 'Unassigned'}</div>
                                    </div>
                                    <div>
                                        <label style={{
                                            display: 'block',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            color: '#586069',
                                            marginBottom: '6px'
                                        }}>Reporter</label>
                                        <div className="user-pill" style={{
                                            padding: '6px 10px',
                                            backgroundColor: '#f6f8fa',
                                            borderRadius: '6px',
                                            border: '1px solid #e1e4e8',
                                            fontSize: '13px'
                                        }}>{selectedTicket.created_by ? (selectedTicket.created_by.displayName || '—') : '—'}</div>
                                    </div>
                                </div>

                                {/* Express Project Link - Designer can edit, everyone can view */}
                                {(selectedTicket.assignee || selectedTicket.expressProjectLink) && (
                                    <div className="modal-section" style={{ marginBottom: '16px' }}>
                                        <h4 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: '600', color: '#24292e' }}>Express Project Link</h4>
                                        {/* Only assigned designer can edit */}
                                        {selectedTicket.assignee && selectedTicket.assignee._id === user._id && user.role === 'DESIGNER' ? (
                                            <>
                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                                                    <input
                                                        type="url"
                                                        className="form-input"
                                                        placeholder="https://express.adobe.com/sp/..."
                                                        value={selectedTicket.expressProjectLink || ''}
                                                        onChange={(e) => {
                                                            const updatedTicket = { ...selectedTicket, expressProjectLink: e.target.value };
                                                            setSelectedTicket(updatedTicket);
                                                        }}
                                                        style={{
                                                            flex: 1,
                                                            padding: '8px 12px',
                                                            fontSize: '13px',
                                                            border: '1px solid #d1d5da',
                                                            borderRadius: '6px',
                                                            outline: 'none',
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                        onFocus={(e) => {
                                                            e.target.style.borderColor = '#0366d6';
                                                            e.target.style.boxShadow = '0 0 0 3px rgba(3, 102, 214, 0.1)';
                                                        }}
                                                        onBlur={(e) => {
                                                            e.target.style.borderColor = '#d1d5da';
                                                            e.target.style.boxShadow = 'none';
                                                            handleUpdateExpressLink(selectedTicket._id, e.target.value);
                                                        }}
                                                    />
                                                    {selectedTicket.expressProjectLink && (
                                                        <button
                                                            onClick={() => handleCopyExpressLink(selectedTicket.expressProjectLink)}
                                                            style={{
                                                                padding: '8px 12px',
                                                                fontSize: '13px',
                                                                border: '1px solid #d1d5da',
                                                                borderRadius: '6px',
                                                                backgroundColor: '#ffffff',
                                                                color: '#0366d6',
                                                                cursor: 'pointer',
                                                                fontWeight: '500',
                                                                transition: 'all 0.2s ease',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '6px'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.target.style.backgroundColor = '#f6f8fa';
                                                                e.target.style.borderColor = '#0366d6';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.target.style.backgroundColor = '#ffffff';
                                                                e.target.style.borderColor = '#d1d5da';
                                                            }}
                                                            title="Copy link"
                                                        >
                                                            📋 Copy
                                                        </button>
                                                    )}
                                                </div>
                                                <p style={{ fontSize: '12px', color: '#586069', margin: 0, lineHeight: '1.5' }}>
                                                    Add the Adobe Express project link here. You can add the admin as a collaborator in Express.
                                                </p>
                                            </>
                                        ) : selectedTicket.expressProjectLink ? (
                                            /* View-only for admins/managers and other users */
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                                                <div
                                                    onClick={() => handleCopyExpressLink(selectedTicket.expressProjectLink)}
                                                    style={{
                                                        flex: 1,
                                                        padding: '8px 12px',
                                                        fontSize: '13px',
                                                        color: '#0366d6',
                                                        textDecoration: 'none',
                                                        border: '1px solid #e1e4e8',
                                                        borderRadius: '6px',
                                                        backgroundColor: '#f6f8fa',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        transition: 'all 0.2s ease',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        cursor: 'pointer'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.target.style.backgroundColor = '#e1e4e8';
                                                        e.target.style.textDecoration = 'underline';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.target.style.backgroundColor = '#f6f8fa';
                                                        e.target.style.textDecoration = 'none';
                                                    }}
                                                    title={`${selectedTicket.expressProjectLink} - Click to copy`}
                                                >
                                                    <span>🔗</span>
                                                    <span>{selectedTicket.expressProjectLink}</span>
                                                </div>
                                                <button
                                                    onClick={() => handleCopyExpressLink(selectedTicket.expressProjectLink)}
                                                    style={{
                                                        padding: '8px 12px',
                                                        fontSize: '13px',
                                                        border: '1px solid #d1d5da',
                                                        borderRadius: '6px',
                                                        backgroundColor: '#ffffff',
                                                        color: '#0366d6',
                                                        cursor: 'pointer',
                                                        fontWeight: '500',
                                                        transition: 'all 0.2s ease',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.target.style.backgroundColor = '#f6f8fa';
                                                        e.target.style.borderColor = '#0366d6';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.target.style.backgroundColor = '#ffffff';
                                                        e.target.style.borderColor = '#d1d5da';
                                                    }}
                                                    title="Copy link"
                                                >
                                                    📋 Copy
                                                </button>
                                            </div>
                                        ) : (
                                            <p style={{ fontSize: '12px', color: '#6a737d', margin: 0, fontStyle: 'italic' }}>
                                                No Express project link added yet by the assigned designer.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* RIGHT COLUMN: Content (Todos + Attachments) */}
                            <div className="ticket-right-col">
                                {/* TODOS */}
                                <div className="modal-section" style={{ marginBottom: '16px' }}>
                                    <div className="section-header" style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h4 style={{ fontSize: '14px', margin: 0, fontWeight: '600', color: '#24292e' }}>Checklist</h4>
                                        {(selectedTicket.todos || []).length > 0 && (
                                            <span style={{ fontSize: '12px', color: '#586069' }}>
                                                {selectedTicket.todos.filter(t => t.isCompleted).length} / {selectedTicket.todos.length} completed
                                            </span>
                                        )}
                                    </div>
                                    <div className="todo-list" style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '8px',
                                        maxHeight: '300px',
                                        overflowY: 'auto'
                                    }}>
                                        {(selectedTicket.todos || []).map((todo, idx) => {
                                            const isCompleted = todo.isCompleted;
                                            const canDelete = canModifyContent && !isCompleted;
                                            return (
                                                <div
                                                    key={idx}
                                                    className="todo-item"
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '10px',
                                                        padding: '10px 12px',
                                                        backgroundColor: isCompleted ? '#f6f8fa' : '#ffffff',
                                                        border: `1px solid ${isCompleted ? '#d1d5db' : '#e1e4e8'}`,
                                                        borderRadius: '6px',
                                                        transition: 'all 0.2s ease',
                                                        opacity: isCompleted ? 0.8 : 1
                                                    }}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isCompleted}
                                                        onChange={() => handleToggleTodo(idx)}
                                                        disabled={!canManageContent(selectedTicket)}
                                                        style={{
                                                            width: '18px',
                                                            height: '18px',
                                                            cursor: canManageContent(selectedTicket) ? 'pointer' : 'not-allowed',
                                                            accentColor: '#28a745'
                                                        }}
                                                    />
                                                    <span
                                                        className={isCompleted ? 'completed' : ''}
                                                        style={{
                                                            flex: 1,
                                                            fontSize: '13px',
                                                            color: isCompleted ? '#586069' : '#24292e',
                                                            textDecoration: isCompleted ? 'line-through' : 'none',
                                                            wordBreak: 'break-word'
                                                        }}
                                                    >
                                                        {todo.text}
                                                    </span>
                                                    {canDelete && (
                                                        <button
                                                            onClick={(e) => handleDeleteTodo(idx, e)}
                                                            style={{
                                                                padding: '4px 8px',
                                                                fontSize: '18px',
                                                                lineHeight: '1',
                                                                backgroundColor: 'transparent',
                                                                border: 'none',
                                                                color: '#d73a49',
                                                                cursor: 'pointer',
                                                                borderRadius: '4px',
                                                                transition: 'all 0.2s ease',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                minWidth: '24px',
                                                                height: '24px'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.target.style.backgroundColor = '#ffeef0';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.target.style.backgroundColor = 'transparent';
                                                            }}
                                                            title="Delete item"
                                                        >
                                                            ×
                                                        </button>
                                                    )}
                                                    {canModifyContent && isCompleted && (
                                                        <span
                                                            style={{
                                                                fontSize: '11px',
                                                                color: '#6a737d',
                                                                fontStyle: 'italic'
                                                            }}
                                                            title="Completed items cannot be deleted"
                                                        >
                                                            ✓
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                        {canModifyContent && (
                                            <input
                                                type="text"
                                                className="new-todo-input"
                                                placeholder="+ Add new checklist item..."
                                                onKeyDown={handleAddTodo}
                                                style={{
                                                    padding: '10px 12px',
                                                    fontSize: '13px',
                                                    borderRadius: '6px',
                                                    border: '1px solid #e1e4e8',
                                                    backgroundColor: '#ffffff',
                                                    outline: 'none',
                                                    transition: 'all 0.2s ease',
                                                    marginTop: '4px'
                                                }}
                                                onFocus={(e) => {
                                                    e.target.style.borderColor = '#0366d6';
                                                    e.target.style.boxShadow = '0 0 0 3px rgba(3, 102, 214, 0.1)';
                                                }}
                                                onBlur={(e) => {
                                                    e.target.style.borderColor = '#e1e4e8';
                                                    e.target.style.boxShadow = 'none';
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* ATTACHMENTS */}
                                <div className="modal-section" style={{ marginBottom: '16px' }}>
                                    <div className="section-header" style={{ marginBottom: '8px' }}>
                                        <h4 style={{ fontSize: '14px', margin: 0 }}>Attachments</h4>
                                        {canModifyContent && (
                                            <label className="btn-small upload-btn">
                                                &#128206; Add
                                                <input type="file" hidden onChange={handleFileUpload} accept="image/*" />
                                            </label>
                                        )}
                                    </div>
                                    <div className="attachments-list">
                                        {(selectedTicket.attachments || []).map((att) => {
                                            const isImage = att.contentType.startsWith('image/');
                                            return (
                                                <div key={att._id} style={{ marginBottom: '8px' }}>
                                                    {isImage ? (
                                                        <div style={{
                                                            padding: '8px',
                                                            backgroundColor: '#f6f8fa',
                                                            borderRadius: '6px',
                                                            border: '1px solid #e1e4e8'
                                                        }}>
                                                            <TicketImageAttachmentThumbnail
                                                                ticketId={selectedTicket._id}
                                                                attachment={att}
                                                                onView={() => handleViewTicketImage(att._id, att.filename, att.contentType)}
                                                                onAddToCanvas={() => handleAddToCanvas(att)}
                                                                onDelete={() => handleDeleteAttachment(att._id)}
                                                                canDelete={canModifyContent}
                                                                BACKEND_URL={BACKEND_URL}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="attachment-item" style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            padding: '8px 12px',
                                                            backgroundColor: '#f6f8fa',
                                                            borderRadius: '6px',
                                                            border: '1px solid #e1e4e8'
                                                        }}>
                                                            <div className="att-info" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                                                                <span style={{ fontSize: '16px' }}>📄</span>
                                                                <span className="att-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={att.filename}>{att.filename}</span>
                                                                <span className="att-size">{Math.round(att.size / 1024)} KB</span>
                                                            </div>
                                                            <div className="att-actions" style={{ display: 'flex', gap: '8px' }}>
                                                                <button
                                                                    onClick={() => {
                                                                        const token = localStorage.getItem('token');
                                                                        axios.get(`${BACKEND_URL}/api/tickets/${selectedTicket._id}/files/${att._id}`, {
                                                                            responseType: 'blob',
                                                                            headers: { Authorization: `Bearer ${token}` }
                                                                        }).then(response => {
                                                                            const blob = response.data;
                                                                            const url = window.URL.createObjectURL(blob);
                                                                            const a = document.createElement('a');
                                                                            a.href = url;
                                                                            a.download = att.filename;
                                                                            document.body.appendChild(a);
                                                                            a.click();
                                                                            window.URL.revokeObjectURL(url);
                                                                            document.body.removeChild(a);
                                                                        }).catch(err => {
                                                                            console.error('Download failed', err);
                                                                            setErrorMessage(err.response?.data?.error || "Failed to download file");
                                                                            setTimeout(() => setErrorMessage(''), 5000);
                                                                        });
                                                                    }}
                                                                    style={{ cursor: 'pointer', background: 'none', border: 'none', fontSize: '14px' }}
                                                                    title="Download"
                                                                >
                                                                    ⬇️
                                                                </button>
                                                                {canModifyContent && (
                                                                    <button
                                                                        onClick={() => handleDeleteAttachment(att._id)}
                                                                        style={{ cursor: 'pointer', background: 'none', border: 'none', fontSize: '14px', color: '#dc3545' }}
                                                                        title="Delete"
                                                                    >
                                                                        🗑️
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                        {(selectedTicket.attachments || []).length === 0 && <span className="empty-text">No files.</span>}
                                    </div>
                                </div>

                                {/* COMMENT LOG - GitHub Style */}
                                <div className="modal-section" style={{ paddingTop: '16px', borderTop: '1px solid #e1e4e8' }}>
                                    <div className="section-header" style={{ marginBottom: '12px' }}>
                                        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#24292e' }}>Activity Log</h4>
                                    </div>

                                    {reviewLoading ? (
                                        <div style={{ padding: '16px', textAlign: 'center', color: '#586069', fontSize: '13px' }}>Loading activity...</div>
                                    ) : review && review.comments && review.comments.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {review.comments.map((comment, idx) => (
                                                <div key={comment._id || `comment-${idx}-${comment.created_at}`} style={{
                                                    border: '1px solid #e1e4e8',
                                                    borderRadius: '6px',
                                                    backgroundColor: '#fff',
                                                    padding: '12px',
                                                    marginBottom: '0'
                                                }}>
                                                    {/* Comment Header */}
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        marginBottom: '8px'
                                                    }}>
                                                        <div style={{
                                                            width: '28px',
                                                            height: '28px',
                                                            borderRadius: '50%',
                                                            backgroundColor: '#0366d6',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: 'white',
                                                            fontWeight: '600',
                                                            fontSize: '12px',
                                                            flexShrink: 0
                                                        }}>
                                                            {(comment.author?.displayName || 'U').charAt(0).toUpperCase()}
                                                        </div>
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <div style={{ fontSize: '13px', fontWeight: '600', color: '#24292e' }}>
                                                                {comment.author?.displayName || 'Unknown'}
                                                            </div>
                                                            <div style={{ fontSize: '11px', color: '#586069' }}>
                                                                {new Date(comment.created_at).toLocaleString()}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Comment Body */}
                                                    <div style={{
                                                        fontSize: '13px',
                                                        color: '#24292e',
                                                        lineHeight: '1.5',
                                                        marginBottom: comment.attachments && comment.attachments.length > 0 ? '8px' : '0',
                                                        whiteSpace: 'pre-wrap',
                                                        wordBreak: 'break-word'
                                                    }}>
                                                        {comment.text}
                                                    </div>

                                                    {/* Attachments */}
                                                    {comment.attachments && comment.attachments.length > 0 && (
                                                        <div style={{
                                                            marginTop: '12px',
                                                            paddingTop: '12px',
                                                            borderTop: '1px solid #e1e4e8'
                                                        }}>
                                                            <div style={{
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                gap: '8px'
                                                            }}>
                                                                {comment.attachments.map((att) => {
                                                                    const isImage = att.contentType.startsWith('image/');
                                                                    const commentId = comment._id || `comment-${idx}`;

                                                                    return (
                                                                        <div key={att._id}>
                                                                            {isImage ? (
                                                                                // Image preview thumbnail
                                                                                <div style={{
                                                                                    padding: '8px',
                                                                                    backgroundColor: '#f6f8fa',
                                                                                    borderRadius: '6px',
                                                                                    border: '1px solid #e1e4e8'
                                                                                }}>
                                                                                    <ImageAttachmentThumbnail
                                                                                        ticketId={selectedTicket._id}
                                                                                        commentId={commentId}
                                                                                        attachment={att}
                                                                                        onView={() => handleViewImage(commentId, att._id, att.filename, att.contentType)}
                                                                                        onAddToCanvas={() => handleAddCommentImageToCanvas(commentId, att._id, att.filename, att.contentType)}
                                                                                        BACKEND_URL={BACKEND_URL}
                                                                                    />
                                                                                </div>
                                                                            ) : (
                                                                                // File attachment (non-image)
                                                                                <div key={att._id} style={{
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    gap: '10px',
                                                                                    padding: '8px 12px',
                                                                                    backgroundColor: '#f6f8fa',
                                                                                    borderRadius: '4px',
                                                                                    border: '1px solid #e1e4e8'
                                                                                }}>
                                                                                    <span style={{ fontSize: '16px' }}>📎</span>
                                                                                    <span style={{
                                                                                        flex: 1,
                                                                                        fontSize: '13px',
                                                                                        color: '#24292e',
                                                                                        overflow: 'hidden',
                                                                                        textOverflow: 'ellipsis',
                                                                                        whiteSpace: 'nowrap'
                                                                                    }} title={att.filename}>
                                                                                        {att.filename}
                                                                                    </span>
                                                                                    <span style={{ fontSize: '12px', color: '#586069' }}>
                                                                                        {Math.round(att.size / 1024)} KB
                                                                                    </span>
                                                                                    <button
                                                                                        onClick={() => handleDownloadAttachment(commentId, att._id, att.filename)}
                                                                                        style={{
                                                                                            background: 'none',
                                                                                            border: 'none',
                                                                                            cursor: 'pointer',
                                                                                            padding: '2px 6px',
                                                                                            color: '#0366d6',
                                                                                            fontSize: '11px',
                                                                                            fontWeight: '500',
                                                                                            flexShrink: 0
                                                                                        }}
                                                                                        onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                                                                                        onMouseOut={(e) => e.target.style.textDecoration = 'none'}
                                                                                    >
                                                                                        ⬇️
                                                                                    </button>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}

                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{
                                            padding: '16px',
                                            textAlign: 'center',
                                            color: '#586069',
                                            fontSize: '12px',
                                            border: '2px dashed #e1e4e8',
                                            borderRadius: '6px',
                                            backgroundColor: '#f6f8fa'
                                        }}>
                                            No activity yet. Start the conversation below.
                                        </div>
                                    )}

                                    {/* New Comment Input */}
                                    {canEditTicket(selectedTicket) && (
                                        <div style={{
                                            marginTop: '16px',
                                            paddingTop: '16px',
                                            borderTop: '2px solid #e1e4e8'
                                        }}>
                                            {commentError && (
                                                <div style={{
                                                    padding: '8px',
                                                    marginBottom: '8px',
                                                    backgroundColor: '#f8d7da',
                                                    border: '1px solid #f5c6cb',
                                                    borderRadius: '4px',
                                                    color: '#721c24',
                                                    fontSize: '11px'
                                                }}>
                                                    {commentError}
                                                </div>
                                            )}
                                            <div style={{ marginBottom: '8px' }}>
                                                <label style={{
                                                    display: 'block',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    color: '#24292e',
                                                    marginBottom: '6px'
                                                }}>
                                                    Add Comment
                                                </label>
                                                <textarea
                                                    value={newCommentText}
                                                    onChange={(e) => {
                                                        setNewCommentText(e.target.value);
                                                        if (commentError) setCommentError('');
                                                    }}
                                                    placeholder="Write a comment..."
                                                    style={{
                                                        width: '100%',
                                                        minHeight: '80px',
                                                        padding: '8px',
                                                        fontSize: '13px',
                                                        fontFamily: 'inherit',
                                                        border: commentError ? '1px solid #dc3545' : '1px solid #d1d5da',
                                                        borderRadius: '6px',
                                                        resize: 'vertical',
                                                        boxSizing: 'border-box',
                                                        lineHeight: '1.5'
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                                            handleAddComment();
                                                        }
                                                    }}
                                                />
                                            </div>

                                            {/* File Attachments */}
                                            {commentAttachments.length > 0 && (
                                                <div style={{
                                                    marginBottom: '8px',
                                                    padding: '8px',
                                                    backgroundColor: '#f6f8fa',
                                                    borderRadius: '6px',
                                                    border: '1px solid #e1e4e8'
                                                }}>
                                                    <div style={{
                                                        fontSize: '11px',
                                                        fontWeight: '600',
                                                        color: '#586069',
                                                        marginBottom: '6px'
                                                    }}>
                                                        Attachments ({commentAttachments.length}):
                                                    </div>
                                                    {commentAttachments.map((file, idx) => (
                                                        <div key={idx} style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            padding: '4px 8px',
                                                            marginBottom: '4px',
                                                            backgroundColor: 'white',
                                                            borderRadius: '4px',
                                                            fontSize: '11px'
                                                        }}>
                                                            <span>📎</span>
                                                            <span style={{
                                                                flex: 1,
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap'
                                                            }} title={file.name}>
                                                                {file.name}
                                                            </span>
                                                            <span style={{ color: '#586069', fontSize: '10px' }}>
                                                                {(file.size / 1024).toFixed(1)} KB
                                                            </span>
                                                            <button
                                                                onClick={() => removeCommentAttachment(idx)}
                                                                style={{
                                                                    background: 'none',
                                                                    border: 'none',
                                                                    color: '#dc3545',
                                                                    cursor: 'pointer',
                                                                    fontSize: '14px',
                                                                    padding: '0 4px'
                                                                }}
                                                                title="Remove"
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                marginBottom: '8px'
                                            }}>
                                                <label style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    padding: '4px 8px',
                                                    backgroundColor: '#f6f8fa',
                                                    border: '1px solid #d1d5da',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '11px',
                                                    color: '#24292e',
                                                    transition: 'background-color 0.2s'
                                                }}
                                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e1e4e8'}
                                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f6f8fa'}
                                                >
                                                    📎 Attach Photo
                                                    <input
                                                        type="file"
                                                        hidden
                                                        onChange={handleCommentFileChange}
                                                        accept="image/*,application/pdf"
                                                        multiple
                                                    />
                                                </label>
                                                <div style={{ fontSize: '11px', color: '#586069' }}>
                                                    Ctrl+Enter to submit
                                                </div>
                                            </div>

                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'flex-end'
                                            }}>
                                                <button
                                                    onClick={handleAddComment}
                                                    disabled={!newCommentText.trim()}
                                                    style={{
                                                        padding: '6px 12px',
                                                        backgroundColor: newCommentText.trim() ? '#28a745' : '#94d3a2',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        fontSize: '12px',
                                                        fontWeight: '500',
                                                        cursor: newCommentText.trim() ? 'pointer' : 'not-allowed',
                                                        transition: 'background-color 0.2s'
                                                    }}
                                                    onMouseOver={(e) => {
                                                        if (newCommentText.trim()) {
                                                            e.target.style.backgroundColor = '#22863a';
                                                        }
                                                    }}
                                                    onMouseOut={(e) => {
                                                        if (newCommentText.trim()) {
                                                            e.target.style.backgroundColor = '#28a745';
                                                        }
                                                    }}
                                                >
                                                    Comment
                                                </button>
                                            </div>
                                        </div>
                                    )}
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

            {/* Image Preview Modal */}
            {imagePreviewUrl && (
                <div
                    className="modal-overlay"
                    onClick={closeImagePreview}
                    style={{
                        zIndex: 2000,
                        backgroundColor: 'rgba(0, 0, 0, 0.85)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            maxWidth: '90vw',
                            maxHeight: '90vh',
                            position: 'relative',
                            backgroundColor: '#fff',
                            borderRadius: '8px',
                            padding: '12px',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '12px'
                        }}>
                            <div style={{
                                fontSize: '13px',
                                fontWeight: '600',
                                color: '#24292e',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: 'calc(90vw - 100px)'
                            }}>
                                {previewImageName}
                            </div>
                            <button
                                onClick={closeImagePreview}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '24px',
                                    cursor: 'pointer',
                                    color: '#666',
                                    padding: '0 8px',
                                    lineHeight: '1'
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <div style={{
                            maxWidth: '90vw',
                            maxHeight: 'calc(90vh - 60px)',
                            overflow: 'auto',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <img
                                src={imagePreviewUrl}
                                alt={previewImageName || 'Preview'}
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: 'calc(90vh - 60px)',
                                    height: 'auto',
                                    objectFit: 'contain'
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectDetails;
