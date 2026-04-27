import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const PREFS_KEY = 'SkillHunt:prefs';

const DEFAULT_PREFS = {
  emailNotifications: true,
  pushNotifications: true,
  jobAlerts: true,
  messageSounds: true,
  compactMode: false,
  showOnlineStatus: true,
  reducedMotion: false,
};

const loadPrefs = () => {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULT_PREFS;
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFS;
  }
};

const savePrefs = (prefs) => {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
};

const Toggle = ({ checked, onChange, label, description, disabled }) => (
  <div className="flex items-start justify-between gap-4 py-4">
    <div className="min-w-0">
      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
        {label}
      </p>
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {description}
        </p>
      )}
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900 ${
        checked
          ? 'bg-indigo-600'
          : 'bg-gray-200 dark:bg-gray-700'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  </div>
);

const Section = ({ title, description, children }) => (
  <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
    <header className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
      <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
        {title}
      </h2>
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {description}
        </p>
      )}
    </header>
    <div className="px-6 divide-y divide-gray-100 dark:divide-gray-800">
      {children}
    </div>
  </section>
);

const ThemeOption = ({ value, current, onSelect, icon, label, description }) => {
  const active = value === current;
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={`flex-1 min-w-0 flex flex-col items-start p-4 rounded-xl border-2 transition-all text-left ${
        active
          ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-500/10'
          : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            active
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
          }`}
        >
          {icon}
        </span>
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {label}
        </span>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
    </button>
  );
};

const Settings = () => {
  const { user, logout } = useAuth();
  const { theme, appliedTheme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [prefs, setPrefs] = useState(loadPrefs);
  const [saved, setSaved] = useState(false);

  // Persist prefs with debounce + brief saved indicator.
  useEffect(() => {
    const t = setTimeout(() => {
      savePrefs(prefs);
      setSaved(true);
      const hide = setTimeout(() => setSaved(false), 1400);
      return () => clearTimeout(hide);
    }, 250);
    return () => clearTimeout(t);
  }, [prefs]);

  const updatePref = (key, value) =>
    setPrefs((prev) => ({ ...prev, [key]: value }));

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleClearCache = () => {
    const confirmed = window.confirm(
      'Clear locally cached preferences, notifications, and session data? You may need to log in again.'
    );
    if (!confirmed) return;
    const keepKeys = [];
    Object.keys(localStorage).forEach((k) => {
      if (!keepKeys.includes(k)) localStorage.removeItem(k);
    });
    window.location.reload();
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <header className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-gray-50 tracking-tight">
              Settings
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Personalize your SkillHunt experience. Changes are saved automatically.
            </p>
          </div>
          {saved && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold border border-emerald-100 dark:border-emerald-500/20">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Saved
            </span>
          )}
        </header>

        <div className="space-y-6">
          {/* Appearance */}
          <Section
            title="Appearance"
            description="Choose how SkillHunt looks on this device."
          >
            <div className="py-5">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Theme{' '}
                <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                  (currently applied: {appliedTheme})
                </span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <ThemeOption
                  value="light"
                  current={theme}
                  onSelect={setTheme}
                  label="Light"
                  description="Default bright interface."
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  }
                />
                <ThemeOption
                  value="dark"
                  current={theme}
                  onSelect={setTheme}
                  label="Dark"
                  description="Gentler on the eyes at night."
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  }
                />
                <ThemeOption
                  value="system"
                  current={theme}
                  onSelect={setTheme}
                  label="System"
                  description="Match your OS preference."
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  }
                />
              </div>
            </div>
            <Toggle
              label="Compact mode"
              description="Reduce padding for a denser layout."
              checked={prefs.compactMode}
              onChange={(v) => updatePref('compactMode', v)}
            />
            <Toggle
              label="Reduce motion"
              description="Minimise animations and transitions."
              checked={prefs.reducedMotion}
              onChange={(v) => updatePref('reducedMotion', v)}
            />
          </Section>

          {/* Notifications */}
          <Section
            title="Notifications"
            description="Control what alerts you receive and how."
          >
            <Toggle
              label="Email notifications"
              description="Receive important updates in your inbox."
              checked={prefs.emailNotifications}
              onChange={(v) => updatePref('emailNotifications', v)}
            />
            <Toggle
              label="Push notifications"
              description="Real-time alerts in your browser."
              checked={prefs.pushNotifications}
              onChange={(v) => updatePref('pushNotifications', v)}
            />
            <Toggle
              label="Job alerts"
              description="New roles matching your profile."
              checked={prefs.jobAlerts}
              onChange={(v) => updatePref('jobAlerts', v)}
            />
            <Toggle
              label="Message sounds"
              description="Play a subtle sound on new chat messages."
              checked={prefs.messageSounds}
              onChange={(v) => updatePref('messageSounds', v)}
            />
          </Section>

          {/* Privacy */}
          <Section title="Privacy" description="Manage what others can see.">
            <Toggle
              label="Show online status"
              description="Let other members see when you're active."
              checked={prefs.showOnlineStatus}
              onChange={(v) => updatePref('showOnlineStatus', v)}
            />
          </Section>

          {/* Account */}
          <Section title="Account" description="Your basic account details.">
            <div className="py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  Name
                </label>
                <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100">
                  {user?.name || '—'}
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  Email
                </label>
                <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 truncate">
                  {user?.email || '—'}
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  Role
                </label>
                <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 capitalize">
                  {user?.role || '—'}
                </div>
              </div>
            </div>
            <div className="py-4">
              <button
                disabled
                className="text-sm font-semibold text-gray-400 dark:text-gray-500 cursor-not-allowed"
                title="Coming soon"
              >
                Change password →
              </button>
            </div>
          </Section>

          {/* Danger */}
          <Section title="Session" description="Sign out or clear local data.">
            <div className="py-4 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleClearCache}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-semibold rounded-xl transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 002 2h8a2 2 0 002-2l1-12M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
                </svg>
                Clear local data
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-100 dark:border-red-500/30 text-red-700 dark:text-red-400 text-sm font-semibold rounded-xl transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign out
              </button>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
};

export default Settings;
