import { useState } from 'react';
import { jobAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const PostJob = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    type: 'full-time',
    description: '',
    requirements: [''],
    skills: [''],
    deadline: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayChange = (index, value, field) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData(prev => ({
      ...prev,
      [field]: newArray
    }));
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (index, field) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      [field]: newArray.length > 0 ? newArray : ['']
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      setLoading(true);
      
      // Clean up empty array items
      const cleanedData = {
        ...formData,
        requirements: formData.requirements.filter(req => req.trim()),
        skills: formData.skills.filter(skill => skill.trim())
      };

      console.log('Submitting job data:', cleanedData);
      const response = await jobAPI.createJob(cleanedData);
      console.log('Job created successfully:', response);
      
      // Success - redirect to job management
      navigate('/jobs/manage', { 
        state: { message: 'Job posted successfully!' }
      });
      
    } catch (error) {
      console.error('Error posting job:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to post job';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Post a New Job</h1>
        <p className="text-gray-600">Find the perfect candidates for your open position</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Job Title */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g. Frontend Developer"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Company */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name *
            </label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleInputChange}
              placeholder="e.g. TechCorp Solutions"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location *
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="e.g. San Francisco, CA"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Job Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Type *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="full-time">Full Time</option>
              <option value="part-time">Part Time</option>
              <option value="internship">Internship</option>
              <option value="contract">Contract</option>
              <option value="remote">Remote</option>
            </select>
          </div>

          {/* Application Deadline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Application Deadline *
            </label>
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleInputChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Job Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the role, responsibilities, and what you're looking for..."
              rows={6}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Requirements */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Requirements
            </label>
            {formData.requirements.map((req, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={req}
                  onChange={(e) => handleArrayChange(index, e.target.value, 'requirements')}
                  placeholder={`Requirement ${index + 1}`}
                  className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {formData.requirements.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem(index, 'requirements')}
                    className="px-3 py-2 text-red-600 hover:text-red-800"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('requirements')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              + Add Requirement
            </button>
          </div>

          {/* Skills */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Required Skills
            </label>
            {formData.skills.map((skill, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={skill}
                  onChange={(e) => handleArrayChange(index, e.target.value, 'skills')}
                  placeholder={`Skill ${index + 1} (e.g. React, Node.js)`}
                  className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {formData.skills.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem(index, 'skills')}
                    className="px-3 py-2 text-red-600 hover:text-red-800"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('skills')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              + Add Skill
            </button>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium"
          >
            {loading ? 'Posting...' : 'Post Job'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostJob;