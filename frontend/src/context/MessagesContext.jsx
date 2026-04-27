import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { messageAPI } from '../services/api';

const MessagesContext = createContext(null);

export const useMessages = () => {
  const ctx = useContext(MessagesContext);
  if (!ctx) {
    throw new Error('useMessages must be used within a MessagesProvider');
  }
  return ctx;
};

export const MessagesProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  const [socket, setSocket] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  // messagesByConvo: { [conversationId]: Message[] }
  const [messagesByConvo, setMessagesByConvo] = useState({});
  // typingByConvo: { [conversationId]: { [userId]: timestamp } }
  const [typingByConvo, setTypingByConvo] = useState({});
  const [loadingConversations, setLoadingConversations] = useState(false);

  // We keep a ref of the active conversation so socket listeners (registered
  // once) can read the latest value without being re-registered on every
  // activeConversationId change.
  const activeConversationIdRef = useRef(null);
  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  // ---------------------------------------------------------------------------
  // Socket lifecycle — a dedicated socket for chat. The backend uses rooms
  // (`user:${userId}`) so this coexists with the notifications socket.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!isAuthenticated() || !user?.id) return;

    const SOCKET_URL =
      import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';
    const s = io(SOCKET_URL);

    s.on('connect', () => {
      s.emit('join', user.id);
    });

    s.on('message:new', (message) => {
      // Append to messages if we already have that conversation loaded.
      setMessagesByConvo((prev) => {
        const existing = prev[message.conversation];
        if (!existing) return prev;
        // Guard against duplicates from optimistic append.
        if (existing.some((m) => m._id === message._id)) return prev;
        return { ...prev, [message.conversation]: [...existing, message] };
      });

      // Update conversation list preview + unread count.
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c._id === message.conversation);
        const senderId =
          typeof message.sender === 'object' ? message.sender._id : message.sender;
        const fromMe = senderId?.toString() === user.id?.toString();
        const isActive =
          activeConversationIdRef.current === message.conversation;

        const nextPreview = {
          content: message.content,
          sender: senderId,
          createdAt: message.createdAt,
        };

        if (idx === -1) {
          // Unknown conversation — refetch the full list to hydrate it.
          messageAPI
            .getConversations()
            .then((res) => setConversations(res.data.conversations || []))
            .catch(() => {});
          return prev;
        }

        const updated = {
          ...prev[idx],
          lastMessage: nextPreview,
          lastMessageAt: message.createdAt,
          unreadCount:
            fromMe || isActive ? prev[idx].unreadCount : prev[idx].unreadCount + 1,
        };
        const without = prev.filter((_, i) => i !== idx);
        return [updated, ...without];
      });

      // Auto-mark-read if the user is looking at this conversation.
      const senderId =
        typeof message.sender === 'object' ? message.sender._id : message.sender;
      const fromMe = senderId?.toString() === user.id?.toString();
      if (
        !fromMe &&
        activeConversationIdRef.current === message.conversation
      ) {
        messageAPI.markRead(message.conversation).catch(() => {});
      }
    });

    s.on('message:read', ({ conversationId, readerId }) => {
      // Mark all of MY messages in this convo as read by readerId.
      setMessagesByConvo((prev) => {
        const list = prev[conversationId];
        if (!list) return prev;
        return {
          ...prev,
          [conversationId]: list.map((m) => {
            const senderId =
              typeof m.sender === 'object' ? m.sender._id : m.sender;
            if (senderId?.toString() !== user.id?.toString()) return m;
            if ((m.readBy || []).some((id) => id?.toString() === readerId?.toString())) {
              return m;
            }
            return { ...m, readBy: [...(m.readBy || []), readerId] };
          }),
        };
      });
    });

    s.on('typing:start', ({ conversationId, fromUserId }) => {
      setTypingByConvo((prev) => ({
        ...prev,
        [conversationId]: {
          ...(prev[conversationId] || {}),
          [fromUserId]: Date.now(),
        },
      }));
    });

    s.on('typing:stop', ({ conversationId, fromUserId }) => {
      setTypingByConvo((prev) => {
        const convoTyping = { ...(prev[conversationId] || {}) };
        delete convoTyping[fromUserId];
        return { ...prev, [conversationId]: convoTyping };
      });
    });

    setSocket(s);

    return () => {
      s.disconnect();
      setSocket(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Safety: clear stale typing indicators after 4s of inactivity.
  useEffect(() => {
    const interval = setInterval(() => {
      setTypingByConvo((prev) => {
        let changed = false;
        const next = {};
        const now = Date.now();
        for (const [convoId, users] of Object.entries(prev)) {
          const filtered = {};
          for (const [uid, ts] of Object.entries(users)) {
            if (now - ts < 4000) {
              filtered[uid] = ts;
            } else {
              changed = true;
            }
          }
          next[convoId] = filtered;
        }
        return changed ? next : prev;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // ---------------------------------------------------------------------------
  // API actions
  // ---------------------------------------------------------------------------
  const fetchConversations = useCallback(async () => {
    if (!isAuthenticated() || !user?.id) return;
    try {
      setLoadingConversations(true);
      const res = await messageAPI.getConversations();
      setConversations(res.data.conversations || []);
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoadingConversations(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const fetchMessages = useCallback(async (conversationId) => {
    try {
      const res = await messageAPI.getMessages(conversationId);
      setMessagesByConvo((prev) => ({
        ...prev,
        [conversationId]: res.data.messages || [],
      }));
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  }, []);

  const openConversation = useCallback(
    async (conversationId) => {
      setActiveConversationId(conversationId);
      if (!messagesByConvo[conversationId]) {
        await fetchMessages(conversationId);
      }
      // Mark as read server-side and locally.
      try {
        await messageAPI.markRead(conversationId);
        setConversations((prev) =>
          prev.map((c) =>
            c._id === conversationId ? { ...c, unreadCount: 0 } : c
          )
        );
      } catch (err) {
        console.error('Error marking conversation read:', err);
      }
    },
    [messagesByConvo, fetchMessages]
  );

  const startConversation = useCallback(
    async (otherUserId) => {
      try {
        const res = await messageAPI.startConversation(otherUserId);
        const convo = res.data.conversation;
        setConversations((prev) => {
          if (prev.some((c) => c._id === convo._id)) return prev;
          return [convo, ...prev];
        });
        await openConversation(convo._id);
        return convo;
      } catch (err) {
        console.error('Error starting conversation:', err);
        throw err;
      }
    },
    [openConversation]
  );

  const sendMessage = useCallback(
    async (conversationId, content) => {
      if (!content || !content.trim()) return;
      try {
        const res = await messageAPI.sendMessage(conversationId, content);
        const message = res.data.message;
        // The socket 'message:new' emit will also deliver this to us, but
        // duplicate guard in the handler + sender filter in the list update
        // keeps things consistent. We still append optimistically for snappy
        // feedback in case the socket lags.
        setMessagesByConvo((prev) => {
          const list = prev[conversationId] || [];
          if (list.some((m) => m._id === message._id)) return prev;
          return { ...prev, [conversationId]: [...list, message] };
        });
        setConversations((prev) => {
          const idx = prev.findIndex((c) => c._id === conversationId);
          if (idx === -1) return prev;
          const updated = {
            ...prev[idx],
            lastMessage: {
              content: message.content,
              sender: message.sender?._id || message.sender,
              createdAt: message.createdAt,
            },
            lastMessageAt: message.createdAt,
          };
          const without = prev.filter((_, i) => i !== idx);
          return [updated, ...without];
        });
      } catch (err) {
        console.error('Error sending message:', err);
        throw err;
      }
    },
    []
  );

  const emitTyping = useCallback(
    (conversationId, toUserId, isTyping) => {
      if (!socket || !conversationId || !toUserId) return;
      socket.emit(isTyping ? 'typing:start' : 'typing:stop', {
        conversationId,
        toUserId,
      });
    },
    [socket]
  );

  const totalUnread = conversations.reduce(
    (sum, c) => sum + (c.unreadCount || 0),
    0
  );

  const value = {
    socket,
    conversations,
    messagesByConvo,
    typingByConvo,
    activeConversationId,
    loadingConversations,
    totalUnread,
    openConversation,
    startConversation,
    sendMessage,
    emitTyping,
    fetchConversations,
    setActiveConversationId,
  };

  return (
    <MessagesContext.Provider value={value}>
      {children}
    </MessagesContext.Provider>
  );
};
