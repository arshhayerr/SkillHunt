import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

/*
 * Lightweight top bar shown on all unauthenticated routes (landing, /login,
 * /register, and the public informational pages). Intentionally minimal: brand,
 * a couple of public links, auth CTAs (hidden on the page they belong to), and
 * a theme toggle — this is the only place unauthenticated users can change the
 * theme, since the full Sidebar is hidden until login.
 */

const SunIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.8}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
    />
  </svg>
);

const MoonIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.8}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21.752 15.002A9.72 9.72 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
    />
  </svg>
);

const ThemeToggle = () => {
  const { appliedTheme, toggleTheme } = useTheme();
  const isDark = appliedTheme === 'dark';
  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-700"
    >
      {isDark ? <SunIcon className="w-4.5 h-4.5" width={18} height={18} /> : <MoonIcon className="w-4.5 h-4.5" width={18} height={18} />}
    </button>
  );
};

const Navbar = () => {
  const { pathname } = useLocation();
  const onLogin = pathname === '/login';
  const onRegister = pathname === '/register';

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur border-b border-gray-100 dark:border-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="text-xl font-extrabold text-gray-900 dark:text-gray-50 tracking-tight"
        >
          SkillHunt
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/about"
            className="hidden sm:inline text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-lg transition-colors"
          >
            About
          </Link>

          <ThemeToggle />

          {!onLogin && (
            <Link
              to="/login"
              className="text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-lg transition-colors"
            >
              Login
            </Link>
          )}
          {!onRegister && (
            <Link
              to="/register"
              className="text-sm font-semibold bg-gray-900 dark:bg-white dark:text-gray-900 text-white hover:bg-black px-4 py-2 rounded-xl shadow-sm transition-colors"
            >
              Register
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
