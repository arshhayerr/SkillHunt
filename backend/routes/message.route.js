const express = require('express');
const {
  listConversations,
  startConversation,
  listMessages,
  sendMessage,
  markConversationRead,
} = require('../controllers/message.controller');
const { verifyAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(verifyAuth);

router.get('/conversations', listConversations);
router.post('/conversations', startConversation);
router.get('/conversations/:conversationId/messages', listMessages);
router.post('/conversations/:conversationId/messages', sendMessage);
router.put('/conversations/:conversationId/read', markConversationRead);

module.exports = router;
