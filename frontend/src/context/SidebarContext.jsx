import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

/*
 * Tracks the desktop sidebar's expand/collapse state and persists it across
 * reloads. Layout reads this to size the main-content offset; Sidebar reads it
 * to decide whether to show labels or just icons. Centralising the state
 * prevents Layout and Sidebar from drifting out of sync.
 *
 * Width values are kept on a single source of truth here so Tailwind
 * arbitrary-value classes can be built from them in one place.
 */

const STORAGE_KEY = 'SkillHunt:sidebar-expanded';

// w-20 (80px) collapsed rail, w-72 (288px) when expanded — close to a 1:3
// split against the main content on ~1024-1280px viewports without being so
// wide that it hurts content readability on laptops.
export const SIDEBAR_COLLAPSED_WIDTH = 80; // px
export const SIDEBAR_EXPANDED_WIDTH = 288; // px

const SidebarContext = createContext(null);

export const useSidebar = () => {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return ctx;
};

export const SidebarProvider = ({ children }) => {
  const [expanded, setExpanded] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(expanded));
    } catch {
      // localStorage can throw in private modes — we just forget the preference.
    }
  }, [expanded]);

  const toggle = useCallback(() => setExpanded((v) => !v), []);
  const expand = useCallback(() => setExpanded(true), []);
  const collapse = useCallback(() => setExpanded(false), []);

  const width = expanded ? SIDEBAR_EXPANDED_WIDTH : SIDEBAR_COLLAPSED_WIDTH;

  return (
    <SidebarContext.Provider value={{ expanded, width, toggle, expand, collapse, setExpanded }}>
      {children}
    </SidebarContext.Provider>
  );
};
