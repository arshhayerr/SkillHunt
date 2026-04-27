const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
  },
  techStack: {
    type: [String], // An array of String
    required: true, 
    validate: {
      validator: function(array) {
        return array.length > 0;
      },
      message: 'At least one technology is required'
    }
  },
  githubUrl: {
    type: String,
    trim: true,
  },
  liveUrl: {
    type: String,
    trim: true,
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
  views: {
    type: Number,
    default: 0,
  }
}, {
  timestamps: true
});

const Project = mongoose.model('Project', projectSchema);
module.exports = Project;