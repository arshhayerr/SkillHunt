const mongoose = require('mongoose');

// 1:1 direct message conversation between exactly two users.
// `participants` is always stored sorted (by ObjectId) so we can
// enforce uniqueness and look up a conversation between two users
// deterministically.
const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    lastMessage: {
      content: { type: String, default: '' },
      sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      createdAt: { type: Date },
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });

const Conversation = mongoose.model('Conversation', conversationSchema);
module.exports = Conversation;
