import React, { useMemo, useState } from 'react';
import { formatDistanceToNowStrict } from 'date-fns';
import Avatar from './Avatar';

const ConversationList = ({
  conversations,
  activeId,
  currentUserId,
  onSelect,
  onNewChat,
  loading,
}) => {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return conversations;
    const q = query.toLowerCase();
    return conversations.filter((c) =>
      (c.otherUser?.name || '').toLowerCase().includes(q)
    );
  }, [conversations, query]);

  return (
    <aside className="w-full lg:w-96 flex-shrink-0 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-white/5 flex flex-col">
      <header className="p-5 border-b border-gray-100 dark:border-white/5 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-extrabold text-gray-900 dark:text-gray-50 tracking-tight">
            Messages
          </h1>
          <button
            onClick={onNewChat}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <svg
              className="w-3.5 h-3.5"
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
            New
          </button>
        </div>

        <div className="relative">
          <svg
            className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations"
            className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100"
          />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {loading && conversations.length === 0 ? (
          <div className="p-6 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-7 h-7"
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
              {query ? 'No matches' : 'No conversations yet'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {query
                ? 'Try a different search term.'
                : 'Start a new chat to connect with members.'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-white/5">
            {filtered.map((c) => {
              const isActive = c._id === activeId;
              const lastFromMe =
                c.lastMessage?.sender?.toString() === currentUserId?.toString();
              const preview = c.lastMessage?.content || 'Say hi 👋';
              const time = c.lastMessageAt
                ? formatDistanceToNowStrict(new Date(c.lastMessageAt), {
                    addSuffix: false,
                  })
                : '';
              return (
                <li key={c._id}>
                  <button
                    onClick={() => onSelect(c._id)}
                    className={`w-full text-left flex items-start gap-3 p-4 transition-colors ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-500/10 border-l-2 border-indigo-500'
                        : 'hover:bg-gray-50 dark:hover:bg-white/[0.04] border-l-2 border-transparent'
                    }`}
                  >
                    <Avatar
                      name={c.otherUser?.name}
                      src={c.otherUser?.profilePicture}
                      size="lg"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {c.otherUser?.name || 'Unknown user'}
                        </p>
                        {time && (
                          <span className="text-[11px] text-gray-400 dark:text-gray-500 flex-shrink-0">
                            {time}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`text-xs truncate ${
                            c.unreadCount > 0 && !lastFromMe
                              ? 'text-gray-900 dark:text-gray-100 font-semibold'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          {lastFromMe && c.lastMessage?.content ? 'You: ' : ''}
                          {preview}
                        </p>
                        {c.unreadCount > 0 && !lastFromMe && (
                          <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex-shrink-0">
                            {c.unreadCount > 99 ? '99+' : c.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
};

export default ConversationList;
