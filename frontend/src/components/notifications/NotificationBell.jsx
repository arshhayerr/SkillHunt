import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';

/*
 * `placement` controls where the dropdown anchors relative to the bell:
 *   - "top"  (default) — opens below-right (used on the mobile top bar)
 *   - "rail"           — opens to the right of the bell, bottom-aligned so
 *                        it floats *up* from the trigger. This works for both
 *                        the collapsed desktop rail and the expanded sidebar:
 *                        the popover extends into the main content area and
 *                        never falls off the bottom of the viewport.
 *
 * `expanded` tells the rail-variant button whether to render as a square
 * icon button (collapsed rail) or as a full-width row with a label
 * ("Notifications"), matching the adjacent nav items when the sidebar is
 * opened up. The popover anchoring is identical in both cases — hence the
 * bell + popover always live at the bottom-left of the sidebar regardless
 * of width changes.
 */
const NotificationBell = ({ placement = 'top', expanded = false }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isRail = placement === 'rail';
  const isExpandedRail = isRail && expanded;

  // Popover: always bottom-left-anchored against the trigger in rail mode.
  // `left-full` pushes it out to the trigger's right edge so it clears the
  // sidebar, `bottom-0` pins its bottom to the trigger's bottom so it opens
  // *upward*, staying on-screen even when the bell sits near the viewport
  // bottom. `mt-2` is intentionally omitted in the rail case.
  const dropdownPositionClass = isRail ? 'left-full bottom-0 ml-3' : 'right-0 mt-2';

  let buttonClass;
  if (isExpandedRail) {
    // Full-width row matching the other expanded sidebar nav items.
    buttonClass =
      'group relative flex items-center gap-3 h-11 w-full px-3 rounded-xl transition-colors ' +
      'text-gray-500 hover:text-gray-900 hover:bg-gray-900/5 ' +
      'dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5 ' +
      'focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-white/20';
  } else if (isRail) {
    // Collapsed icon-only rail button.
    buttonClass =
      'group relative w-11 h-11 rounded-xl flex items-center justify-center transition-colors ' +
      'text-gray-500 hover:text-gray-900 hover:bg-gray-900/5 ' +
      'dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5 ' +
      'focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-white/20';
  } else {
    buttonClass =
      'relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white ' +
      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ' +
      'dark:focus:ring-offset-gray-950 rounded-full';
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    setIsOpen(false);
    
    // Navigate to action URL if provided
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'job_application':
        return (
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        );
      case 'job_posted':
        return (
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8z" />
            </svg>
          </div>
        );
      case 'profile_follow':
        return (
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 00-15 0v5h5l-5 5-5-5h5V7a12 12 0 0124 0v10z" />
            </svg>
          </div>
        );
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInSeconds = Math.floor((now - notificationDate) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return notificationDate.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={buttonClass}
        aria-label="Notifications"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {/* Icon + (in expanded-rail mode) label share the same flex row. */}
        <span className="relative flex items-center justify-center shrink-0">
          <svg className={isExpandedRail ? 'w-5 h-5' : 'w-6 h-6'} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M10 5a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6" />
            <path d="M9 17v1a3 3 0 0 0 6 0v-1" />
          </svg>
          {/* Compact badge anchored to the icon itself (works in every variant). */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center leading-none">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </span>

        {isExpandedRail && (
          <span className="text-sm font-medium truncate">Notifications</span>
        )}

        {/* Collapsed-rail tooltip on hover. */}
        {isRail && !expanded && (
          <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1 bg-gray-900 text-white text-xs font-medium rounded-md shadow-lg whitespace-nowrap opacity-0 translate-x-[-6px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 z-50 border border-white/10">
            Notifications
            {unreadCount > 0 && <span className="ml-1.5 text-red-300">({unreadCount})</span>}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className={`absolute ${dropdownPositionClass} w-80 bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-800 z-50`}>
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 00-15 0v5h5l-5 5-5-5h5V7a12 12 0 0124 0v10z" />
                </svg>
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.slice(0, 10).map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/60 cursor-pointer transition-colors ${
                    !notification.read ? 'bg-blue-50 dark:bg-blue-500/10' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-3">
                    {/* Notification Icon */}
                    {getNotificationIcon(notification.type)}
                    
                    {/* Notification Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full ml-2"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="text-xs text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800">
              <Link
                to="/notifications"
                className="block text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                onClick={() => setIsOpen(false)}
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
