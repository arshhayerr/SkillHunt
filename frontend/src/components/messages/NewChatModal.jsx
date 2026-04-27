import React, { useEffect, useMemo, useState } from 'react';
import { userAPI } from '../../services/api';
import Avatar from './Avatar';

// Debounce helper — runs `fn` after `delay`ms of inactivity.
const useDebounced = (value, delay = 300) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

const NewChatModal = ({ isOpen, onClose, onSelectUser, currentUserId }) => {
  const [query, setQuery] = useState('');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounced(query, 300);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await userAPI.getMembers({
          search: debouncedQuery || undefined,
          limit: 20,
        });
        if (!cancelled) {
          setMembers(res.data.members || []);
        }
      } catch (err) {
        console.error('Error loading members:', err);
        if (!cancelled) setMembers([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen, debouncedQuery]);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  const visibleMembers = useMemo(
    () =>
      members.filter(
        (m) => (m.id || m._id)?.toString() !== currentUserId?.toString()
      ),
    [members, currentUserId]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden max-h-[85vh] flex flex-col">
        <header className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">New message</h2>
            <p className="text-xs text-gray-500">
              Choose a member to start chatting
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </header>

        <div className="p-4 border-b border-gray-100">
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
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search members by name"
              className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-400"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 flex items-center justify-center">
              <div className="w-7 h-7 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
            </div>
          ) : visibleMembers.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-gray-500">
                {query ? 'No members match your search.' : 'No members found.'}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {visibleMembers.map((m) => {
                const id = m.id || m._id;
                return (
                  <li key={id}>
                    <button
                      onClick={() => onSelectUser(id)}
                      className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <Avatar
                        name={m.name}
                        src={m.profilePicture}
                        size="md"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {m.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {m.headline ||
                            (m.role === 'recruiter' ? 'Recruiter' : 'Student')}
                        </p>
                      </div>
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                        {m.role === 'recruiter' ? 'Recruiter' : 'Student'}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewChatModal;
