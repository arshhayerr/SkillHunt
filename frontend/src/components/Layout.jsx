import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './layout/Sidebar';
import Navbar from './layout/Navbar';
import Footer from './layout/Footer';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';

const Layout = () => {
  const { isAuthenticated } = useAuth();
  const { width } = useSidebar();
  const authed = isAuthenticated();

  // On desktop (lg+) the sidebar is fixed-position, so the main column just
  // needs a matching left padding. The inline style keeps the padding in lock-
  // step with the sidebar's own animated width for a seamless slide.
  const desktopPadding = authed ? width : 0;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      {authed ? <Sidebar /> : <Navbar />}

      <div
        style={{ '--sidebar-pad': `${desktopPadding}px` }}
        className="flex-1 flex flex-col lg:pl-[var(--sidebar-pad)] transition-[padding] duration-300 ease-out"
      >
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
