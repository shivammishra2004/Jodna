import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Projects.css';
import ProjectDetails from './ProjectDetails';

const BACKEND_URL = 'http://localhost:5000';

const Projects = ({ user, sandboxProxy }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);

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
        <h1>Projects</h1>
        {canCreateProject && (
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            + New Project
          </button>
        )}
      </div>

      {loading ? (
        <p>Loading projects...</p>
      ) : projects.length === 0 ? (
        <div className="no-projects">
          <p>No projects found. Create one to get started!</p>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map(project => (
            <div
              key={project._id}
              className="project-card"
              onClick={() => setSelectedProject(project)}
            >
              <div className="project-name">{project.name}</div>
              <div className="project-description">{project.description || 'No description'}</div>
              <div className="project-meta">
                <span>{new Date(project.updated_at).toLocaleDateString()}</span>
                <span className={`status-badge status-${project.status.toLowerCase()}`}>
                  {project.status}
                </span>
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