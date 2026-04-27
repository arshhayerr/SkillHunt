const Application = require('../models/application.model');
const Job = require('../models/job.model');
const { createJobApplicationNotification } = require('./notification.controller');

// @desc    Apply for a job
// @route   POST /api/jobs/:id/apply
// @access  Protected (Student only)
const applyForJob = async (req, res) => {
  try {
    // Check if user is student
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only students can apply for jobs.'
      });
    }

    const jobId = req.params.id;
    const studentId = req.user.id;
    const { coverLetter } = req.body;

    // Validate cover letter length up front so we can return a clean 400
    // instead of relying on the downstream Mongoose validator error.
    if (!coverLetter || coverLetter.trim().length < 50) {
      return res.status(400).json({
        success: false,
        message: 'Cover letter is required and must be at least 50 characters long'
      });
    }
    if (coverLetter.trim().length > 5000) {
      return res.status(400).json({
        success: false,
        message: 'Cover letter cannot exceed 5000 characters'
      });
    }

    // Find the job by ID
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if job is active
    if (!job.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This job is no longer active'
      });
    }

    // Deadline check - Compare job's deadline with current date
    const currentDate = new Date();
    if (job.deadline <= currentDate) {
      return res.status(400).json({
        success: false,
        message: 'Application deadline has passed'
      });
    }

    // Prevent duplicates - Check if application already exists
    const existingApplication = await Application.findOne({
      job: jobId,
      student: studentId
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    // Create new application
    const application = new Application({
      job: jobId,
      student: studentId,
      coverLetter: coverLetter.trim(),
      status: 'applied'
    });

    await application.save();

    // Update job applications count
    await Job.findByIdAndUpdate(jobId, { 
      $inc: { applicationsCount: 1 } 
    });

    // Populate job and student details for response
    await application.populate([
      { path: 'job', select: 'title company location deadline postedBy' },
      { path: 'student', select: 'name email' }
    ]);

    // Send notification to recruiter about new application
    try {
      await createJobApplicationNotification({
        jobId: job._id,
        applicationId: application._id,
        applicantId: studentId,
        recruiterId: job.postedBy,
        jobTitle: job.title,
        applicantName: req.user.name
      });
      console.log(`📢 Application notification sent for: ${job.title}`);
    } catch (notificationError) {
      console.error('Error sending application notification:', notificationError);
      // Don't fail the application if notification fails
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully!',
      application
    });

  } catch (error) {
    console.error('Apply for job error:', error);
    // Surface Mongoose validation errors as 400 with a meaningful message.
    if (error?.name === 'ValidationError') {
      const firstField = Object.keys(error.errors || {})[0];
      return res.status(400).json({
        success: false,
        message: error.errors?.[firstField]?.message || 'Invalid application data'
      });
    }
    // Duplicate-key (unique index on job+student) — already applied.
    if (error?.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while submitting application'
    });
  }
};

// @desc    Get student's applications
// @route   GET /api/applications/me
// @access  Protected (Student only)
const getMyApplications = async (req, res) => {
  try {
    // Check if user is student
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only students can view their applications.'
      });
    }

    const studentId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;

    // Build query
    const query = { student: studentId };
    if (status && ['applied', 'viewed', 'shortlisted', 'accepted', 'rejected'].includes(status)) {
      query.status = status;
    }

    // Get applications with pagination
    const applications = await Application.find(query)
      .populate('job', 'title company location deadline type salary isActive')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count for pagination
    const total = await Application.countDocuments(query);

    // Group applications by status for summary
    const statusSummary = await Application.aggregate([
      { $match: { student: studentId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const summary = {
      applied: 0,
      viewed: 0,
      shortlisted: 0,
      accepted: 0,
      rejected: 0
    };

    statusSummary.forEach(item => {
      summary[item._id] = item.count;
    });

    res.status(200).json({
      success: true,
      applications,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalApplications: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      },
      summary
    });

  } catch (error) {
    console.error('Get my applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching applications'
    });
  }
};

// @desc    Get job applicants (for recruiters)
// @route   GET /api/jobs/:id/applicants
// @access  Protected (Recruiter only)
const getJobApplicants = async (req, res) => {
  try {
    // Check if user is recruiter
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only recruiters can view job applicants.'
      });
    }

    const jobId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;

    // Verify job exists and belongs to recruiter
    const job = await Job.findOne({ 
      _id: jobId, 
      postedBy: req.user.id 
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or you do not have permission to view applicants'
      });
    }

    // Build query
    const query = { job: jobId };
    if (status && ['applied', 'viewed', 'shortlisted', 'accepted', 'rejected'].includes(status)) {
      query.status = status;
    }

    // Get applications with pagination
    const applications = await Application.find(query)
      .populate('student', 'name email profile.skills profile.experience profile.education')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count for pagination
    const total = await Application.countDocuments(query);

    // Group applications by status for summary
    const statusSummary = await Application.aggregate([
      { $match: { job: jobId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const summary = {
      applied: 0,
      viewed: 0,
      shortlisted: 0,
      accepted: 0,
      rejected: 0
    };

    statusSummary.forEach(item => {
      summary[item._id] = item.count;
    });

    res.status(200).json({
      success: true,
      job: {
        title: job.title,
        company: job.company,
        location: job.location,
        deadline: job.deadline
      },
      applications,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalApplicants: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      },
      summary
    });

  } catch (error) {
    console.error('Get job applicants error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching applicants'
    });
  }
};

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Protected (Recruiter only)
const updateApplicationStatus = async (req, res) => {
  try {
    // Check if user is recruiter
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only recruiters can update application status.'
      });
    }

    const applicationId = req.params.id;
    const { status, notes } = req.body;
    const recruiterId = req.user.id;

    // Validate status
    const validStatuses = ['applied', 'viewed', 'shortlisted', 'accepted', 'rejected'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      });
    }

    // Find application and populate job to verify recruiter ownership
    const application = await Application.findById(applicationId).populate('job');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Verify the recruiter owns the job
    if (application.job.postedBy.toString() !== recruiterId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this application'
      });
    }

    // Update application status using the instance method
    await application.updateStatus(status, recruiterId, notes);

    // Populate student details for response
    await application.populate('student', 'name email');

    res.status(200).json({
      success: true,
      message: `Application status updated to ${status}`,
      application: {
        id: application._id,
        status: application.status,
        student: application.student,
        updatedAt: application.updatedAt,
        statusHistory: application.statusHistory.slice(-1)
      }
    });

  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating application status'
    });
  }
};

// @desc    Get single application details
// @route   GET /api/applications/:id
// @access  Protected (Student or Recruiter who owns the job)
const getApplicationDetails = async (req, res) => {
  try {
    const applicationId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    const application = await Application.findById(applicationId)
      .populate('job', 'title company location deadline type salary postedBy')
      .populate('student', 'name email profile.skills profile.experience')
      .populate('statusHistory.changedBy', 'name');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check permissions
    const isStudent = userRole === 'student' && application.student._id.toString() === userId;
    const isRecruiter = userRole === 'recruiter' && application.job.postedBy.toString() === userId;

    if (!isStudent && !isRecruiter) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this application'
      });
    }

    // If recruiter is viewing for first time, update status to 'viewed'
    if (isRecruiter && application.status === 'applied') {
      await application.updateStatus('viewed', userId, 'Application viewed by recruiter');
    }

    res.status(200).json({
      success: true,
      application
    });

  } catch (error) {
    console.error('Get application details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching application details'
    });
  }
};

module.exports = {
  applyForJob,
  getMyApplications,
  getJobApplicants,
  updateApplicationStatus,
  getApplicationDetails
};