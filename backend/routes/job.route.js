const express = require('express');
const router = express.Router();
const {
  getAllJobs,
  createJob,
  getJobById,
  updateJob,
  deleteJob,
  getMyJobs
} = require('../controllers/job.controller');
const { applyForJob, getJobApplicants } = require('../controllers/application.controller');
const { verifyAuth } = require('../middlewares/auth.middleware');

// Public routes
// @route   GET /api/jobs
router.get('/', getAllJobs);

// Protected routes - Recruiter only
// @route   POST /api/jobs
router.post('/', verifyAuth, createJob);

// ✅ IMPORTANT: Put /my BEFORE /:id
// @route   GET /api/jobs/my
router.get('/my', verifyAuth, getMyJobs);

// ✅ Put parameterized routes AFTER specific routes
// @route   GET /api/jobs/:id
router.get('/:id', getJobById);

// @route   PUT /api/jobs/:id
router.put('/:id', verifyAuth, updateJob);

// @route   DELETE /api/jobs/:id
router.delete('/:id', verifyAuth, deleteJob);

// @route   GET /api/jobs/:id/applicants
router.get('/:id/applicants', verifyAuth, getJobApplicants);

// Protected routes - Student only
// @route   POST /api/jobs/:id/apply
router.post('/:id/apply', verifyAuth, applyForJob);

module.exports = router;