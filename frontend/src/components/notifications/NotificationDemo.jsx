import React from 'react';
import { useNotifications } from '../../context/NotificationContext';

const NotificationDemo = () => {
  const { createNotification } = useNotifications();

  const sendTestNotifications = () => {
    // Simulate different types of notifications
    const testNotifications = [
      {
        type: 'job_application',
        title: 'New Job Application',
        message: 'John Doe applied for Senior Frontend Developer position',
        actionUrl: '/jobs/1/applicants'
      },
      {
        type: 'job_posted',
        title: 'New Job Posted',
        message: 'New React Developer position at TechCorp',
        actionUrl: '/jobs/2'
      },
      {
        type: 'profile_follow',
        title: 'New Follower',
        message: 'Sarah Wilson started following you',
        actionUrl: '/profile/sarah-wilson'
      },
      {
        type: 'application_status_update',
        title: 'Application Update',
        message: 'Your application for Backend Developer has been reviewed',
        actionUrl: '/applications/123'
      }
    ];

    testNotifications.forEach((notification, index) => {
      setTimeout(() => {
        if (createNotification) {
          createNotification({
            ...notification,
            id: Date.now() + index,
            createdAt: new Date(),
            read: false,
            sender: {
              name: 'Test User',
              profilePicture: null
            }
          });
        }
      }, index * 2000); // Send notifications 2 seconds apart
    });
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
      <h3 className="text-lg font-semibold mb-4 text-white">Notification Testing</h3>
      <p className="text-gray-400 mb-4">
        Click the button below to simulate real-time notifications for testing purposes.
      </p>
      <button
        onClick={sendTestNotifications}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
      >
        Send Test Notifications
      </button>
    </div>
  );
};

export default NotificationDemo;
