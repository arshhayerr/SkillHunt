import React, { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../notifications/NotificationBell';
import { useMessages } from '../../context/MessagesContext';
import {
  SIDEBAR_COLLAPSED_WIDTH,
  SIDEBAR_EXPANDED_WIDTH,
  useSidebar,
} from '../../context/SidebarContext';

/*
 * Responsive application sidebar.
 *
 *  - Desktop (lg+): fixed left rail. Toggle at the top expands it from the
 *    collapsed icon-only rail (80px) to a wider panel (288px) that shows the
 *    nav labels. Width is animated with a CSS transition for buttery sliding
 *    without pulling in Framer Motion.
 *  - Mobile: compact top bar + slide-in drawer, unchanged behaviour.
 *  - Background/text colours follow the current theme: light surface with
 *    subtle borders in light mode, near-black with border tint in dark mode.
 *    Previously the rail was hardcoded `bg-gray-950 text-white` regardless of
 *    theme.
 */

const NAV_ITEMS = ({ role, unread }) => {
  const items = [
    {
      to: '/',
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3m10-11v10a1 1 0 01-1 1h-3m-6 0h6m-6 0v-6a1 1 0 011-1h4a1 1 0 011 1v6" />
        </svg>
      ),
      match: (path) => path === '/' || path.startsWith('/dashboard'),
    },
    {
      to: '/projects/browse',
      label: 'Browse Projects',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      match: (path) => path.startsWith('/projects'),
    },
    {
      to: role === 'recruiter' ? '/jobs/manage' : '/jobs',
      label: role === 'recruiter' ? 'Manage Jobs' : 'Find Jobs',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      match: (path) => path.startsWith('/jobs'),
    },
  ];

  if (role === 'student') {
    items.push({
      to: '/applications',
      label: 'Applications',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      match: (path) => path.startsWith('/applications'),
    });
  }

  items.push(
    {
      to: '/members',
      label: 'Members',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-5.13a4 4 0 11-8 0 4 4 0 018 0zm6 0a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      match: (path) => path.startsWith('/members'),
    },
    {
      to: '/messages',
      label: 'Messages',
      badge: unread > 0 ? (unread > 9 ? '9+' : String(unread)) : null,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      match: (path) => path.startsWith('/messages'),
    }
  );

  return items;
};

