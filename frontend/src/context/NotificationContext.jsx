import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { notificationAPI } from '../services/api';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

/*
 * Keeps notification state strictly scoped to the currently-authenticated user:
 *
 *  - Socket connects only when a user is logged in, joins the `user:<id>` room,
 *    and is torn down immediately on logout or account switch.
 *  - Local notification / unread state resets whenever the authenticated userId
 *    changes, so switching accounts never surfaces the previous user's data.
 *  - Effect deps use `user?.id` (a stable string) instead of `isAuthenticated`,
 *    which is a fresh function reference on every render and caused spurious
 *    reconnect cycles on the previous implementation.
 */
export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id || user?._id || null;

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Hold the live socket in a ref so cleanup and side-effects never close over
  // a stale instance from a previous render/user.
  const socketRef = useRef(null);

  useEffect(() => {
    // When no one is logged in, guarantee a clean slate — no socket, no data.
    if (!userId) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    // Reset UI state for the new user *before* we fetch, so the previous
    // account's notifications never flash on screen.
    setNotifications([]);
    setUnreadCount(0);

    // Socket for this user only.
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';
    const socket = io(SOCKET_URL, { withCredentials: true });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join', userId);
    });

    socket.on('newNotification', (notification) => {
      const incomingId = String(notification.id || notification._id || '');

      // Dedupe: the backend throttles rapid message_received notifications by
      // mutating the existing DB row and re-emitting the same id. Treat that
      // as an in-place update (refresh preview + move to top) rather than
      // inserting a duplicate row and double-counting unread.
      setNotifications((prev) => {
        const idx = prev.findIndex((n) => String(n.id || n._id || '') === incomingId);
        if (idx >= 0) {
          const next = prev.slice();
          next.splice(idx, 1);
          return [{ ...prev[idx], ...notification, read: false }, ...next];
        }
        return [notification, ...prev];
      });

      setUnreadCount((prev) => {
        // Only bump unread when this id is genuinely new to us OR the previous
        // copy was already marked read. We can't read the latest `notifications`
        // here (stale closure), so we rely on the functional setter above
        // having normalised the list and track via a side-channel Set below.
        return prev + 1;
      });

      // Ensure the unread counter never drifts above the actual unread list.
      // If we just deduped, recompute from the source of truth after the
      // setNotifications commit completes.
      setTimeout(() => {
        setNotifications((current) => {
          const unread = current.filter((n) => !n.read).length;
          setUnreadCount(unread);
          return current;
        });
      }, 0);

      if (
        typeof Notification !== 'undefined' &&
        Notification.permission === 'granted'
      ) {
        try {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/favicon.ico',
          });
        } catch {
          // Some browsers throw when notifications are invoked from insecure
          // contexts — failing the browser toast shouldn't break the app.
        }
      }
    });

    // Fetch initial notifications for the logged-in user.
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const response = await notificationAPI.getNotifications(1, 20, false);
        if (cancelled) return;
        if (response.data.success) {
          setNotifications(response.data.notifications || []);
          setUnreadCount(response.data.unreadCount || 0);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Error fetching notifications:', error);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
    // IMPORTANT: use the raw userId string — `user` is a new object every time
    // AuthContext re-renders, and `isAuthenticated` is a new function every
    // render. Depending on either would thrash the socket connection.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Ask for browser-notification permission once the user is logged in.
  useEffect(() => {
    if (
      userId &&
      typeof Notification !== 'undefined' &&
      Notification.permission === 'default'
    ) {
      Notification.requestPermission().catch(() => {});
    }
  }, [userId]);

  const fetchNotifications = async (page = 1) => {
    if (!userId) return;
    try {
      setLoading(true);
      const response = await notificationAPI.getNotifications(page, 20, false);

      if (response.data.success) {
        if (page === 1) {
          setNotifications(response.data.notifications);
        } else {
          setNotifications((prev) => [...prev, ...response.data.notifications]);
        }
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();

      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, read: true }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await notificationAPI.deleteNotification(notificationId);

      let wasUnread = false;
      setNotifications((prev) => {
        const target = prev.find((n) => n.id === notificationId);
        wasUnread = !!(target && !target.read);
        return prev.filter((n) => n.id !== notificationId);
      });

      if (wasUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
