const express = require('express');
const { generateInterviewQuestions } = require('../controllers/ai.controller');
const { verifyAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

// POST /api/ai/interview-questions
router.post('/interview-questions', verifyAuth, generateInterviewQuestions);

module.exports = router;