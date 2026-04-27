// src/components/ApplicationCard.jsx
import { formatDistanceToNow, format } from 'date-fns';
import { 
  BuildingOfficeIcon, 
  MapPinIcon, 
  CalendarIcon,
  ClockIcon 
} from '@heroicons/react/24/outline';

const ApplicationCard = ({ application }) => {
  const getStatusColor = (status) => {
    const colors = {
      applied: 'bg-blue-100 text-blue-800',
      viewed: 'bg-yellow-100 text-yellow-800',
      shortlisted: 'bg-purple-100 text-purple-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return '🎉';
      case 'rejected':
        return '❌';
      case 'shortlisted':
        return '⭐';
      case 'viewed':
        return '👀';
      default:
        return '📄';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {application.job.title}
          </h3>
          <div className="space-y-1">
            <div className="flex items-center text-gray-600">
              <BuildingOfficeIcon className="h-4 w-4 mr-2" />
              <span className="text-sm">{application.job.company}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <MapPinIcon className="h-4 w-4 mr-2" />
              <span className="text-sm">{application.job.location}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end space-y-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
            <span className="mr-1">{getStatusIcon(application.status)}</span>
            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
          </span>
          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded capitalize">
            {application.job.type}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-gray-700 text-sm line-clamp-2">
          {application.coverLetter}
        </p>
      </div>

      <div className="flex justify-between items-center text-sm text-gray-500">
        <div className="flex items-center">
          <ClockIcon className="h-4 w-4 mr-1" />
          <span>Applied {formatDistanceToNow(new Date(application.createdAt), { addSuffix: true })}</span>
        </div>
        <div className="flex items-center">
          <CalendarIcon className="h-4 w-4 mr-1" />
          <span>Deadline: {format(new Date(application.job.deadline), 'MMM d, yyyy')}</span>
        </div>
      </div>

      {application.status === 'accepted' && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800 text-sm font-medium">
            🎉 Congratulations! Your application has been accepted.
          </p>
        </div>
      )}

      {application.status === 'rejected' && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">
            Unfortunately, your application was not selected for this position.
          </p>
        </div>
      )}
    </div>
  );
};

export default ApplicationCard;