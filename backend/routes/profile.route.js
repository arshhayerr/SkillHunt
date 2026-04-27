const express = require('express');
const {
  getProfile,
  updateProfile,
  uploadProfilePicture,
  uploadResume,
  setDefaultResume,
  deleteResume,
  downloadResume,
  toggleFollow,
  analyzeResume,
  upload
} = require('../controllers/profile.controller');
const { verifyAuth, attachUserIfAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

// Public routes. /user/:userId uses the lenient variant so that logged-in
// viewers get `isFollowing` computed against their id while unauthenticated
// visitors can still see public profiles.
router.get('/user/:userId', attachUserIfAuth, getProfile); // Get specific user's profile
router.get('/me', verifyAuth, getProfile); // Get own profile (requires auth)

// Protected routes
router.use(verifyAuth); // All routes below require authentication

// Profile management
router.put('/update', updateProfile);
router.post('/upload-picture', upload.single('profilePicture'), uploadProfilePicture);

// Resume management
router.post('/upload-resume', upload.single('resume'), uploadResume);
router.put('/resume/:resumeId/default', setDefaultResume);
router.delete('/resume/:resumeId', deleteResume);
router.get('/resume/:resumeId/download', downloadResume);

// Social features
router.post('/follow/:targetUserId', toggleFollow);

// ATS Analysis
router.post('/analyze-resume', analyzeResume);

module.exports = router;
