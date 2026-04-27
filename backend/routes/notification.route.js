const express = require('express');
const {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require('../controllers/notification.controller');
const { verifyAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

// All notification routes require authentication
router.use(verifyAuth);

// Get user notifications
router.get('/', getUserNotifications);

// Mark specific notification as read
router.put('/:notificationId/read', markAsRead);

// Mark all notifications as read
router.put('/read-all', markAllAsRead);

// Delete notification
router.delete('/:notificationId', deleteNotification);

module.exports = router;
