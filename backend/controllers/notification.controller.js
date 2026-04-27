const Notification = require('../models/notification.model');
const User = require('../models/user.model');

// Create and send notification
const createNotification = async (notificationData) => {
  try {
    console.log('🔔 Creating notification:', notificationData);
    const notification = new Notification(notificationData);
    await notification.save();
    console.log('✅ Notification saved to database:', notification._id);
    
    // Populate sender info for real-time emission
    await notification.populate('sender', 'name profile.profilePicture');
    
    // Send real-time notification if user is connected
    const io = global.io;
    const connectedUsers = global.connectedUsers;
    
    console.log('🔍 Checking if user is connected:', notificationData.recipient.toString());
    console.log('🔍 Connected users:', Array.from(connectedUsers.keys()));
    
    if (io && connectedUsers.has(notificationData.recipient.toString())) {
      const socketId = connectedUsers.get(notificationData.recipient.toString());
      console.log('📡 Sending real-time notification to socket:', socketId);
      
      const notificationPayload = {
        id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        sender: notification.sender,
        data: notification.data,
        actionUrl: notification.actionUrl,
        createdAt: notification.createdAt,
        read: notification.read
      };
      
      io.to(socketId).emit('newNotification', notificationPayload);
      console.log(`📢 Notification sent to user ${notificationData.recipient}:`, notificationPayload);
    } else {
      console.log('⚠️ User not connected or Socket.io not available');
      console.log('⚠️ IO available:', !!io);
      console.log('⚠️ User connected:', connectedUsers.has(notificationData.recipient.toString()));
    }
    
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Get user notifications
const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const skip = (page - 1) * limit;

    let query = { recipient: userId };
    if (unreadOnly === 'true') {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .populate('sender', 'name profile.profilePicture')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ 
      recipient: userId, 
      read: false 
    });

    // Transform notifications to include id field for frontend compatibility
    const transformedNotifications = notifications.map(notification => ({
      id: notification._id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      sender: notification.sender,
      data: notification.data,
      actionUrl: notification.actionUrl,
      read: notification.read,
      createdAt: notification.createdAt
    }));

    res.json({
      success: true,
      notifications: transformedNotifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      unreadCount
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { read: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({
      success: true,
      message: 'Notification marked as read'
    });

  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany(
      { recipient: userId, read: false },
      { read: true, readAt: new Date() }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });

  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: userId
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({
      success: true,
      message: 'Notification deleted'
    });

  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper function to create job application notification
const createJobApplicationNotification = async (applicationData) => {
  const { jobId, applicantId, recruiterId, jobTitle, applicantName } = applicationData;
  
  return await createNotification({
    recipient: recruiterId,
    sender: applicantId,
    type: 'job_application',
    title: 'New Job Application',
    message: `${applicantName} applied for ${jobTitle}`,
    data: { jobId, applicationId: applicationData.applicationId },
    actionUrl: `/jobs/${jobId}/applicants`
  });
};

// Helper function to create job posted notification
const createJobPostedNotification = async (jobData) => {
  const { jobId, recruiterId, jobTitle, companyName } = jobData;
  
  // Get all students to notify them about new job
  const students = await User.find({ role: 'student' }).select('_id');
  
  const notifications = students.map(student => ({
    recipient: student._id,
    sender: recruiterId,
    type: 'job_posted',
    title: 'New Job Posted',
    message: `New ${jobTitle} position at ${companyName}`,
    data: { jobId },
    actionUrl: `/jobs/${jobId}`
  }));

  // Create notifications in batch
  await Notification.insertMany(notifications);
  
  // Send real-time notifications to connected students
  const io = global.io;
  const connectedUsers = global.connectedUsers;
  
  if (io && connectedUsers) {
    students.forEach(student => {
      if (connectedUsers.has(student._id.toString())) {
        const socketId = connectedUsers.get(student._id.toString());
        io.to(socketId).emit('newNotification', {
          type: 'job_posted',
          title: 'New Job Posted',
          message: `New ${jobTitle} position at ${companyName}`,
          data: { jobId },
          actionUrl: `/jobs/${jobId}`,
          createdAt: new Date()
        });
      }
    });
    console.log(`📢 Job posted notifications sent to ${students.length} students`);
  }
};

// Helper function to create follow notification
const createFollowNotification = async (followData) => {
  const { followerId, followedId, followerName } = followData;
  
  return await createNotification({
    recipient: followedId,
    sender: followerId,
    type: 'profile_follow',
    title: 'New Follower',
    message: `${followerName} started following you`,
    data: { profileId: followerId },
    actionUrl: `/profile/${followerId}`
  });
};

/*
 * Helper: create a `message_received` notification for the recipient of a
 * 1:1 chat message.
 *
 *  - Persists a Notification document so the bell count survives page
 *    refreshes and is available across devices (satisfies "ensure persisted
 *    in DB" requirement).
 *  - Emits `newNotification` over socket.io so the bell updates in real time
 *    on any active session belonging to the recipient — the NotificationContext
 *    already listens for this exact event.
 *  - Throttles: if the recipient already has an *unread* `message_received`
 *    notification from the same sender created in the last 2 minutes, we
 *    bump its `message` preview + `createdAt` in place instead of inserting
 *    a new row. This keeps the bell from flooding during rapid back-and-forth
 *    chat while still giving the recipient a single live-updating entry.
 *  - No-ops if sender === recipient (edge case) or ids are missing.
 */
const MESSAGE_NOTIFICATION_THROTTLE_MS = 2 * 60 * 1000; // 2 minutes

const createMessageNotification = async ({
  senderId,
  recipientId,
  senderName,
  preview,
}) => {
  if (!senderId || !recipientId) return null;
  if (senderId.toString() === recipientId.toString()) return null;

  const truncatedPreview =
    preview && preview.length > 120 ? `${preview.slice(0, 117)}...` : preview || '';
  const title = 'New Message';
  const message = senderName
    ? `${senderName}: ${truncatedPreview}`
    : truncatedPreview || 'You received a new message';

  try {
    const recent = await Notification.findOne({
      recipient: recipientId,
      sender: senderId,
      type: 'message_received',
      read: false,
      createdAt: { $gte: new Date(Date.now() - MESSAGE_NOTIFICATION_THROTTLE_MS) },
    }).sort({ createdAt: -1 });

    if (recent) {
      // Update the in-flight notification in place so the bell shows the
      // latest preview without a second unread row appearing.
      recent.title = title;
      recent.message = message;
      recent.createdAt = new Date();
      await recent.save();
      await recent.populate('sender', 'name profile.profilePicture');

      const io = global.io;
      const connectedUsers = global.connectedUsers;
      if (io && connectedUsers && connectedUsers.has(recipientId.toString())) {
        const socketId = connectedUsers.get(recipientId.toString());
        io.to(socketId).emit('newNotification', {
          id: recent._id,
          type: recent.type,
          title: recent.title,
          message: recent.message,
          sender: recent.sender,
          data: recent.data,
          actionUrl: recent.actionUrl,
          createdAt: recent.createdAt,
          read: recent.read,
        });
      }
      return recent;
    }

    return await createNotification({
      recipient: recipientId,
      sender: senderId,
      type: 'message_received',
      title,
      message,
      data: {},
      actionUrl: '/messages',
    });
  } catch (error) {
    // Non-fatal: a failed notification must never block message delivery.
    console.error('Error creating message notification:', error);
    return null;
  }
};

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createJobApplicationNotification,
  createJobPostedNotification,
  createFollowNotification,
  createMessageNotification,
};
