import React, { useEffect, useMemo, useRef, useState } from 'react';
import { format, isSameDay } from 'date-fns';
import Avatar from './Avatar';

const TYPING_DEBOUNCE_MS = 1500;

// A thin horizontal date separator inserted between days in the message feed.
const DaySeparator = ({ date }) => (
  <div className="flex items-center gap-3 my-4">
    <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
    <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
      {format(date, 'EEEE, MMM d')}
    </span>
    <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
  </div>
);

const MessageBubble = ({ message, isMine, otherUser, showAvatar, isRead }) => {
  const time = message.createdAt
    ? format(new Date(message.createdAt), 'h:mm a')
    : '';

  if (isMine) {
    return (
      <div className="flex justify-end">
        <div className="flex flex-col items-end max-w-[75%] sm:max-w-[60%]">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white px-4 py-2.5 rounded-2xl rounded-br-md shadow-sm">
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </p>
          </div>
          <div className="flex items-center gap-1 mt-1 px-1">
            <span className="text-[10px] text-gray-400 dark:text-gray-500">{time}</span>
            {isRead ? (
              <svg
                className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2">
      <div className="w-8 h-8 flex-shrink-0">
        {showAvatar && (
          <Avatar
            name={otherUser?.name}
            src={otherUser?.profilePicture}
            size="sm"
          />
        )}
      </div>
      <div className="flex flex-col max-w-[75%] sm:max-w-[60%]">
        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-gray-100 px-4 py-2.5 rounded-2xl rounded-bl-md shadow-sm">
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
        <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 px-1">{time}</span>
      </div>
    </div>
  );
};

const TypingIndicator = ({ name }) => (
  <div className="flex items-center gap-2 px-2 text-xs text-gray-500 dark:text-gray-400">
    <div className="flex gap-1">
      <span
        className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
        style={{ animationDelay: '0ms' }}
      />
      <span
        className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
        style={{ animationDelay: '150ms' }}
      />
      <span
        className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
        style={{ animationDelay: '300ms' }}
      />
    </div>
    <span>
      <span className="font-medium">{name}</span> is typing...
    </span>
  </div>
);

const ChatWindow = ({
  conversation,
  messages,
  currentUserId,
  isTyping,
  onSend,
  onTyping,
  onBack,
}) => {
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);
  const typingTimerRef = useRef(null);
  const isTypingSentRef = useRef(false);
  const otherUser = conversation?.otherUser;

  // Auto-scroll on new messages or typing state changes.
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Stop typing indicator on conversation switch / unmount.
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
      if (isTypingSentRef.current && onTyping) {
        onTyping(false);
        isTypingSentRef.current = false;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation?._id]);

  const handleDraftChange = (e) => {
    const value = e.target.value;
    setDraft(value);

    if (!onTyping) return;
    if (value.trim().length > 0) {
      if (!isTypingSentRef.current) {
        onTyping(true);
        isTypingSentRef.current = true;
      }
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        onTyping(false);
        isTypingSentRef.current = false;
      }, TYPING_DEBOUNCE_MS);
    } else if (isTypingSentRef.current) {
      clearTimeout(typingTimerRef.current);
      onTyping(false);
      isTypingSentRef.current = false;
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    clearTimeout(typingTimerRef.current);
    if (isTypingSentRef.current && onTyping) {
      onTyping(false);
      isTypingSentRef.current = false;
    }
    try {
      await onSend(text);
      setDraft('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Compute which messages should show avatars (last in a run from the other user).
  const groupedMessages = useMemo(() => {
    return messages.map((m, i) => {
      const senderId =
        typeof m.sender === 'object' ? m.sender?._id : m.sender;
      const isMine = senderId?.toString() === currentUserId?.toString();
      const next = messages[i + 1];
      const nextSenderId = next
        ? typeof next.sender === 'object'
          ? next.sender?._id
          : next.sender
        : null;
      const showAvatar = !isMine && nextSenderId?.toString() !== senderId?.toString();
      const prev = messages[i - 1];
      const showDaySeparator =
        !prev ||
        !isSameDay(
          new Date(prev.createdAt || 0),
          new Date(m.createdAt || 0)
        );
      return { message: m, isMine, showAvatar, showDaySeparator };
    });
  }, [messages, currentUserId]);

  // Last outgoing message is "read" when the other participant is in readBy.
  const lastMineReadState = useMemo(() => {
    const myMessages = messages.filter((m) => {
      const senderId = typeof m.sender === 'object' ? m.sender?._id : m.sender;
      return senderId?.toString() === currentUserId?.toString();
    });
    const last = myMessages[myMessages.length - 1];
    if (!last || !otherUser?._id) return false;
    return (last.readBy || []).some(
      (id) => id?.toString() === otherUser._id?.toString()
    );
  }, [messages, currentUserId, otherUser?._id]);

  if (!conversation) return null;

  return (
    <section className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900/40 min-w-0">
      <header className="flex-shrink-0 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-white/5 px-4 sm:px-6 py-3 flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            aria-label="Back to conversations"
          >
            <svg
              className="w-5 h-5 text-gray-700 dark:text-gray-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}
        <Avatar
          name={otherUser?.name}
          src={otherUser?.profilePicture}
          size="md"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
            {otherUser?.name || 'Unknown user'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {isTyping
              ? 'typing...'
              : otherUser?.headline || otherUser?.role || ''}
          </p>
        </div>
      </header>

      <div
        ref={listRef}
        className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-1.5"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-12">
            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8"
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
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
              No messages yet
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs">
              Say hello and start the conversation.
            </p>
          </div>
        ) : (
          groupedMessages.map(
            ({ message, isMine, showAvatar, showDaySeparator }, idx) => (
              <React.Fragment key={message._id}>
                {showDaySeparator && (
                  <DaySeparator date={new Date(message.createdAt)} />
                )}
                <MessageBubble
                  message={message}
                  isMine={isMine}
                  otherUser={otherUser}
                  showAvatar={showAvatar}
                  isRead={
                    isMine &&
                    idx === groupedMessages.length - 1 &&
                    lastMineReadState
                  }
                />
              </React.Fragment>
            )
          )
        )}

        {isTyping && (
          <div className="pt-2">
            <TypingIndicator name={otherUser?.name?.split(' ')[0] || 'User'} />
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex-shrink-0 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-white/5 px-4 sm:px-6 py-3"
      >
        <div className="flex items-end gap-2">
          <textarea
            rows={1}
            value={draft}
            onChange={handleDraftChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 resize-none max-h-32 px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!draft.trim() || sending}
            className="flex-shrink-0 inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </form>
    </section>
  );
};

export default ChatWindow;
