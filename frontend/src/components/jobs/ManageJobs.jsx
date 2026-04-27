import { useState, useEffect } from 'react';
import { jobAPI } from '../../services/api';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PencilIcon, TrashIcon, EyeIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyJobs();

    // Check for success message from posting
    if (location.state?.message) {
      setMessage(location.state.message);
      setTimeout(() => setMessage(''), 5000);
    }

    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchMyJobs, 60000);
    return () => clearInterval(interval);
  }, [location]);

  const fetchMyJobs = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await jobAPI.getMyJobs();

      let jobsData = response.data.jobs || response.data || [];

      // Fetch application count for each job
      if (Array.isArray(jobsData)) {
        jobsData = await Promise.all(jobsData.map(async (job) => {
          try {
            const applicantsResponse = await jobAPI.getJobApplicants(job._id);
            const applicantsData = applicantsResponse.data.applicants ||
              applicantsResponse.data.applications ||
              applicantsResponse.data ||
              [];
            return {
              ...job,
              applicantCount: Array.isArray(applicantsData) ? applicantsData.length : 0,
              applicants: applicantsData
            };
          } catch (error) {
            console.warn(`Failed to fetch applicants for job ${job._id}:`, error);
            return { ...job, applicantCount: 0, applicants: [] };
          }
        }));
      }

      setJobs(jobsData);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError(error.response?.data?.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const refreshJobData = async () => {
    await fetchMyJobs();
  };

  const handleDeleteJob = async (jobId) => {
    if (!confirm('Are you sure you want to delete this job?')) return;

    try {
      await jobAPI.deleteJob(jobId);
      setJobs(jobs.filter(job => job._id !== jobId));
      setMessage('Job deleted successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting job:', error);
      setError('Failed to delete job');
    }
  };

  const handleViewApplicants = (jobId) => {
    navigate(`/jobs/${jobId}/applicants`);
  };

  const handleEditJob = (jobId) => {
    navigate(`/jobs/${jobId}/edit`);
  };

  const getStatusColor = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const daysLeft = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0)
      return 'text-red-700 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-500/10 dark:border-red-500/25';
    if (daysLeft <= 7)
      return 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-500/10 dark:border-amber-500/25';
    return 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-500/10 dark:border-emerald-500/25';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-200 dark:border-white/10 border-t-blue-600 dark:border-t-indigo-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading your jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 tracking-tight">Manage Jobs</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage your job postings and track applications</p>
          </div>
          <Link
            to="/jobs/post"
            className="inline-flex items-center px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Post New Job
          </Link>
        </div>

        {/* Messages */}
        {message && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-sm flex items-center">
            <svg className="w-5 h-5 mr-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm flex items-center">
            <svg className="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            {error}
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-900/60 p-5 rounded-2xl border border-gray-200 dark:border-white/10">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-1">{jobs.length}</div>
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Jobs</div>
          </div>
          <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
            <div className="text-2xl font-bold text-emerald-700 mb-1">
              {jobs.filter(job => new Date(job.deadline) > new Date()).length}
            </div>
            <div className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Active Jobs</div>
          </div>
          <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100">
            <div className="text-2xl font-bold text-amber-700 mb-1">
              {jobs.filter(job => new Date(job.deadline) <= new Date()).length}
            </div>
            <div className="text-xs font-medium text-amber-600 uppercase tracking-wider">Expired Jobs</div>
          </div>
          <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 relative group">
            <div className="text-2xl font-bold text-blue-700 mb-1">
              {jobs.reduce((sum, job) => sum + (job.applicants?.length || job.applicationCount || job.applications?.length || 0), 0)}
            </div>
            <div className="text-xs font-medium text-blue-600 uppercase tracking-wider flex items-center justify-between">
              Total Applications
              <button
                onClick={refreshJobData}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-blue-100 rounded-md text-blue-600"
                title="Refresh application counts"
              >
                <ArrowPathIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Jobs List */}
        {jobs.length === 0 ? (
          <div className="bg-white dark:bg-gray-900/60 rounded-2xl border border-dashed border-gray-300 dark:border-white/15 p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-2xl mb-4">
              <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8zM9 12l2 2 4-4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No Jobs Posted Yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">Start by posting your first job to attract talented candidates.</p>
            <Link
              to="/jobs/post"
              className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
            >
              Post Your First Job
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="bg-white dark:bg-gray-900/60 rounded-2xl
                           border border-gray-200 dark:border-white/10
                           hover:border-gray-300 dark:hover:border-white/20
                           hover:shadow-sm dark:hover:shadow-black/40
                           transition-all p-6"
              >

                {/* Header Row */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-5">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">{job.title}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        {job.company}
                      </span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {job.location}
                      </span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        Expires {formatDate(job.deadline)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end gap-2">
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-medium border uppercase tracking-wide ${getStatusColor(job.deadline)}`}>
                      {new Date(job.deadline) > new Date() ? 'Active' : 'Expired'}
                    </span>
                    <button
                      onClick={refreshJobData}
                      className="inline-flex items-center justify-center px-2.5 py-1 bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300 rounded-md text-[11px] font-medium border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors group"
                      title="Refresh count"
                    >
                      <ArrowPathIcon className="w-3 h-3 mr-1 group-hover:rotate-180 transition-transform duration-500" />
                      {job.applicants?.length || job.applicationCount || job.applications?.length || 0} applications
                    </button>
                  </div>
                </div>

                {/* Tags & Actions Row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5 gap-4">

                  {/* Tags */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/25 rounded-md text-[11px] font-medium capitalize">
                      {job.type?.replace('-', ' ') || 'Full Time'}
                    </span>
                    {job.skills && job.skills.slice(0, 3).map((skill, index) => (
                      <span key={index} className="px-2.5 py-1 bg-gray-50 text-gray-600 border border-gray-200 dark:bg-white/5 dark:text-gray-300 dark:border-white/10 rounded-md text-[11px] font-medium">
                        {skill}
                      </span>
                    ))}
                    {job.skills && job.skills.length > 3 && (
                      <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 pl-1">
                        +{job.skills.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => handleViewApplicants(job._id)}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/20 dark:hover:text-blue-200 rounded-lg text-sm font-medium transition-colors"
                    >
                      <EyeIcon className="w-4 h-4 mr-1.5" />
                      View Applicants
                    </button>
                    <button
                      onClick={() => handleEditJob(job._id)}
                      className="inline-flex items-center justify-center p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-gray-200 dark:hover:border-white/10"
                      title="Edit"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteJob(job._id)}
                      className="inline-flex items-center justify-center p-2 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-500/25"
                      title="Delete"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageJobs;