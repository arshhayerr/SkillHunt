const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String, 
    required: true,
  },
  role: {
    type: String,
    enum: ['student', 'recruiter', 'admin'],
    default: 'student',
  },
  // Profile Information
  profile: {
    headline: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
    },
    profilePicture: {
      type: String,
      default: '',
    },
    skills: [{
      name: String,
      level: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
        default: 'Beginner'
      }
    }],
    experience: [{
      title: String,
      company: String,
      duration: String,
      description: String,
      startDate: Date,
      endDate: Date,
      current: {
        type: Boolean,
        default: false
      }
    }],
    education: [{
      degree: String,
      institution: String,
      year: String,
      grade: String,
      startDate: Date,
      endDate: Date
    }],
    socialLinks: {
      linkedin: {
        type: String,
        default: '',
      },
      github: {
        type: String,
        default: '',
      },
      portfolio: {
        type: String,
        default: '',
      },
      twitter: {
        type: String,
        default: '',
      }
    },
    resumes: [{
      name: String,
      filename: String,
      uploadDate: {
        type: Date,
        default: Date.now
      },
      isDefault: {
        type: Boolean,
        default: false
      },
      fileUrl: String
    }],
    // Profile Settings
    isPublic: {
      type: Boolean,
      default: true,
    },
    // Social Stats
    followers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    following: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    // ATS Optimization Data
    atsAnalytics: [{
      jobDescription: String,
      resumeId: mongoose.Schema.Types.ObjectId,
      score: Number,
      suggestions: [String],
      analyzedAt: {
        type: Date,
        default: Date.now
      }
    }]
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);
module.exports = User;