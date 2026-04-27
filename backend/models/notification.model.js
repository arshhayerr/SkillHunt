const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'job_application',
      'job_posted',
      'application_status_update',
      'profile_follow',
      'project_like',
      'project_comment',
      'interview_scheduled',
      'message_received'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job'
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application'
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    },
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  actionUrl: {
    type: String // URL to navigate when notification is clicked
  }
}, {
  timestamps: true
});

// Index for efficient queries
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, read: 1 });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
