const express = require('express');
const router = express.Router();
const {
  getMyApplications,
  updateApplicationStatus,
  getApplicationDetails
} = require('../controllers/application.controller');
const { verifyAuth } = require('../middlewares/auth.middleware');

// Protected routes - Student only
// @route   GET /api/applications/me
router.get('/me', verifyAuth, getMyApplications);

// Protected routes - Both Student and Recruiter
// @route   GET /api/applications/:id
router.get('/:id', verifyAuth, getApplicationDetails);

// Protected routes - Recruiter only
// @route   PUT /api/applications/:id/status
router.put('/:id/status', verifyAuth, updateApplicationStatus);

module.exports = router;