const mongoose = require('mongoose');
const Conversation = require('../models/conversation.model');
const Message = require('../models/message.model');
const User = require('../models/user.model');
const { createMessageNotification } = require('./notification.controller');

const PARTICIPANT_FIELDS = 'name email role profile.headline profile.profilePicture';

// Keep participants sorted so lookup is deterministic between two users.
const sortedPair = (a, b) => {
  const s1 = a.toString();
  const s2 = b.toString();
  return s1 < s2 ? [s1, s2] : [s2, s1];
};

const emitToUser = (userId, event, payload) => {
  const io = global.io;
  if (!io) return;
  io.to(`user:${userId.toString()}`).emit(event, payload);
};

// -----------------------------------------------------------------------------
// GET /api/messages/conversations
// Return current user's conversations sorted by most recent activity, with the
// "other" participant hydrated and an unread message count computed.
// -----------------------------------------------------------------------------
const listConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await Conversation.find({ participants: userId })
      .populate('participants', PARTICIPANT_FIELDS)
      .sort({ lastMessageAt: -1 })
      .lean();

    // Batch unread counts to avoid N+1 queries.
    const conversationIds = conversations.map((c) => c._id);
    const unreadAgg = await Message.aggregate([
      {
        $match: {
          conversation: { $in: conversationIds },
          sender: { $ne: new mongoose.Types.ObjectId(userId) },
          readBy: { $ne: new mongoose.Types.ObjectId(userId) },
        },
      },
      { $group: { _id: '$conversation', count: { $sum: 1 } } },
    ]);
    const unreadMap = new Map(unreadAgg.map((u) => [u._id.toString(), u.count]));

    const payload = conversations.map((c) => {
      const otherUser = c.participants.find(
        (p) => p._id.toString() !== userId.toString()
      );
      return {
        _id: c._id,
        otherUser: otherUser
          ? {
              _id: otherUser._id,
              name: otherUser.name,
              email: otherUser.email,
              role: otherUser.role,
              headline: otherUser.profile?.headline || '',
              profilePicture: otherUser.profile?.profilePicture || '',
            }
          : null,
        lastMessage: c.lastMessage || null,
        lastMessageAt: c.lastMessageAt,
        unreadCount: unreadMap.get(c._id.toString()) || 0,
        updatedAt: c.updatedAt,
      };
    });

    res.json({ success: true, conversations: payload });
  } catch (error) {
    console.error('Error listing conversations:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// -----------------------------------------------------------------------------
// POST /api/messages/conversations { userId }
// Find or create a 1:1 conversation with another user.
// -----------------------------------------------------------------------------
const startConversation = async (req, res) => {
  try {
    const me = req.user.id;
    const { userId: otherId } = req.body;

    if (!otherId) {
      return res.status(400).json({ message: 'userId is required' });
    }
    if (otherId.toString() === me.toString()) {
      return res
        .status(400)
        .json({ message: 'Cannot start a conversation with yourself' });
    }
    if (!mongoose.Types.ObjectId.isValid(otherId)) {
      return res.status(400).json({ message: 'Invalid userId' });
    }

    const otherUser = await User.findById(otherId).select(PARTICIPANT_FIELDS);
    if (!otherUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const [a, b] = sortedPair(me, otherId);

    // $all + $size guarantees we match the exact 2-participant pair.
    let conversation = await Conversation.findOne({
      participants: { $all: [a, b], $size: 2 },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [a, b],
        lastMessage: { content: '', sender: null, createdAt: null },
        lastMessageAt: new Date(),
      });
    }

    res.json({
      success: true,
      conversation: {
        _id: conversation._id,
        otherUser: {
          _id: otherUser._id,
          name: otherUser.name,
          email: otherUser.email,
          role: otherUser.role,
          headline: otherUser.profile?.headline || '',
          profilePicture: otherUser.profile?.profilePicture || '',
        },
        lastMessage: conversation.lastMessage || null,
        lastMessageAt: conversation.lastMessageAt,
        unreadCount: 0,
      },
    });
  } catch (error) {
    console.error('Error starting conversation:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// -----------------------------------------------------------------------------
// GET /api/messages/conversations/:conversationId/messages?before=&limit=
// Paginated messages, newest first in DB but returned oldest→newest for UI.
// -----------------------------------------------------------------------------
const listMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;
    const { before, limit = 50 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ message: 'Invalid conversationId' });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    if (!conversation.participants.some((p) => p.toString() === userId)) {
      return res.status(403).json({ message: 'Not a participant' });
    }

    const query = { conversation: conversationId };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const pageSize = Math.min(parseInt(limit) || 50, 100);

    const docs = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .populate('sender', 'name profile.profilePicture')
      .lean();

    // Return oldest→newest so the UI can append naturally.
    const messages = docs.reverse().map((m) => ({
      _id: m._id,
      conversation: m.conversation,
      sender: m.sender,
      content: m.content,
      readBy: m.readBy || [],
      createdAt: m.createdAt,
    }));

    res.json({ success: true, messages, hasMore: docs.length === pageSize });
  } catch (error) {
    console.error('Error listing messages:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// -----------------------------------------------------------------------------
// POST /api/messages/conversations/:conversationId/messages { content }
// Persist and emit the new message to both participants' sockets.
// -----------------------------------------------------------------------------
const sendMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ message: 'Invalid conversationId' });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    if (!conversation.participants.some((p) => p.toString() === userId)) {
      return res.status(403).json({ message: 'Not a participant' });
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: userId,
      content: content.trim(),
      readBy: [userId], // sender has implicitly read their own message
    });

    await message.populate('sender', 'name profile.profilePicture');

    conversation.lastMessage = {
      content: message.content,
      sender: message.sender._id,
      createdAt: message.createdAt,
    };
    conversation.lastMessageAt = message.createdAt;
    await conversation.save();

    const payload = {
      _id: message._id,
      conversation: conversationId,
      sender: message.sender,
      content: message.content,
      readBy: message.readBy,
      createdAt: message.createdAt,
    };

    // Emit to every participant's personal room (covers multiple tabs/devices).
    conversation.participants.forEach((participantId) => {
      emitToUser(participantId, 'message:new', payload);
    });

    // Create a bell notification for every OTHER participant. Fires once per
    // DB row (throttled in createMessageNotification) and is emitted over
    // `newNotification` which the frontend NotificationContext already
    // listens for — so the bell count updates live.
    await Promise.all(
      conversation.participants
        .filter((participantId) => participantId.toString() !== userId.toString())
        .map((recipientId) =>
          createMessageNotification({
            senderId: userId,
            recipientId,
            senderName: message.sender?.name,
            preview: message.content,
          })
        )
    );

    res.status(201).json({ success: true, message: payload });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// -----------------------------------------------------------------------------
// PUT /api/messages/conversations/:conversationId/read
// Mark all unread messages in a conversation as read by the current user.
// -----------------------------------------------------------------------------
const markConversationRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ message: 'Invalid conversationId' });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    if (!conversation.participants.some((p) => p.toString() === userId)) {
      return res.status(403).json({ message: 'Not a participant' });
    }

    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: userId },
        readBy: { $ne: userId },
      },
      { $addToSet: { readBy: userId } }
    );

    // Inform the other participant(s) that their messages have been read.
    conversation.participants.forEach((participantId) => {
      if (participantId.toString() !== userId.toString()) {
        emitToUser(participantId, 'message:read', {
          conversationId,
          readerId: userId,
          readAt: new Date(),
        });
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking conversation read:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  listConversations,
  startConversation,
  listMessages,
  sendMessage,
  markConversationRead,
};
