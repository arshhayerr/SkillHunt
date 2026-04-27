const Job = require('../models/job.model');
const { createJobPostedNotification } = require('./notification.controller');

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
const getAllJobs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;
    const location = req.query.location;
    const type = req.query.type;

    // Build query
    const query = { 
      isActive: true, 
      deadline: { $gt: new Date() } 
    };

    // Add search filters
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (type && ['full-time', 'part-time', 'internship', 'contract', 'remote'].includes(type)) {
      query.type = type;
    }
    
    const jobs = await Job.find(query)
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Job.countDocuments(query);

    res.status(200).json({
      success: true,
      jobs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalJobs: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get all jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching jobs'
    });
  }
};

// @desc    Create a job
// @route   POST /api/jobs
// @access  Protected (Recruiter only)
const createJob = async (req, res) => {
  try {
    // Check if user is recruiter
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only recruiters can create jobs.'
      });
    }

    const {
      title,
      description,
      company,
      location,
      type,
      salary,
      requirements,
      skills,
      experience,
      deadline
    } = req.body;

    // Validate required fields
    if (!title || !description || !company || !location || !deadline) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, description, company, location, deadline'
      });
    }

    // Validate deadline is in future
    if (new Date(deadline) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Deadline must be a future date'
      });
    }

    const jobData = {
      title,
      description,
      company,
      location,
      type: type || 'full-time',
      salary,
      requirements: requirements || [],
      skills: skills || [],
      experience,
      deadline,
      postedBy: req.user.id
    };

    const job = new Job(jobData);
    await job.save();

    // Populate postedBy details for response
    await job.populate('postedBy', 'name email');

    // Send notification to all students about new job posting
    try {
      await createJobPostedNotification({
        jobId: job._id,
        recruiterId: req.user.id,
        jobTitle: job.title,
        companyName: job.company
      });
      console.log(`📢 Job posted notification sent for: ${job.title}`);
    } catch (notificationError) {
      console.error('Error sending job posted notification:', notificationError);
      // Don't fail the job creation if notification fails
    }

    res.status(201).json({
      success: true,
      message: 'Job created successfully!',
      job
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating job',
      error: error.message
    });
  }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'name email');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.status(200).json({
      success: true,
      job
    });
  } catch (error) {
    console.error('Get job by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching job'
    });
  }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Protected (Recruiter who posted the job)
const updateJob = async (req, res) => {
  try {
    // Check if user is recruiter
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only recruiters can update jobs.'
      });
    }

    const jobId = req.params.id;
    const recruiterId = req.user.id;

    // Find job and verify ownership
    const job = await Job.findOne({ _id: jobId, postedBy: recruiterId });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or you do not have permission to update this job'
      });
    }

    // Validate deadline if provided
    if (req.body.deadline && new Date(req.body.deadline) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Deadline must be a future date'
      });
    }

    // Update job
    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('postedBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Job updated successfully!',
      job: updatedJob
    });

  } catch (error) {
    console.error('Update job error:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating job',
      error: error.message
    });
  }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Protected (Recruiter who posted the job)
const deleteJob = async (req, res) => {
  try {
    // Check if user is recruiter
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only recruiters can delete jobs.'
      });
    }

    const jobId = req.params.id;
    const recruiterId = req.user.id;

    // Find job and verify ownership
    const job = await Job.findOne({ _id: jobId, postedBy: recruiterId });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or you do not have permission to delete this job'
      });
    }

    // Soft delete by setting isActive to false
    await Job.findByIdAndUpdate(jobId, { isActive: false });

    res.status(200).json({
      success: true,
      message: 'Job deleted successfully!'
    });

  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting job'
    });
  }
};

// @desc    Get recruiter's jobs
// @route   GET /api/jobs/my
// @access  Protected (Recruiter only)
const getMyJobs = async (req, res) => {
  try {    
    // Check if user is recruiter
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only recruiters can view their jobs.'
      });
    }

    const recruiterId = req.user.id;
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Debug: Check if jobs exist for this recruiter
    const jobsCount = await Job.countDocuments({ postedBy: recruiterId });

    const jobs = await Job.find({ postedBy: recruiterId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Job.countDocuments({ postedBy: recruiterId });

    // Get job statistics
    const activeJobs = await Job.countDocuments({ 
      postedBy: recruiterId, 
      isActive: true, 
      deadline: { $gt: new Date() } 
    });

    res.status(200).json({
      success: true,
      jobs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalJobs: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      },
      statistics: {
        totalJobs: total,
        activeJobs,
        expiredJobs: total - activeJobs
      }
    });

  } catch (error) {
    console.error('Get my jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching your jobs',
      error: error.message // Add error details for debugging
    });
  }
};

module.exports = {
  getAllJobs,
  createJob,
  getJobById,
  updateJob,
  deleteJob,
  getMyJobs
};