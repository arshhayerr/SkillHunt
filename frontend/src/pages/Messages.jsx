import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMessages } from '../context/MessagesContext';
import ConversationList from '../components/messages/ConversationList';
import ChatWindow from '../components/messages/ChatWindow';
import NewChatModal from '../components/messages/NewChatModal';

const Messages = () => {
  const { user } = useAuth();
  const {
    conversations,
    messagesByConvo,
    typingByConvo,
    activeConversationId,
    loadingConversations,
    openConversation,
    startConversation,
    sendMessage,
    emitTyping,
    setActiveConversationId,
  } = useMessages();
  const navigate = useNavigate();
  const location = useLocation();

  const [newChatOpen, setNewChatOpen] = useState(false);
  const [processedQuery, setProcessedQuery] = useState(false);

  // Support deep-linking: /messages?user=<userId> auto-opens (or creates) a
  // 1:1 conversation with that user. Consumed once per mount.
  useEffect(() => {
    if (processedQuery) return;
    const params = new URLSearchParams(location.search);
    const targetUserId = params.get('user');
    if (targetUserId) {
      setProcessedQuery(true);
      startConversation(targetUserId)
        .catch((err) => {
          console.error('Failed to start conversation from URL:', err);
        })
        .finally(() => {
          navigate('/messages', { replace: true });
        });
    } else {
      setProcessedQuery(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, processedQuery]);

  const activeConversation = useMemo(
    () => conversations.find((c) => c._id === activeConversationId) || null,
    [conversations, activeConversationId]
  );

  const activeMessages = activeConversationId
    ? messagesByConvo[activeConversationId] || []
    : [];

  const isOtherTyping = useMemo(() => {
    if (!activeConversation) return false;
    const convoTyping = typingByConvo[activeConversation._id] || {};
    const otherId = activeConversation.otherUser?._id?.toString();
    if (!otherId) return false;
    return Boolean(convoTyping[otherId]);
  }, [activeConversation, typingByConvo]);

  const handleSelect = (conversationId) => {
    openConversation(conversationId);
  };

  const handleNewChatSelect = async (userId) => {
    setNewChatOpen(false);
    try {
      await startConversation(userId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async (content) => {
    if (!activeConversation) return;
    await sendMessage(activeConversation._id, content);
  };

  const handleTyping = (isTyping) => {
    if (!activeConversation?.otherUser?._id) return;
    emitTyping(activeConversation._id, activeConversation.otherUser._id, isTyping);
  };

  const showChatOnMobile = Boolean(activeConversationId);

  return (
    <div className="h-[calc(100vh-4rem)] bg-gray-50 flex overflow-hidden">
      {/* Conversation list — hidden on mobile when a chat is active. */}
      <div
        className={`${
          showChatOnMobile ? 'hidden lg:flex' : 'flex'
        } w-full lg:w-auto`}
      >
        <ConversationList
          conversations={conversations}
          activeId={activeConversationId}
          currentUserId={user?.id}
          onSelect={handleSelect}
          onNewChat={() => setNewChatOpen(true)}
          loading={loadingConversations}
        />
      </div>

      {/* Chat area */}
      <div
        className={`${
          showChatOnMobile ? 'flex' : 'hidden lg:flex'
        } flex-1 min-w-0`}
      >
        {activeConversation ? (
          <ChatWindow
            conversation={activeConversation}
            messages={activeMessages}
            currentUserId={user?.id}
            isTyping={isOtherTyping}
            onSend={handleSend}
            onTyping={handleTyping}
            onBack={() => setActiveConversationId(null)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50 p-8">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 bg-white border border-gray-200 shadow-sm text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-extrabold text-gray-900 mb-2">
                Your Messages
              </h1>
              <p className="text-gray-500 text-sm mb-6">
                Select a conversation or start a new chat to connect with
                members in real time.
              </p>
              <button
                onClick={() => setNewChatOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-black text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Start a new chat
              </button>
            </div>
          </div>
        )}
      </div>

      <NewChatModal
        isOpen={newChatOpen}
        onClose={() => setNewChatOpen(false)}
        onSelectUser={handleNewChatSelect}
        currentUserId={user?.id}
      />
    </div>
  );
};

export default Messages;
