import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../hooks/useAuth.jsx'
import { 
  Menu, 
  Bell, 
  User, 
  LogOut, 
  Settings, 
  Sun, 
  Moon,
  Search,
  ChevronDown
} from 'lucide-react'
import Button from '../UI/Button.jsx'

const Header = ({ onMenuClick, isDarkMode, toggleDarkMode }) => {
  const { t, i18n } = useTranslation()
  const { user, logout, userRole } = useAuth()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const profileRef = useRef(null)
  const notificationsRef = useRef(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en'
    i18n.changeLanguage(newLang)
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr'
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'teacher': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'student': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  return (
    <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-blue-100/50 dark:border-gray-700/50 sticky top-0 z-40 transition-all duration-300">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Mobile menu and search */}
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            {/* Mobile menu button */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-blue-100/50 dark:border-gray-600/50 text-gray-600 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-600/80 transition-all duration-200 hover:scale-105 hover:shadow-lg"
            >
              <Menu size={20} />
            </button>

            {/* Search bar - hidden on mobile */}
            <div className="hidden md:block relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder={t('common.search')}
                className="pl-10 pr-4 py-2 w-64 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-blue-100/50 dark:border-gray-600/50 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            {/* Language toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="hidden sm:flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-blue-100/50 dark:border-gray-600/50 hover:bg-white/80 dark:hover:bg-gray-600/80 transition-all duration-200 hover:scale-105"
            >
              <span className="text-sm font-medium">
                {i18n.language === 'en' ? 'العربية' : 'English'}
              </span>
            </Button>

            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-blue-100/50 dark:border-gray-600/50 text-gray-600 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-600/80 transition-all duration-200 hover:scale-105 hover:shadow-lg"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-blue-100/50 dark:border-gray-600/50 text-gray-600 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-600/80 transition-all duration-200 hover:scale-105 hover:shadow-lg relative"
              >
                <Bell size={18} />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-blue-100/50 dark:border-gray-700/50 py-2 z-50 transform origin-top-right transition-all duration-200 scale-95 hover:scale-100">
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {t('notifications.title')}
                    </h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                      {t('notifications.noNotifications')}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-3 rtl:space-x-reverse p-2 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-blue-100/50 dark:border-gray-600/50 text-gray-600 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-600/80 transition-all duration-200 hover:scale-105 hover:shadow-lg group"
              >
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
                    {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </div>
                  <div className="hidden sm:block text-left rtl:text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-32">
                      {user?.displayName || user?.email}
                    </p>
                    <p className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadgeColor(userRole)}`}>
                      {userRole}
                    </p>
                  </div>
                </div>
                <ChevronDown size={16} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-transform duration-200" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-blue-100/50 dark:border-gray-700/50 py-2 z-50 transform origin-top-right transition-all duration-200 scale-95 hover:scale-100">
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {user?.displayName || 'User'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {user?.email}
                    </p>
                    <p className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${getRoleBadgeColor(userRole)}`}>
                      {userRole}
                    </p>
                  </div>
                  
                  {/* Menu items */}
                  <button
                    onClick={() => window.location.href = '/profile'}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
                  >
                    <User size={16} className="mr-3 rtl:mr-0 rtl:ml-3" />
                    {t('user.profile')}
                  </button>
                  
                  <button
                    onClick={() => window.location.href = '/profile?tab=settings'}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
                  >
                    <Settings size={16} className="mr-3 rtl:mr-0 rtl:ml-3" />
                    {t('user.settings')}
                  </button>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150"
                  >
                    <LogOut size={16} className="mr-3 rtl:mr-0 rtl:ml-3" />
                    {t('auth.logout')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header