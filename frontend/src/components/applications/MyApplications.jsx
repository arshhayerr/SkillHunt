import { useState, useEffect } from 'react';
import { applicationAPI, aiAPI } from '../../services/api';
import InterviewQuestionsModal from '../ai/InterviewQuestionsModal';
import { format, formatDistanceToNow } from 'date-fns';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [aiModal, setAiModal] = useState({
    isOpen: false,
    loading: false,
    questions: null,
    jobTitle: '',
    company: '',
  });

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await applicationAPI.getMyApplications();
      setApplications(response.data.applications || []);
    } catch (err) {
      setError('Failed to fetch applications');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuestions = async (jobId, jobTitle, company) => {
    setAiModal({
      isOpen: true,
      loading: true,
      questions: null,
      jobTitle,
      company,
    });

    try {
      const response = await aiAPI.generateInterviewQuestions(jobId);
      setAiModal((prev) => ({
        ...prev,
        loading: false,
        questions: response.data.questions,
      }));
    } catch (err) {
      console.error('Error generating questions:', err);
      setAiModal((prev) => ({
        ...prev,
        loading: false,
        questions: null,
      }));
    }
  };

  const closeAiModal = () => {
    setAiModal({
      isOpen: false,
      loading: false,
      questions: null,
      jobTitle: '',
      company: '',
    });
  };

  const getStatusStyle = (status) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'accepted':
        return { pill: 'bg-emerald-50 text-emerald-700 border-emerald-100', dot: 'bg-emerald-500' };
      case 'rejected':
        return { pill: 'bg-red-50 text-red-700 border-red-100', dot: 'bg-red-500' };
      case 'shortlisted':
        return { pill: 'bg-indigo-50 text-indigo-700 border-indigo-100', dot: 'bg-indigo-500' };
      case 'viewed':
      case 'reviewing':
        return { pill: 'bg-blue-50 text-blue-700 border-blue-100', dot: 'bg-blue-500' };
      case 'pending':
      case 'applied':
        return { pill: 'bg-amber-50 text-amber-700 border-amber-100', dot: 'bg-amber-500' };
      default:
        return { pill: 'bg-gray-50 text-gray-700 border-gray-200', dot: 'bg-gray-400' };
    }
  };

  const formatStatus = (status) => {
    if (!status) return 'Pending';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        <header className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">My Applications</h1>
              <p className="text-gray-500 mt-2 text-sm sm:text-base">Track your job applications and prepare for interviews with AI-generated questions.</p>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              <span className="text-sm font-semibold text-gray-900">{applications.length}</span>
              <span className="text-sm text-gray-500">total</span>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-sm text-red-800 font-medium">{error}</p>
          </div>
        )}

        {applications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Applications Yet</h2>
            <p className="text-gray-500 max-w-md mx-auto">Start applying to jobs and they will appear here. Track statuses and generate AI interview questions in one place.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => {
              const statusStyle = getStatusStyle(application.status);
              const appliedDate = application.appliedAt || application.createdAt;
              return (
                <div key={application._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">

                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                        <span className="text-white text-lg font-bold">
                          {application.job?.company?.charAt(0)?.toUpperCase() || 'C'}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-gray-900 truncate">
                            {application.job?.title || 'Job Title'}
                          </h3>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusStyle.pill}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}></span>
                            {formatStatus(application.status)}
                          </span>
                        </div>

                        <p className="text-gray-600 text-sm font-medium mb-3">
                          {application.job?.company || 'Company'}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                          {application.job?.location && (
                            <span className="inline-flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {application.job.location}
                            </span>
                          )}
                          {application.job?.type && (
                            <span className="inline-flex items-center gap-1 capitalize">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              {application.job.type}
                            </span>
                          )}
                          {appliedDate && (
                            <span className="inline-flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Applied {formatDistanceToNow(new Date(appliedDate), { addSuffix: true })}
                            </span>
                          )}
                          {application.job?.deadline && (
                            <span className="inline-flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              Deadline {format(new Date(application.job.deadline), 'MMM d, yyyy')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <button
                        onClick={() => handleGenerateQuestions(
                          application.job._id,
                          application.job.title,
                          application.job.company
                        )}
                        className="w-full lg:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-black text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        AI Interview Questions
                      </button>
                    </div>
                  </div>

                  {application.coverLetter && (
                    <details className="mt-5 pt-5 border-t border-gray-100 group">
                      <summary className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer list-none hover:text-gray-900">
                        <svg className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        Cover Letter
                      </summary>
                      <p className="mt-3 text-sm text-gray-600 leading-relaxed bg-gray-50 border border-gray-100 rounded-xl p-4 whitespace-pre-wrap">
                        {application.coverLetter}
                      </p>
                    </details>
                  )}

                  {application.status === 'accepted' && (
                    <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                      <p className="text-sm text-emerald-800 font-medium flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Congratulations! Your application has been accepted.
                      </p>
                    </div>
                  )}

                  {application.status === 'rejected' && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl">
                      <p className="text-sm text-red-800">
                        Unfortunately, your application was not selected for this position.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <InterviewQuestionsModal
        isOpen={aiModal.isOpen}
        onClose={closeAiModal}
        questions={aiModal.questions}
        jobTitle={aiModal.jobTitle}
        company={aiModal.company}
        loading={aiModal.loading}
      />
    </div>
  );
};

export default MyApplications;
