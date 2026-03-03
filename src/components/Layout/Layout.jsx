import React, { useState, useEffect, useCallback } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ children, role = 'student' }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Theme initialization
  useEffect(() => {
    const initializeTheme = () => {
      const savedTheme = localStorage.getItem('theme');
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const shouldBeDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);

      setIsDarkMode(shouldBeDark);
      document.documentElement.classList.toggle('dark', shouldBeDark);
    };

    initializeTheme();
  }, []);

  // Toggle dark mode
  const toggleDarkMode = useCallback(() => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    document.documentElement.classList.toggle('dark', newDarkMode);
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Close sidebar
  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  // Toggle sidebar
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  // Close sidebar on Escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isSidebarOpen) {
        closeSidebar();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isSidebarOpen, closeSidebar]);

  // Close sidebar when clicking overlay
  const handleOverlayClick = useCallback((event) => {
    if (event.target === event.currentTarget) {
      closeSidebar();
    }
  }, [closeSidebar]);

  // Role-based background gradients – now in blue/cyan family
  const getBackgroundGradient = () => {
    switch (role) {
      case 'admin':
        return 'bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900/30';
      case 'teacher':
        return 'bg-gradient-to-br from-cyan-50 to-blue-100 dark:from-gray-900 dark:to-cyan-900/30';
      case 'student':
        return 'bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-green-900/30';
      default:
        return 'bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800';
    }
  };

  return (
    <div className={`min-h-screen ${getBackgroundGradient()} transition-colors duration-300`}>
      {/* Decorative Background Blobs - now blue/cyan */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-200 dark:bg-cyan-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 animate-pulse delay-1000" />
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-indigo-200 dark:bg-indigo-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 animate-pulse delay-500" />
      </div>

      <div className="relative z-10 flex h-screen overflow-hidden">
        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
            onClick={handleOverlayClick}
            aria-hidden="true"
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-50 w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl
            border-r border-blue-100/50 dark:border-gray-700/50 shadow-2xl
            transform transition-transform duration-300 ease-in-out
            lg:translate-x-0 lg:static lg:inset-auto
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
          aria-label="Sidebar navigation"
        >
          <Sidebar 
            isOpen={isSidebarOpen} 
            onClose={closeSidebar}
            userRole={role}
          />
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen lg:ml-0 overflow-hidden">
          <Header
            onMenuClick={toggleSidebar}
            isDarkMode={isDarkMode}
            toggleDarkMode={toggleDarkMode}
            userRole={role}
          />

          {/* Scrollable Page Content */}
          <main className="flex-1 overflow-auto p-4 lg:p-6 transition-all duration-300">
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;