import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { applicationAPI } from '../../services/api';
import { isAfter, format } from 'date-fns';

const JobDetailsModal = ({ job, onClose }) => {
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isVisible, setIsVisible] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [checkingApplied, setCheckingApplied] = useState(false);

  // Auth token now lives in an httpOnly cookie — presence of a cached user
  // object is our best lightweight signal that the viewer is logged in.
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const isDeadlinePassed = job?.deadline ? !isAfter(new Date(job.deadline), new Date()) : false;
  const isStudent = user?.role === 'student';
  const isLoggedIn = Boolean(user && (user.id || user._id));

  // Animation effect
  useEffect(() => {
    if (job) {
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      setTimeout(() => setIsVisible(true), 50);
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [job]);

  // Detect whether the current student has already applied for this job so
  // we can show an "Already Applied" state instead of the apply button.
  useEffect(() => {
    let cancelled = false;
    setAlreadyApplied(false);
    if (!job?._id || !isLoggedIn || !isStudent) return;
    (async () => {
      try {
        setCheckingApplied(true);
        const res = await applicationAPI.getMyApplications({ limit: 200 });
        const apps = res.data?.applications || [];
        const match = apps.some((a) => {
          const jobId = a.job?._id || a.job;
          return jobId?.toString() === job._id?.toString();
        });
        if (!cancelled) setAlreadyApplied(match);
      } catch (err) {
        // Non-fatal — fall back to allowing apply; server still enforces.
        console.error('Could not check application status:', err);
      } finally {
        if (!cancelled) setCheckingApplied(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [job?._id, isLoggedIn, isStudent]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      document.body.style.overflow = 'unset';
      onClose();
    }, 300);
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (coverLetter.length < 50) {
      setMessage({ type: 'error', text: 'Cover letter must be at least 50 characters long' });
      return;
    }
    if (coverLetter.length > 5000) {
      setMessage({ type: 'error', text: 'Cover letter cannot exceed 5000 characters' });
      return;
    }

    try {
      setLoading(true);
      await applicationAPI.applyForJob(job._id, { coverLetter });
      setMessage({ type: 'success', text: 'Application submitted successfully!' });
      setShowApplicationForm(false);
      setCoverLetter('');
      setAlreadyApplied(true);

      // Auto close success message after 3 seconds
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to submit application' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Get job type badge color
  const getTypeColor = (type) => {
    const colors = {
      'full-time': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'part-time': 'bg-blue-100 text-blue-800 border-blue-200',
      'contract': 'bg-purple-100 text-purple-800 border-purple-200',
      'internship': 'bg-orange-100 text-orange-800 border-orange-200',
      'remote': 'bg-cyan-100 text-cyan-800 border-cyan-200',
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Helper function to format salary display
  const formatSalary = (salary) => {
    if (!salary) return 'Competitive salary';
    
    if (typeof salary === 'object') {
      const { min, max, currency = 'USD' } = salary;
      if (min && max) {
        return `${currency} ${min.toLocaleString()} - ${currency} ${max.toLocaleString()}`;
      }
      if (min) {
        return `${currency} ${min.toLocaleString()}+`;
      }
      return 'Competitive salary';
    }
    
    if (typeof salary === 'string') {
      return salary;
    }
    
    if (typeof salary === 'number') {
      return `$${salary.toLocaleString()}`;
    }
    
    return 'Competitive salary';
  };

  // Safely handle arrays
  const safeArray = (arr) => Array.isArray(arr) ? arr : [];

  // Don't render if no job
  if (!job) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div 
        className={`relative bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200/50 transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header with Gradient Background */}
        <div className="relative bg-gradient-to-r from-emerald-600 to-blue-600 p-8 text-white">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-6 right-6 text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200 z-10"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>

          {/* Company Info */}
          <div className="flex items-start space-x-6 mb-6">
            <div className="flex-shrink-0 w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
              <span className="text-white text-2xl font-bold">
                {job.company?.charAt(0)?.toUpperCase() || 'C'}
              </span>
            </div>
            <div className="flex-1 min-w-0 pr-12">
              <h2 className="text-3xl font-bold mb-2 text-white">{job.title || 'Job Title'}</h2>
              <p className="text-xl text-white/90 mb-2">{job.company || 'Company Name'}</p>
              <div className="flex items-center text-white/80">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                {job.location || 'Location not specified'}
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-3">
            <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getTypeColor(job.type)}`}>
              💼 {job.type?.charAt(0)?.toUpperCase() + job.type?.slice(1)?.replace('-', ' ') || 'Not specified'}
            </span>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${
              isDeadlinePassed 
                ? 'bg-red-100 text-red-800 border-red-200' 
                : 'bg-white/90 text-gray-800 border-gray-200'
            }`}>
              ⏰ Deadline: {job.deadline ? format(new Date(job.deadline), 'MMM dd, yyyy') : 'Not specified'}
              {isDeadlinePassed && ' (Expired)'}
            </span>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto max-h-[calc(90vh-240px)] p-8">
          
          {/* Message */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-2xl border transition-all duration-300 ${
              message.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                : 'bg-red-50 text-red-800 border-red-200'
            }`}>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  {message.type === 'success' ? (
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  ) : (
                    <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
                  )}
                </svg>
                <span>{message.text}</span>
              </div>
            </div>
          )}

          {/* Job Description */}
          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl p-6 border border-emerald-200/50 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              Job Description
            </h3>
            <p className="text-gray-700 whitespace-pre-line leading-relaxed">
              {job.description || 'No description provided.'}
            </p>
          </div>

          {/* Two Column Layout */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            
            {/* Job Information */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200/50">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Job Information
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Posted by:</span>
                  <span className="font-medium text-gray-900">{job.postedBy?.name || 'Company'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Posted on:</span>
                  <span className="font-medium text-gray-900">
                    {job.createdAt ? format(new Date(job.createdAt), 'MMM dd, yyyy') : 'Recently'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Salary:</span>
                  <span className="font-medium text-emerald-600">{formatSalary(job.salary)}</span>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                Required Skills
              </h4>
              {safeArray(job.skills).length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {safeArray(job.skills).map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 rounded-full text-sm font-medium border border-purple-200">
                      {String(skill)}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No specific skills listed</p>
              )}
            </div>
          </div>

          {/* Requirements */}
          {safeArray(job.requirements).length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm mb-6">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Requirements
              </h4>
              <ul className="space-y-2">
                {safeArray(job.requirements).map((req, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700">{String(req)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Application Section */}
          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl p-8 border border-emerald-200/50">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              Apply for this Position
            </h3>

            {!isLoggedIn ? (
              <div className="text-center p-6 bg-white rounded-xl border border-gray-200">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <p className="text-gray-600 mb-4">Please login to apply for this job.</p>
                <button className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-xl font-medium hover:from-emerald-700 hover:to-blue-700 transition-all duration-200">
                  Login to Apply
                </button>
              </div>
            ) : !isStudent ? (
              <div className="text-center p-6 bg-white rounded-xl border border-gray-200">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-600">Only students can apply for jobs.</p>
              </div>
            ) : isDeadlinePassed ? (
              <div className="text-center p-6 bg-white rounded-xl border border-red-200">
                <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-600 font-medium mb-2">Application Deadline Passed</p>
                <p className="text-gray-600">This job posting is no longer accepting applications.</p>
              </div>
            ) : alreadyApplied ? (
              <div className="text-center p-6 bg-white rounded-xl border border-emerald-200">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-emerald-700 font-semibold text-lg mb-2">You've already applied</p>
                <p className="text-gray-600 mb-5">Track the status of this application and others on your applications page.</p>
                <Link
                  to="/applications"
                  onClick={handleClose}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl font-semibold shadow-sm transition-colors"
                >
                  View My Applications
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            ) : checkingApplied ? (
              <div className="flex items-center justify-center p-6 bg-white rounded-xl border border-gray-200">
                <div className="w-6 h-6 border-2 border-gray-200 border-t-emerald-600 rounded-full animate-spin" />
              </div>
            ) : !showApplicationForm ? (
              <div className="text-center">
                <button
                  onClick={() => setShowApplicationForm(true)}
                  className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-2xl hover:from-emerald-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 font-bold text-lg shadow-lg"
                >
                  <svg className="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  Apply for this Job
                </button>
                <p className="text-gray-600 mt-3 text-sm">Ready to take the next step in your career?</p>
              </div>
            ) : (
              <form onSubmit={handleApply} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    📝 Cover Letter *
                  </label>
                  <textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Tell us why you're interested in this position and what makes you a great fit..."
                    rows={6}
                    maxLength={5000}
                    className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 resize-none"
                    required
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p
                      className={`text-sm ${
                        coverLetter.length > 5000
                          ? 'text-red-600'
                          : coverLetter.length >= 50
                          ? 'text-emerald-600'
                          : 'text-gray-500'
                      }`}
                    >
                      {coverLetter.length}/5000 characters (min 50)
                    </p>
                    {coverLetter.length >= 50 && coverLetter.length <= 5000 && (
                      <span className="text-emerald-600 text-sm font-medium">✓ Ready to submit</span>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={loading || coverLetter.length < 50 || coverLetter.length > 5000}
                    className="flex-1 py-4 px-6 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-2xl hover:from-emerald-700 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 transition-all duration-200 font-bold shadow-lg disabled:shadow-none disabled:transform-none transform hover:scale-105"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Submitting...
                      </div>
                    ) : (
                      'Submit Application'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowApplicationForm(false)}
                    className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsModal;