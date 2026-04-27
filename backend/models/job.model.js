const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxLength: [100, 'Job title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    trim: true,
    maxLength: [2000, 'Job description cannot exceed 2000 characters']
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxLength: [100, 'Company name cannot exceed 100 characters']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    maxLength: [100, 'Location cannot exceed 100 characters']
  },
  type: {
    type: String,
    enum: ['full-time', 'part-time', 'internship', 'contract', 'remote'],
    default: 'full-time'
  },
  salary: {
    min: {
      type: Number,
      min: [0, 'Minimum salary cannot be negative']
    },
    max: {
      type: Number,
      min: [0, 'Maximum salary cannot be negative']
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  requirements: [{
    type: String,
    trim: true
  }],
  skills: [{
    type: String,
    trim: true
  }],
  experience: {
    min: {
      type: Number,
      min: [0, 'Minimum experience cannot be negative'],
      default: 0
    },
    max: {
      type: Number,
      min: [0, 'Maximum experience cannot be negative']
    }
  },
  deadline: {
    type: Date,
    required: [true, 'Application deadline is required'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Deadline must be a future date'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  applicationsCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better query performance
jobSchema.index({ title: 'text', company: 'text', description: 'text' });
jobSchema.index({ postedBy: 1, createdAt: -1 });
jobSchema.index({ deadline: 1, isActive: 1 });

// Virtual for checking if job is expired
jobSchema.virtual('isExpired').get(function() {
  return this.deadline < new Date();
});

// Pre-save middleware to validate salary range
jobSchema.pre('save', function(next) {
  if (this.salary.max && this.salary.min && this.salary.max < this.salary.min) {
    next(new Error('Maximum salary cannot be less than minimum salary'));
  }
  next();
});

// Static method to find active jobs
jobSchema.statics.findActiveJobs = function() {
  return this.find({ 
    isActive: true, 
    deadline: { $gt: new Date() } 
  }).populate('postedBy', 'name email');
};

module.exports = mongoose.model('Job', jobSchema);