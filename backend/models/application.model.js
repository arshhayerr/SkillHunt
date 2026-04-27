const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: [true, 'Job reference is required']
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student reference is required']
  },
  coverLetter: {
    type: String,
    required: [true, 'Cover letter is required'],
    trim: true,
    minLength: [50, 'Cover letter must be at least 50 characters long'],
    maxLength: [5000, 'Cover letter cannot exceed 5000 characters']
  },
  status: {
    type: String,
    enum: {
      values: ['applied', 'viewed', 'shortlisted', 'accepted', 'rejected'],
      message: 'Status must be one of: applied, viewed, shortlisted, accepted, rejected'
    },
    default: 'applied'
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  statusHistory: [{
    status: {
      type: String,
      enum: ['applied', 'viewed', 'shortlisted', 'accepted', 'rejected']
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: {
      type: String,
      trim: true
    }
  }]
}, {
  timestamps: true
});

// Compound index to prevent duplicate applications
applicationSchema.index({ job: 1, student: 1 }, { unique: true });

// Index for better query performance
applicationSchema.index({ student: 1, createdAt: -1 });
applicationSchema.index({ job: 1, status: 1 });
applicationSchema.index({ status: 1, createdAt: -1 });

// Virtual for application age
applicationSchema.virtual('applicationAge').get(function() {
  return Math.floor((new Date() - this.appliedAt) / (1000 * 60 * 60 * 24)); // in days
});

// Pre-save middleware to add status to history
applicationSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date()
    });
  }
  next();
});

// Static method to get applications by status
applicationSchema.statics.findByStatus = function(status) {
  return this.find({ status })
    .populate('job', 'title company location deadline')
    .populate('student', 'name email profile.skills');
};

// Static method to get student's applications
applicationSchema.statics.findStudentApplications = function(studentId) {
  return this.find({ student: studentId })
    .populate('job', 'title company location deadline type salary')
    .sort({ createdAt: -1 });
};

// Static method to get job applications
applicationSchema.statics.findJobApplications = function(jobId) {
  return this.find({ job: jobId })
    .populate('student', 'name email profile.skills profile.experience')
    .sort({ createdAt: -1 });
};

// Instance method to update status
applicationSchema.methods.updateStatus = function(newStatus, changedBy, notes) {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    changedAt: new Date(),
    changedBy: changedBy,
    notes: notes
  });
  return this.save();
};

module.exports = mongoose.model('Application', applicationSchema);