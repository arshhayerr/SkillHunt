import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // ADD THIS IMPORT
import { projectAPI } from '../../services/api';

const AddProject = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // ADD THIS LINE
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({}); // ADD THIS LINE
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    techStack: '',
    githubUrl: '',
    liveUrl: '',
    isPublic: true
  });

  // ADD THIS VALIDATION FUNCTION
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Project title is required';
    if (!formData.description.trim()) newErrors.description = 'Project description is required';
    if (!formData.techStack.trim()) newErrors.techStack = 'Technologies used are required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
  
    setLoading(true);
    
    try {
      const projectData = {
        ...formData,
        techStack: formData.techStack.split(',').map(tech => tech.trim()),
        userId: user?.id || user?._id || 'anonymous',
        userName: user?.name || 'Anonymous User',
        userEmail: user?.email || '',
        createdAt: new Date().toISOString()
      };
  
      // DEBUG LINES:
      console.log('=== SAVING PROJECT DEBUG ===');
      console.log('Current user object:', user);
      console.log('User ID being saved:', user?.id || user?._id || 'anonymous');
      console.log('Project data being saved:', projectData);
      console.log('============================');
  
      // TRY BACKEND FIRST, FALLBACK TO LOCALSTORAGE
      let projectSaved = false;
      
      try {
        await projectAPI.createProject(projectData);
            console.log('✅ Project saved to backend successfully');
            projectSaved = true;
      } catch (backendError) {
        console.log('⚠️ Backend not available, using localStorage fallback');
        console.log('Backend error:', backendError.message);
      }
  
      // FALLBACK: Save to localStorage if backend fails
      if (!projectSaved) {
        const existingProjects = JSON.parse(localStorage.getItem('userProjects') || '[]');
        const newProject = {
          ...projectData,
          id: Date.now().toString(),
          _id: Date.now().toString(), // For compatibility with backend format
        };
        
        console.log('Existing projects before save:', existingProjects);
        console.log('New project being added:', newProject);
        
        localStorage.setItem('userProjects', JSON.stringify([...existingProjects, newProject]));
        
        // VERIFY SAVE:
        const savedProjects = JSON.parse(localStorage.getItem('userProjects') || '[]');
        console.log('All projects after save:', savedProjects);
        console.log('💾 Project saved to localStorage');
      }
  
      navigate('/projects/my', { 
        state: { message: 'Project created successfully!' }
      });
  
    } catch (error) {
      console.error('Error creating project:', error);
      setErrors({ submit: 'Failed to create project. Please try again.' });
    } finally {
      setLoading(false);
    }
  };
  
  // ...rest of your existing component code stays the same...
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Add New Project</h1>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 space-y-6">
        {/* Error Display */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{errors.submit}</p>
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Title *
          </label>
          <input
            type="text"
            required
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            placeholder="E-Commerce Platform"
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            required
            rows={4}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="A full-stack e-commerce application with user authentication, product catalog, shopping cart, and payment integration..."
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>

        {/* Tech Stack */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Technologies Used *
          </label>
          <input
            type="text"
            required
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.techStack ? 'border-red-500' : 'border-gray-300'
            }`}
            value={formData.techStack}
            onChange={(e) => setFormData({...formData, techStack: e.target.value})}
            placeholder="React, Node.js, Express, MongoDB, Tailwind CSS"
          />
          <p className="text-sm text-gray-500 mt-1">Separate technologies with commas</p>
          {errors.techStack && <p className="text-red-500 text-sm mt-1">{errors.techStack}</p>}
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
            onClick={() => navigate('/')}
            className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
          >
            {loading ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProject;