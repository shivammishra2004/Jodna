import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Projects.css';
import ProjectDetails from './ProjectDetails';

import config from "../../config";
const { BACKEND_URL } = config;

const Projects = ({ user, sandboxProxy }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState('All');

  const canCreateProject = user.role === 'ADMIN' || user.role === 'MANAGER';

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${BACKEND_URL}/api/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(res.data);
    } catch (err) {
      console.error("Failed to fetch projects", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!newProject.name.trim()) return;

    setCreating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${BACKEND_URL}/api/projects`, newProject, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects([res.data, ...projects]);
      setShowCreateModal(false);
      setNewProject({ name: '', description: '' });
    } catch (err) {
      console.error("Failed to create project", err);
      alert("Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  const handleStatusChange = async (e, project, newStatus) => {
    e.stopPropagation();
    console.log(`[JODNA] Click registered. New Status: ${newStatus} for ${project.name}`);

    if (project.status === newStatus) return;

    try {
      const token = localStorage.getItem('token');
      console.log(`[JODNA] Token found: ${!!token}, Sending PUT to ${BACKEND_URL}/api/projects/${project._id}`);
      
      const response = await axios.put(
        `${BACKEND_URL}/api/projects/${project._id}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log("[JODNA] Update successful:", response.data);
      setProjects(prev => prev.map(p => p._id === project._id ? response.data : p));

    } catch (err) {
      console.error("[JODNA] Update error:", err);
      if (err.response) {
         console.error("[JODNA] Server Responded with:", err.response.status, err.response.data);
         alert(`Error: ${err.response.data.error || 'Server rejected request'}`);
      } else if (err.request) {
         console.error("[JODNA] No response received (Network Error).");
         alert("Network Error: Backend not reachable. Ensure server is running and accessible.");
      } else {
         alert("Error: " + err.message);
      }
    }
  };

  const filteredProjects = projects.filter(project => {
    if (filter === 'All') return true;
    return project.status === filter;
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (a.status === 'Closed' && b.status !== 'Closed') return 1;
    if (a.status !== 'Closed' && b.status === 'Closed') return -1;
    return new Date(b.updated_at) - new Date(a.updated_at);
  });

  if (selectedProject) {
    return (
      <ProjectDetails
        project={selectedProject}
        user={user}
        sandboxProxy={sandboxProxy}
        onBack={() => setSelectedProject(null)}
      />
    );
  }

  return (
    <div className="projects-container">
      <div className="projects-header">
        <div className="header-top">
          <select 
            className="status-filter-dropdown"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All Projects</option>
            <option value="Active">Active</option>
            <option value="Closed">Closed</option>
          </select>

          {canCreateProject && (
            <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
              + New Project
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <p>Loading projects...</p>
      ) : projects.length === 0 ? (
        <div className="no-projects">
          <p>No projects found. Create one to get started!</p>
        </div>
      ) : (
        <div className="projects-grid">
          {sortedProjects.map(project => (
            <div
              key={project._id}
              className="project-card"
              onClick={() => setSelectedProject(project)}
            >
              <div className={`project-name ${project.status === 'Closed' ? 'closed' : ''}`}>
                {project.name}
              </div>
              <div className="project-description">{project.description || 'No description'}</div>
              <div className="project-meta">
                <span>{new Date(project.updated_at).toLocaleDateString()}</span>
                {canCreateProject ? (
                  <div className="project-status-select-container" onClick={e => e.stopPropagation()}>
                     <select 
                        className={`status-select ${project.status.toLowerCase()}`}
                        value={project.status}
                        onChange={(e) => handleStatusChange(e, project, e.target.value)}
                     >
                       <option value="Active">Active</option>
                       <option value="Closed">Closed</option>
                     </select>
                  </div>
                ) : (
                  <span className={`status-badge status-${project.status.toLowerCase()}`}>
                    {project.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Project</h2>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Project Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={newProject.name}
                  onChange={e => setNewProject({ ...newProject, name: e.target.value })}
                  placeholder="e.g. Website Redesign"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  className="form-input"
                  value={newProject.description}
                  onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Describe the project..."
                  rows="3"
                />
              </div>
            </div>
            <div className="modal-actions">
              <button
                className="modal-button cancel-button"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
              <button
                className="modal-button confirm-button"
                onClick={handleCreateProject}
                disabled={creating || !newProject.name.trim()}
              >
                {creating ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;