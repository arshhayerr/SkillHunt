import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { applicationAPI, projectAPI } from '../services/api';
import LandingPage from './LandingPage';

const HomePage = () => {
  const { user, isAuthenticated } = useAuth();

  const [stats, setStats] = useState({
    applications: 0,
    projects: 0,
    messages: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated() && user) {
      fetchUserStats();
    }
  }, [isAuthenticated, user]);

  const fetchUserStats = async () => {
    try {
      setLoading(true);

      if (user?.role === 'student') {
        let applications = [];
        let projects = [];

        try {
          const appResponse = await applicationAPI.getMyApplications();
          applications = appResponse.data.applications || appResponse.data || [];
        } catch (error) {
          console.warn('Applications unavailable:', error?.message || error);
        }

        // Fetch only this student's own projects — NOT every project in the DB.
        // Previously we pulled /projects (all public projects) which made the
        // dashboard show other students' seeded data.
        try {
          const mineResponse = await projectAPI.getMyProjects();
          projects = mineResponse.data.projects || mineResponse.data || [];
        } catch (error) {
          console.warn('My projects unavailable:', error?.message || error);
          projects = [];
        }

        setStats({
          applications: Array.isArray(applications) ? applications.length : 0,
          projects: Array.isArray(projects) ? projects.length : 0,
          messages: 0,
        });

        const activities = [];

        if (Array.isArray(applications) && applications.length > 0) {
          applications.slice(0, 2).forEach((app) => {
            activities.push({
              type: 'application',
              message: `Applied to ${app.job?.title || 'a position'} at ${app.job?.company || 'a company'}`,
              status: app.status || 'pending',
              timestamp: app.createdAt || app.appliedAt,
            });
          });
        }

        if (Array.isArray(projects) && projects.length > 0) {
          projects.slice(0, 2).forEach((project) => {
            activities.push({
              type: 'project',
              message: `Created project "${project.title || project.name || 'Untitled'}"`,
              status: 'created',
              timestamp: project.createdAt,
            });
          });
        }

        if (activities.length <= 2) {
          activities.push({
            type: 'general',
            message: `Welcome ${user.name}! You have ${projects.length} project${projects.length === 1 ? '' : 's'} to showcase.`,
            timestamp: user.createdAt || new Date().toISOString(),
          });
        }

        activities.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
        setRecentActivity(activities.slice(0, 4));
      } else {
        setStats({
          applications: 0,
          projects: 0,
          messages: 0,
        });

        setRecentActivity([
          {
            type: 'general',
            message: 'Welcome to your recruiter dashboard',
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
      setStats({ applications: 0, projects: 0, messages: 0 });
      setRecentActivity([
        {
          type: 'general',
          message: 'Welcome to SkillHunt!',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated()) {
    return <LandingPage />;
  }

  // Helper functions
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user?.name?.split(' ')[0] || 'User';

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Recently';

    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getActivityIconColor = (type, status) => {
    if (type === 'application') {
      if (status === 'accepted') return 'bg-green-500';
      if (status === 'rejected') return 'bg-red-500';
      if (status === 'shortlisted') return 'bg-purple-500';
      return 'bg-blue-500';
    }
    if (type === 'project') return 'bg-green-500';
    return 'bg-gray-400';
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Welcome Header */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                <span className="text-white font-semibold text-base">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 tracking-tight">
                  {getGreeting()}, {firstName}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Welcome back to your {user?.role === 'student' ? 'student' : 'recruiter'} dashboard
                </p>
              </div>
            </div>

            <div className="hidden md:block">
              {user?.role === 'student' ? (
                <Link
                  to="/projects/new"
                  className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add New Project
                </Link>
              ) : (
                <Link
                  to="/jobs/post"
                  className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Post New Job
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {loading ? (
            <div className="col-span-3 flex justify-center items-center h-20">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 dark:border-white/10 border-t-gray-900 dark:border-t-indigo-400"></div>
            </div>
          ) : (
            <>
              <div className="bg-blue-50 border border-blue-100 dark:bg-blue-500/10 dark:border-blue-500/25 rounded-xl p-5">
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.projects}</div>
                <div className="text-xs text-blue-500 dark:text-blue-400 mt-1 font-medium">
                  {user?.role === 'student' ? 'Projects' : 'Job Posts'}
                </div>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/25 rounded-xl p-5">
                <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{stats.applications}</div>
                <div className="text-xs text-emerald-500 dark:text-emerald-400 mt-1 font-medium">
                  {user?.role === 'student' ? 'Applications' : 'Received'}
                </div>
              </div>
              <div className="bg-indigo-50 border border-indigo-100 dark:bg-indigo-500/10 dark:border-indigo-500/25 rounded-xl p-5">
                <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">{stats.messages}</div>
                <div className="text-xs text-indigo-500 dark:text-indigo-400 mt-1 font-medium">Messages</div>
              </div>
            </>
          )}
        </div>

        {/* Quick Actions Grid */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(user?.role === 'student' ? [
              { to: '/projects/browse', title: 'Browse Projects', desc: 'Discover projects from other students', color: 'blue' },
              { to: '/projects/my', title: 'My Projects', desc: 'Manage and showcase your work', color: 'emerald', badge: stats.projects > 0 ? `${stats.projects} project${stats.projects !== 1 ? 's' : ''}` : null },
              { to: '/jobs', title: 'Find Jobs', desc: 'Explore job opportunities', color: 'violet' },
              { to: '/applications', title: 'Applications', desc: 'Track application progress', color: 'amber', badge: stats.applications > 0 ? `${stats.applications} active` : null },
            ] : [
              { to: '/projects/browse', title: 'Browse Talent', desc: 'Discover talented students', color: 'blue' },
              { to: '/jobs/post', title: 'Post Jobs', desc: 'Create job listings', color: 'emerald' },
              { to: '/jobs/manage', title: 'Manage Jobs', desc: 'Track and manage postings', color: 'violet' },
              { to: '/profile', title: 'Company Profile', desc: 'Manage company information', color: 'amber' },
            ]).map((item) => {
              const colorMap = {
                blue: 'hover:border-blue-300 hover:bg-blue-50/50 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/10',
                emerald: 'hover:border-emerald-300 hover:bg-emerald-50/50 dark:hover:border-emerald-500/40 dark:hover:bg-emerald-500/10',
                violet: 'hover:border-violet-300 hover:bg-violet-50/50 dark:hover:border-violet-500/40 dark:hover:bg-violet-500/10',
                amber: 'hover:border-amber-300 hover:bg-amber-50/50 dark:hover:border-amber-500/40 dark:hover:bg-amber-500/10',
              };
              const badgeColorMap = {
                blue: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
                emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
                violet: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
                amber: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
              };
              return (
                <Link to={item.to} key={item.to} className="group">
                  <div className={`border border-gray-200 dark:border-white/10 rounded-xl p-5 transition-all duration-200 h-full ${colorMap[item.color]}`}>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">{item.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                    {item.badge && (
                      <span className={`mt-2 inline-block text-xs font-medium rounded-full px-2.5 py-0.5 ${badgeColorMap[item.color]}`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Recent Activity</h2>
          <div className="border border-gray-200 dark:border-white/10 rounded-xl divide-y divide-gray-100 dark:divide-white/5">
            {loading ? (
              <div className="flex justify-center items-center h-20">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 dark:border-white/10 border-t-gray-900 dark:border-t-indigo-400"></div>
              </div>
            ) : recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center px-5 py-4 text-sm">
                  <div className={`w-1.5 h-1.5 rounded-full mr-3 flex-shrink-0 ${getActivityIconColor(activity.type, activity.status)}`}></div>
                  <span className="flex-1 text-gray-700 dark:text-gray-300">{activity.message}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 ml-4 flex-shrink-0">{formatTimestamp(activity.timestamp)}</span>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
                No recent activity
              </div>
            )}
          </div>
        </div>

        {/* Tip */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100
                        dark:from-blue-500/10 dark:to-indigo-500/10 dark:border-white/20
                        rounded-xl p-5">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">
            {user?.role === 'student' ? 'Pro Tip' : 'Recruiter Tip'}
          </h3>
          <p className="text-sm text-blue-700/70 dark:text-blue-200/80 leading-relaxed">
            {user?.role === 'student'
              ? stats.projects > 0
                ? `Great work on your ${stats.projects} project${stats.projects !== 1 ? 's' : ''}. ${stats.applications > 0 ? 'Keep applying to more positions and' : 'Start applying to jobs and'} showcase your work to attract recruiters.`
                : 'Start by adding your first project. Showcase your best work with detailed descriptions, GitHub links, and live demos to attract recruiters.'
              : 'Browse student projects to discover hidden talent. Look for creativity, technical skills, and passion in their work.'
            }
          </p>
        </div>
      </div>

      {/* Mobile Floating Action Button */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <Link
          to={user?.role === 'student' ? '/projects/new' : '/jobs/post'}
          className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200"
          aria-label={user?.role === 'student' ? 'Add New Project' : 'Post New Job'}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </Link>
      </div>
    </div>
  );
};


export default HomePage;