import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { projectAPI } from '../../services/api';

const EditProject = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get project ID from URL
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    techStack: '',
    githubUrl: '',
    liveUrl: '',
    isPublic: true
  });

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await projectAPI.getProject(id);
      const data = response.data;

      if (response.status === 200 && data.project) {
        const project = data.project;
        setFormData({
          title: project.title,
          description: project.description,
          techStack: project.techStack.join(', '), // Convert array back to string
          githubUrl: project.githubUrl || '',
          liveUrl: project.liveUrl || '',
          isPublic: project.isPublic
        });
      } else {
        setError(data.message || 'Failed to fetch project');
      }
    } catch (err) {
      console.error('Error fetching project:', err);
      setError('Failed to fetch project');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Convert comma-separated techStack to array
    const projectData = {
      ...formData,
      techStack: formData.techStack.split(',').map(tech => tech.trim()).filter(tech => tech)
    };

    try {
      const response = await projectAPI.updateProject(id, projectData);

      if (response.status === 200) {
        alert('Project updated successfully!');
        navigate('/projects/my'); // Go back to projects list
      } else {
        alert('Error updating project');
      }
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Error updating project');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg text-gray-600">Loading project...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-600 mb-4">{error}</div>
        <button 
          onClick={() => navigate('/projects/my')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <button 
          onClick={() => navigate('/projects/my')}
          className="text-blue-600 hover:text-blue-800 mb-4"
        >
          ← Back to My Projects
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Edit Project</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Title *
          </label>
          <input
            type="text"
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            placeholder="E-Commerce Platform"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            required
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="A full-stack e-commerce application..."
          />
        </div>

        {/* Tech Stack */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Technologies Used *
          </label>
          <input
            type="text"
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.techStack}
            onChange={(e) => setFormData({...formData, techStack: e.target.value})}
            placeholder="React, Node.js, Express, MongoDB, Tailwind CSS"
          />
          <p className="text-sm text-gray-500 mt-1">Separate technologies with commas</p>
        </div>

        {/* GitHub URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            GitHub Repository URL
          </label>
          <input
            type="url"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.githubUrl}
            onChange={(e) => setFormData({...formData, githubUrl: e.target.value})}
            placeholder="https://github.com/username/project"
          />
        </div>

        {/* Live URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Live Demo URL
          </label>
          <input
            type="url"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.liveUrl}
            onChange={(e) => setFormData({...formData, liveUrl: e.target.value})}
            placeholder="https://myproject.vercel.app"
          />
        </div>

        {/* Public/Private */}
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="isPublic"
            checked={formData.isPublic}
            onChange={(e) => setFormData({...formData, isPublic: e.target.checked})}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="isPublic" className="text-sm font-medium text-gray-700">
            Make this project public (visible to recruiters and other users)
          </label>
        </div>

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => navigate('/projects/my')}
            className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
          >
            {submitting ? 'Updating...' : 'Update Project'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProject;