import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// Backend base URL for profile pictures
const ASSET_BASE_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

const Members = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/members');
      if (response.data.success) {
        setMembers(response.data.members);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      // Mock data for testing
      setMembers([
        {
          id: '1',
          name: 'John Doe',
          role: 'student',
          headline: 'Full Stack Developer',
          location: 'San Francisco, CA',
          profilePicture: null,
          followersCount: 42,
          followingCount: 15
        },
        {
          id: '2',
          name: 'Jane Smith',
          role: 'recruiter',
          headline: 'Senior Technical Recruiter',
          location: 'New York, NY',
          profilePicture: null,
          followersCount: 128,
          followingCount: 89
        },
        {
          id: '3',
          name: 'Mike Johnson',
          role: 'student',
          headline: 'Data Science Enthusiast',
          location: 'Austin, TX',
          profilePicture: null,
          followersCount: 23,
          followingCount: 67
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.headline.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    const isNotCurrentUser = member.id !== user?.id;

    return matchesSearch && matchesRole && isNotCurrentUser;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-200 dark:border-white/10 border-t-blue-600 dark:border-t-indigo-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 tracking-tight">Community Members</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Discover and connect with other professionals
            <span className="ml-2 text-gray-400 dark:text-gray-600">&middot;</span>
            <span className="ml-2 text-blue-600 dark:text-indigo-400 font-medium">{filteredMembers.length} members</span>
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <svg className="absolute left-3.5 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search members by name or headline..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-indigo-500/30 focus:border-blue-300 dark:focus:border-indigo-500 transition"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2.5 text-sm border border-gray-200 dark:border-white/10 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-indigo-500/30 focus:border-blue-300 dark:focus:border-indigo-500 transition lg:w-48 appearance-none"
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="recruiter">Recruiters</option>
          </select>
        </div>

        {/* Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className="border border-gray-200 dark:border-white/10 rounded-xl
                         hover:border-gray-300 dark:hover:border-white/20 hover:shadow-md dark:hover:shadow-black/40
                         transition-all duration-200
                         bg-white dark:bg-gray-900/60
                         overflow-hidden flex flex-col"
            >

              <div className="p-5 flex-1">
                {/* Profile Picture & Headline */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                    {member.profilePicture ? (
                      <img
                        src={`${ASSET_BASE_URL}${member.profilePicture}`}
                        alt={member.name}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-lg font-semibold">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">{member.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{member.headline}</p>
                  </div>
                </div>

                {/* Location & Role */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {member.location || 'Not specified'}
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium border ${member.role === 'student'
                      ? 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/25'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/25'
                    }`}>
                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                  </span>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{member.followersCount}</span> followers
                  </div>
                  <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{member.followingCount}</span> following
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="border-t border-gray-100 dark:border-white/5 p-3 bg-gray-50/50 dark:bg-white/[0.02] flex gap-2">
                <Link
                  to={`/profile/${member.id}`}
                  className="flex-1 inline-flex justify-center items-center px-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/10 hover:text-blue-600 dark:hover:text-indigo-300 transition-colors shadow-sm dark:shadow-none"
                >
                  View Profile
                </Link>
                <Link
                  to={`/messages?user=${member.id}`}
                  className="inline-flex items-center justify-center px-3 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-400 dark:text-gray-400 hover:text-blue-600 dark:hover:text-indigo-300 hover:bg-blue-50 dark:hover:bg-indigo-500/10 hover:border-blue-100 dark:hover:border-indigo-500/30 transition-colors shadow-sm dark:shadow-none"
                  title="Message"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </Link>
              </div>

            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredMembers.length === 0 && (
          <div className="text-center py-20 border border-dashed border-gray-200 dark:border-white/10 rounded-2xl">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-2xl mb-4">
              <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354l-5.414 5.414m5.414-5.414l5.414 5.414M12 4.354V19.646M5 19h14" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No members found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
              Try adjusting your search terms or role filters to find more colleagues.
            </p>
            {(searchTerm || roleFilter !== 'all') && (
              <button
                onClick={() => { setSearchTerm(''); setRoleFilter('all'); }}
                className="text-sm font-medium text-blue-600 dark:text-indigo-400 hover:text-blue-700 dark:hover:text-indigo-300"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Members;
