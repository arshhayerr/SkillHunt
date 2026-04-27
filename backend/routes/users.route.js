const express = require('express');
const { getMembers } = require('../controllers/users.controller');
const { verifyAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

// Get all members (requires authentication)
router.get('/members', verifyAuth, getMembers);

module.exports = router;