// Shared row used by both the desktop rail (icon-only or icon+label) and the
// mobile drawer. `expanded` controls label visibility + container layout.
const NavItem = ({ item, expanded, onNavigate, variant = 'rail' }) => {
  const location = useLocation();
  const active = item.match(location.pathname);

  const baseDesktop =
    variant === 'rail'
      ? `group relative flex items-center gap-3 rounded-xl transition-all duration-200 ${
          expanded ? 'h-11 px-3' : 'h-11 w-11 justify-center mx-auto'
        }`
      : 'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors';

  const colors =
    variant === 'rail'
      ? active
        ? 'bg-gray-900/5 text-gray-900 dark:bg-white/10 dark:text-white'
        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-900/5 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5'
      : active
        ? 'bg-white/10 text-white'
        : 'text-gray-300 hover:text-white hover:bg-white/5';

  return (
    <NavLink to={item.to} onClick={onNavigate} className={`${baseDesktop} ${colors}`}>
      <span className="relative flex items-center justify-center shrink-0">
        {item.icon}
        {item.badge && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-indigo-500 text-white text-[9px] font-bold flex items-center justify-center">
            S
          </span>
        )}
      </span>

      {/* Labels always render for the mobile drawer; on desktop rails they
          fade in/out with expansion. */}
      {(variant !== 'rail' || expanded) && (
        <span
          className={`text-sm font-medium truncate transition-opacity duration-150 ${
            variant === 'rail' && !expanded ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {item.label}
        </span>
      )}

      {/* Collapsed-rail tooltip. */}
      {variant === 'rail' && !expanded && (
        <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1 bg-gray-900 text-white text-xs font-medium rounded-md shadow-lg whitespace-nowrap opacity-0 translate-x-[-6px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 z-50 border border-white/10">
          {item.label}
          {item.badge && <span className="ml-1.5 text-indigo-300">({item.badge})</span>}
        </span>
      )}
    </NavLink>
  );
};

const ChevronIcon = ({ expanded }) => (
  <svg
    className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const Sidebar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { totalUnread = 0 } = useMessages() || {};
  const { expanded, toggle } = useSidebar();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const items = useMemo(
    () => NAV_ITEMS({ role: user?.role, unread: totalUnread }),
    [user?.role, totalUnread]
  );

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e) => e.key === 'Escape' && setMobileOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    setMobileOpen(false);
    navigate('/login');
  };

  if (!isAuthenticated()) return null;

  const desktopWidth = expanded ? SIDEBAR_EXPANDED_WIDTH : SIDEBAR_COLLAPSED_WIDTH;

  return (
    <>
      {/* ------------------------- Mobile top bar ------------------------- */}
      <header className="lg:hidden sticky top-0 z-40 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-900 transition-colors duration-200">
        <div className="h-14 px-4 flex items-center justify-between">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
            aria-label="Open menu"
          >
            <svg className="w-5 h-5 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link to="/" className="text-lg font-extrabold text-gray-900 dark:text-gray-50 tracking-tight">
            SkillHunt
          </Link>
          <div className="flex items-center gap-1">
            <NotificationBell />
            <Link
              to="/profile"
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm"
              aria-label="Profile"
            >
              <span className="text-white text-sm font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* ------------------------- Desktop rail -------------------------- */}
      <aside
        style={{ width: desktopWidth }}
        className="hidden lg:flex fixed inset-y-0 left-0 z-40 flex-col items-stretch py-4
                   bg-white dark:bg-gray-950
                   border-r border-gray-200 dark:border-white/5
                   shadow-sm dark:shadow-none
                   transition-[width,background-color,border-color] duration-300 ease-out"
        aria-expanded={expanded}
      >
        {/* Brand + toggle */}
        <div className={`flex items-center ${expanded ? 'justify-between px-4' : 'justify-center'} mb-6`}>
          <Link
            to="/"
            className={`flex items-center gap-2 ${expanded ? '' : ''}`}
            aria-label="SkillHunt home"
          >
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-extrabold text-lg">S</span>
            </span>
            {expanded && (
              <span className="text-lg font-extrabold text-gray-900 dark:text-white tracking-tight">
                SkillHunt
              </span>
            )}
          </Link>
          {expanded && (
            <button
              onClick={toggle}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5 transition-colors"
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
            >
              <ChevronIcon expanded={true} />
            </button>
          )}
        </div>

        {/* Floating toggle when collapsed — sits at the right edge of the rail */}
        {!expanded && (
          <button
            onClick={toggle}
            className="hidden lg:flex absolute -right-3 top-6 w-6 h-6 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white items-center justify-center shadow-sm hover:shadow-md transition-all z-10"
            aria-label="Expand sidebar"
            title="Expand sidebar"
          >
            <ChevronIcon expanded={false} />
          </button>
        )}

        {/* Nav */}
        <nav className={`flex-1 flex flex-col gap-1 overflow-y-auto ${expanded ? 'px-3' : 'px-2'}`}>
          {items.map((item) => (
            <NavItem key={item.to} item={item} expanded={expanded} variant="rail" />
          ))}
        </nav>

        {/* Bottom utility: notifications + user menu */}
        <div
          className={`mt-4 flex flex-col gap-1.5 border-t border-gray-100 dark:border-white/5 pt-3 ${
            expanded ? 'px-3' : 'px-2'
          }`}
        >
          {/*
           * Bell stays in rail placement in BOTH expanded and collapsed
           * sidebars so the popover is always anchored to its bottom-left
           * (opening up-and-out into the main content). Previously the
           * expanded state used placement="top" which dropped the popover
           * below the trigger — and since the bell sits at the bottom of the
           * sidebar, it was clipped below the viewport.
           */}
          <div className={expanded ? '' : 'mx-auto'}>
            <NotificationBell placement="rail" expanded={expanded} />
          </div>

          <div className={`relative ${expanded ? '' : 'mx-auto'}`}>
            <button
              onClick={() => setUserMenuOpen((v) => !v)}
              className={`flex items-center rounded-xl transition-colors ${
                expanded
                  ? 'gap-3 px-2 py-2 w-full hover:bg-gray-100 dark:hover:bg-white/5'
                  : 'w-11 h-11 justify-center ring-2 ring-transparent hover:ring-gray-200 dark:hover:ring-white/20'
              }`}
              aria-label="User menu"
            >
              <span className="w-8 h-8 shrink-0 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </span>
              {expanded && (
                <span className="flex-1 min-w-0 text-left">
                  <span className="block text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {user?.name}
                  </span>
                  <span className="block text-[11px] text-gray-500 dark:text-gray-400 truncate">
                    {user?.role === 'student' ? 'Student' : 'Recruiter'}
                  </span>
                </span>
              )}
            </button>

            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setUserMenuOpen(false)} />
                <div
                  className={`absolute z-40 w-64 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden ${
                    expanded ? 'bottom-full mb-2 left-0' : 'bottom-0 left-full ml-3'
                  }`}
                >
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40">
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{user?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                    <span className="mt-1 inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20 rounded-md">
                      {user?.role === 'student' ? 'Student' : 'Recruiter'}
                    </span>
                  </div>
                  <div className="p-2">
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      My Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Settings
                    </Link>
                  </div>
                  <div className="p-2 border-t border-gray-100 dark:border-gray-800">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* ------------------------- Mobile drawer ------------------------- */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] bg-gray-950 text-white flex flex-col shadow-2xl animate-[slideIn_200ms_ease-out]">
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
              <Link to="/" className="text-lg font-extrabold">
              SkillHunt
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Close menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-4 py-4 border-b border-white/5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
                <span className="text-white font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{user?.name}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>

            <nav className="flex-1 overflow-y-auto p-2">
              {items.map((item) => (
                <NavItem
                  key={item.to}
                  item={item}
                  expanded
                  variant="drawer"
                  onNavigate={() => setMobileOpen(false)}
                />
              ))}
              <div className="my-2 h-px bg-white/5" />
              <NavLink
                to="/profile"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive ? 'bg-white/10 text-white' : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                My Profile
              </NavLink>
              <NavLink
                to="/settings"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive ? 'bg-white/10 text-white' : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </NavLink>
            </nav>

            <div className="p-3 border-t border-white/5">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
};

export default Sidebar;
