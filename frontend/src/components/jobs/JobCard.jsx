import { useState } from 'react';
import { formatDistanceToNow, isAfter } from 'date-fns';
import { MapPinIcon, BuildingOfficeIcon, ClockIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import JobDetailsModal from './JobDetailsModal';

/*
 * Modernized job card:
 *  - Full-height flex column so equal-height grid rows stay aligned.
 *  - Dark-mode aware surface, border, text, and chip colors.
 *  - Elevated hover: subtle lift + ring, not a jarring background change.
 *  - Brand accent (blue) preserved for primary CTAs and type chips.
 */
const JobCard = ({ job }) => {
  const [showDetails, setShowDetails] = useState(false);

  const isDeadlinePassed = !isAfter(new Date(job.deadline), new Date());
  const daysUntilDeadline = formatDistanceToNow(new Date(job.deadline), { addSuffix: true });

  const getDeadlineClass = () => {
    const daysLeft = (new Date(job.deadline) - new Date()) / (1000 * 60 * 60 * 24);
    if (isDeadlinePassed)
      return 'text-red-700 bg-red-50 border-red-100 dark:text-red-300 dark:bg-red-500/10 dark:border-red-500/20';
    if (daysLeft <= 3)
      return 'text-orange-700 bg-orange-50 border-orange-100 dark:text-orange-300 dark:bg-orange-500/10 dark:border-orange-500/20';
    if (daysLeft <= 7)
      return 'text-amber-700 bg-amber-50 border-amber-100 dark:text-amber-300 dark:bg-amber-500/10 dark:border-amber-500/20';
    return 'text-emerald-700 bg-emerald-50 border-emerald-100 dark:text-emerald-300 dark:bg-emerald-500/10 dark:border-emerald-500/20';
  };

  return (
    <>
      <div
        className="group h-full flex flex-col bg-white dark:bg-gray-900 rounded-2xl p-6
                   border border-gray-200 dark:border-gray-800
                   hover:border-gray-300 dark:hover:border-gray-700
                   hover:shadow-lg hover:-translate-y-0.5
                   transition-all duration-200"
      >
        <div className="flex justify-between items-start gap-3 mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 line-clamp-2 leading-snug">
            {job.title}
          </h3>
          <span className="shrink-0 text-[11px] uppercase tracking-wide px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20 font-medium">
            {job.type}
          </span>
        </div>

        <div className="space-y-1.5 mb-4 text-gray-600 dark:text-gray-400">
          <div className="flex items-center">
            <BuildingOfficeIcon className="h-4 w-4 mr-2 shrink-0" />
            <span className="text-sm truncate">{job.company}</span>
          </div>
          <div className="flex items-center">
            <MapPinIcon className="h-4 w-4 mr-2 shrink-0" />
            <span className="text-sm truncate">{job.location}</span>
          </div>
          <div className="flex items-center">
            <ClockIcon className="h-4 w-4 mr-2 shrink-0" />
            <span className="text-sm">
              Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3 leading-relaxed">
          {job.description}
        </p>

        {job.skills && job.skills.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1.5">
              {job.skills.slice(0, 3).map((skill) => (
                <span
                  key={skill}
                  className="text-[11px] font-medium px-2 py-0.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-md"
                >
                  {skill}
                </span>
              ))}
              {job.skills.length > 3 && (
                <span className="text-[11px] font-medium px-2 py-0.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-md">
                  +{job.skills.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Spacer so footer sticks to the bottom. */}
        <div className="flex-1" />

        <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-800 gap-2">
          <span
            className={`text-[11px] px-2 py-1 flex items-center gap-1.5 rounded-md font-medium border ${getDeadlineClass()}`}
          >
            <ClockIcon className="w-3.5 h-3.5" />
            {isDeadlinePassed ? 'Deadline passed' : `Apply ${daysUntilDeadline}`}
          </span>
          <button
            onClick={() => setShowDetails(true)}
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-500/10 px-3 py-1.5 rounded-lg transition-colors"
          >
            View Details
            <ArrowRightIcon className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>

      {showDetails && <JobDetailsModal job={job} onClose={() => setShowDetails(false)} />}
    </>
  );
};

export default JobCard;
