import { useState, useEffect } from 'react';
import { jobAPI } from '../../services/api';
import JobCard from './JobCard';
import { XMarkIcon, MagnifyingGlassIcon, MapPinIcon, BriefcaseIcon } from '@heroicons/react/24/outline';

const JobBoard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    type: '',
    page: 1,
  });

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await jobAPI.getAllJobs(filters);
      setJobs(response.data.jobs || []);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to fetch jobs. Please try again.');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    setFilters({
      ...filters,
      search: formData.get('search') || '',
      location: formData.get('location') || '',
      type: formData.get('type') || '',
      page: 1,
    });
  };

  const clearFilters = () => {
    setFilters({ search: '', location: '', type: '', page: 1 });
    const form = document.getElementById('search-form');
    if (form) form.reset();
  };

  const hasActiveFilters = filters.search || filters.location || filters.type;

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-200 dark:border-gray-800 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading jobs...</p>
        </div>
      </div>
    );
  }

  const inputClass =
    'w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl ' +
    'text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 ' +
    'focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/30 focus:border-blue-300 dark:focus:border-blue-500/50 ' +
    'transition-colors text-sm';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 tracking-tight">
            Find Your Dream Job
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-2xl">
            Discover amazing opportunities from top companies. Your next career move starts here.
          </p>
        </div>

        {/* Search Form */}
        <div className="mb-8 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 overflow-hidden p-2 shadow-sm">
          <form id="search-form" onSubmit={handleSearch}>
            <div className="flex flex-col md:flex-row gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type="text"
                  name="search"
                  placeholder="Job title or keywords..."
                  defaultValue={filters.search}
                  className={inputClass}
                />
              </div>

              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <MapPinIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type="text"
                  name="location"
                  placeholder="City, state, or remote..."
                  defaultValue={filters.location}
                  className={inputClass}
                />
              </div>

              <div className="relative md:w-48 flex-shrink-0">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <BriefcaseIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <select
                  name="type"
                  defaultValue={filters.type}
                  className={`${inputClass} pr-10 appearance-none`}
                >
                  <option value="">All Job Types</option>
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="internship">Internship</option>
                  <option value="contract">Contract</option>
                  <option value="remote">Remote</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium shadow-sm transition-colors flex-1 md:flex-none whitespace-nowrap"
                >
                  Search Jobs
                </button>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-300 rounded-xl transition-colors border border-gray-100 dark:border-gray-800"
                    title="Clear filters"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mr-2">
              Active Filters:
            </span>

            {filters.search && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-500/20">
                &ldquo;{filters.search}&rdquo;
              </span>
            )}

            {filters.location && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-500/20">
                &ldquo;{filters.location}&rdquo;
              </span>
            )}

            {filters.type && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-500/20">
                {filters.type.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </span>
            )}

            <button
              onClick={clearFilters}
              className="ml-2 text-xs font-medium text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-8 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl p-4 flex items-center text-sm">
            <XMarkIcon className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700 dark:text-red-300">{error}</span>
          </div>
        )}

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {jobs.length} {jobs.length === 1 ? 'Job' : 'Jobs'} Found
          </h2>
        </div>

        {/* Jobs Grid OR Empty State */}
        {jobs.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-2xl mb-4">
              <BriefcaseIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {hasActiveFilters ? 'No jobs match your filters' : 'No jobs available'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
              {hasActiveFilters
                ? 'Try adjusting your search terms, changing the location, or selecting a different job type.'
                : 'Check back later for new opportunities from top companies.'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          // Modern auto-fit grid: cards flex to fill available space. On small
          // screens: 1 column; md: 2; xl: 3. Using CSS grid auto-rows-fr keeps
          // every card in a row the same height, regardless of description
          // length, which avoids the jagged bottoms the old layout had.
          <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 auto-rows-fr">
            {jobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobBoard;
