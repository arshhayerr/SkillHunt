import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { jobAPI } from '../../services/api';
import api from '../../services/api';

const JobApplicants = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchJobAndApplicants();
  }, [jobId]);

  const fetchJobAndApplicants = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching job and applicants for jobId:', jobId);
      
      // Fetch job details
      const jobResponse = await jobAPI.getJob(jobId);
      console.log('Job response:', jobResponse.data);
      setJob(jobResponse.data);

      // Fetch applicants for this job
      const applicantsResponse = await jobAPI.getJobApplicants(jobId);
      console.log('Applicants response:', applicantsResponse.data);
      
      // Handle different response structures
      const applicantsData = applicantsResponse.data.applicants || 
                           applicantsResponse.data.applications || 
                           applicantsResponse.data || 
                           [];
      
      setApplicants(Array.isArray(applicantsData) ? applicantsData : []);
      
    } catch (error) {
      console.error('Error fetching job applicants:', error);
      setError(error.response?.data?.message || 'Failed to load applicants');
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Use only the working endpoint (Method 5)
  const updateApplicationStatus = async (applicationId, status) => {
    if (!confirm(`Are you sure you want to ${status} this application?`)) return;
    
    try {
      console.log('Updating application status:', applicationId, status);
      
      // ✅ Use the working endpoint directly
      const response = await api.put(`/applications/${applicationId}/status`, { status });
      console.log('✅ Status update successful:', response.data);
      
      // Show success message
      alert(`✅ Application status successfully updated to ${status.toUpperCase()}!`);
      
      // Update local state immediately
      setApplicants(prev => prev.map(app => 
        app._id === applicationId ? { ...app, status } : app
      ));
      
      // Refresh data from server after 1 second
      setTimeout(() => fetchJobAndApplicants(), 1000);
      
    } catch (error) {
      console.error('❌ Error updating application status:', error);
      
      // ✅ FALLBACK: Update UI optimistically if API fails
      if (error.response?.status === 404 || error.response?.status === 500) {
        console.log('⚠️ API failed, updating UI optimistically');
        
        // Update local state immediately
        setApplicants(prev => prev.map(app => 
          app._id === applicationId ? { ...app, status } : app
        ));
        
        alert(`⚠️ Application status updated to ${status.toUpperCase()} (locally)\n\nNote: Backend update failed but UI is updated. The change may reset on page refresh.`);
      } else {
        alert(`❌ Failed to update application status: ${error.response?.data?.message || error.message || 'Please try again.'}`);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'shortlisted': return 'bg-purple-100 text-purple-800';
      case 'viewed': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link 
          to="/jobs/manage"
          className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center"
        >
          ← Back to Manage Jobs
        </Link>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-center">
          <h3 className="font-medium mb-2">Error Loading Applicants</h3>
          <p>{error}</p>
          <button 
            onClick={fetchJobAndApplicants}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link 
          to="/jobs/manage"
          className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center"
        >
          ← Back to Manage Jobs
        </Link>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Applicants for "{job?.title || 'Loading...'}"
        </h1>
        <div className="text-gray-600">
          <p>📍 {job?.location} | 🏢 {job?.company}</p>
          <p className="mt-2">
            {applicants.length} applicant{applicants.length !== 1 ? 's' : ''} found
          </p>
        </div>
      </div>

      {/* Applicants List */}
      {applicants.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.196-2.121M17 20H7a3 3 0 01-3-3v-2a3 3 0 015.196-2.121M17 20v-2a3 3 0 00-3-3H7a3 3 0 00-3 3v2M12 7a4 4 0 00-4 4v2a3 3 0 003 3h2a3 3 0 003-3v-2a4 4 0 00-4-4z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h3>
          <p className="text-gray-500">Applications will appear here once candidates start applying</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applicants.map((application) => (
            <div key={application._id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {application.student?.name || application.applicantName || 'Anonymous'}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">
                    📧 {application.student?.email || application.applicantEmail || 'No email'}
                  </p>
                  <p className="text-gray-600 text-sm">
                    📅 Applied {new Date(application.createdAt || application.appliedAt).toLocaleDateString()}
                  </p>
                </div>
                
                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(application.status)}`}>
                  {application.status || 'applied'}
                </span>
              </div>

              {/* Cover Letter */}
              {application.coverLetter && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-800 mb-2">Cover Letter:</h4>
                  <p className="text-gray-600 text-sm bg-gray-50 p-4 rounded-lg">
                    {application.coverLetter}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-4 border-t">
                <button
                  onClick={() => updateApplicationStatus(application._id, 'viewed')}
                  className={`px-4 py-2 rounded-md transition-colors text-sm ${
                    application.status === 'viewed'
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-yellow-600 text-white hover:bg-yellow-700'
                  }`}
                  disabled={application.status === 'viewed'}
                >
                  Mark as Viewed
                </button>
                <button
                  onClick={() => updateApplicationStatus(application._id, 'shortlisted')}
                  className={`px-4 py-2 rounded-md transition-colors text-sm ${
                    application.status === 'shortlisted'
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                  disabled={application.status === 'shortlisted'}
                >
                  Shortlist
                </button>
                <button
                  onClick={() => updateApplicationStatus(application._id, 'accepted')}
                  className={`px-4 py-2 rounded-md transition-colors text-sm ${
                    application.status === 'accepted'
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                  disabled={application.status === 'accepted'}
                >
                  Accept
                </button>
                <button
                  onClick={() => updateApplicationStatus(application._id, 'rejected')}
                  className={`px-4 py-2 rounded-md transition-colors text-sm ${
                    application.status === 'rejected'
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                  disabled={application.status === 'rejected'}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobApplicants;