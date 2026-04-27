import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectAPI } from '../../services/api';

const ProjectsList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMyProjects();
  }, []);

  const fetchMyProjects = async () => {
    try {
      const response = await projectAPI.getMyProjects();
      const data = response.data;
      setProjects(data.projects || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (projectId, projectTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${projectTitle}"?`)) {
      return;
    }

    try {
      await projectAPI.deleteProject(projectId);
        setProjects(projects.filter(project => project._id !== projectId));
        alert('Project deleted successfully!');
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg text-gray-600">Loading your projects...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-600 mb-4">{error}</div>
        <button 
          onClick={fetchMyProjects}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Projects</h1>
          <p className="text-gray-600 mt-2">
            {projects.length} project{projects.length !== 1 ? 's' : ''} in your portfolio
          </p>
        </div>
        <Link 
          to="/projects/new"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center space-x-2"
        >
          <span>+</span>
          <span>Add New Project</span>
        </Link>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-6">
            <svg className="mx-auto h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
            <p className="text-gray-400 mb-6">Create your first project to showcase your skills to recruiters!</p>
          </div>
          <Link 
            to="/projects/new"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Create Your First Project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project._id} className="bg-white rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition duration-200">
              {/* Card Header */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-gray-800 line-clamp-1">
                    {project.title}
                  </h3>
                  <div className="flex items-center space-x-1">
                    {project.isPublic ? (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Public
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                        Private
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {project.description.length > 120 
                    ? project.description.substring(0, 120) + '...' 
                    : project.description
                  }
                </p>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {project.techStack.slice(0, 4).map((tech, index) => (
                    <span 
                      key={index} 
                      className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.techStack.length > 4 && (
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                      +{project.techStack.length - 4} more
                    </span>
                  )}
                </div>

                {/* Links */}
                <div className="flex space-x-3 mb-4">
                  {project.githubUrl && (
                    <a 
                      href={project.githubUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-gray-800 transition duration-200"
                    >
                      <span className="text-xs">GitHub</span>
                    </a>
                  )}
                  {project.liveUrl && (
                    <a 
                      href={project.liveUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 transition duration-200"
                    >
                      <span className="text-xs">Live Demo</span>
                    </a>
                  )}
                </div>

                {/* Created Date */}
                <p className="text-xs text-gray-400 mb-4">
                  Created {new Date(project.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Card Footer */}
              <div className="border-t border-gray-100 px-6 py-3 flex justify-between">
                <Link 
                  to={`/projects/${project._id}/edit`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium transition duration-200"
                >
                  Edit
                </Link>
                <button 
                  onClick={() => handleDelete(project._id, project.title)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium transition duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsList;