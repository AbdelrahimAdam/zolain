import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import { notificationService } from '../../services/notificationService' // real service
import { messageService } from '../../services/messageService' // real service
import {
  Home,
  Video,
  Users,
  BarChart3,
  Settings,
  BookOpen,
  Menu,
  X,
  User,
  LogOut,
  Sun,
  Moon,
  Shield,
  GraduationCap,
  UserCheck,
  CreditCard,
  Calendar,
  FileText,
  MessageSquare,
  Bell,
  HelpCircle,
  Zap,
  TrendingUp,
  Crown,
  Database,
  Activity,
  MessageCircle
} from 'lucide-react'

const Sidebar = ({ isOpen, onClose, userRole = 'student' }) => {
  const { t, i18n } = useTranslation()
  const { user, logout, userProfile } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const isRTL = i18n.language === 'ar'
  const [darkMode, setDarkMode] = useState(false)

  // Real-time counts for notifications and messages
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [unreadMessages, setUnreadMessages] = useState(0)

  // Initialize dark mode
  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches
    setDarkMode(isDark)
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', newDarkMode)
  }

  // Fetch real counts from services
  useEffect(() => {
    const fetchCounts = async () => {
      if (!user?.uid) return
      try {
        const notifCount = await notificationService.getUnreadCount(user.uid)
        setUnreadNotifications(notifCount)
        const msgCount = await messageService.getUnreadCount(user.uid)
        setUnreadMessages(msgCount)
      } catch (error) {
        console.error('Error fetching counts:', error)
      }
    }

    fetchCounts()

    // Optionally set up realtime listeners
    const unsubscribeNotif = notificationService.onUnreadChange?.(user.uid, setUnreadNotifications)
    const unsubscribeMsg = messageService.onUnreadChange?.(user.uid, setUnreadMessages)

    return () => {
      if (unsubscribeNotif) unsubscribeNotif()
      if (unsubscribeMsg) unsubscribeMsg()
    }
  }, [user])

  // Role-based menu configuration – "recordings" renamed to "lessons"
  const menuConfig = {
    admin: [
      {
        id: 'dashboard',
        label: t('sidebar.dashboard', 'Dashboard'),
        icon: Home,
        path: '/admin/dashboard',
        description: t('sidebar.dashboard_desc', 'Overview and statistics')
      },
      {
        id: 'users',
        label: t('sidebar.users', 'User Management'),
        icon: Users,
        path: '/admin/users',
        description: t('sidebar.users_desc', 'Manage all users and permissions')
      },
      {
        id: 'courses',
        label: t('sidebar.courses', 'Course Management'),
        icon: BookOpen,
        path: '/admin/courses',
        description: t('sidebar.courses_desc', 'Manage courses and content')
      },
      {
        id: 'lessons',
        label: t('sidebar.lessons', 'Lessons'),
        icon: Video,
        path: '/admin/lessons',
        description: t('sidebar.lessons_desc', 'Manage lesson videos')
      },
      {
        id: 'sessions',
        label: t('sidebar.sessions', 'Session Management'),
        icon: Video,
        path: '/admin/sessions',
        description: t('sidebar.sessions_desc', 'Google Meet sessions monitoring')
      },
      {
        id: 'analytics',
        label: t('sidebar.analytics', 'Analytics'),
        icon: BarChart3,
        path: '/admin/analytics',
        description: t('sidebar.analytics_desc', 'Platform insights and metrics')
      },
      {
        id: 'reports',
        label: t('sidebar.reports', 'Reports'),
        icon: FileText,
        path: '/admin/reports',
        description: t('sidebar.reports_desc', 'System reports and exports')
      },
    ],
    teacher: [
      {
        id: 'dashboard',
        label: t('sidebar.dashboard', 'Dashboard'),
        icon: Home,
        path: '/teacher/dashboard',
        description: t('sidebar.dashboard_desc', 'Teaching overview and insights')
      },
      {
        id: 'lessons',
        label: t('sidebar.lessons', 'My Lessons'),
        icon: Video,
        path: '/teacher/lessons',
        description: t('sidebar.lessons_desc', 'Manage your lesson videos')
      },
      {
        id: 'sessions',
        label: t('sidebar.sessions', 'My Sessions'),
        icon: Calendar,
        path: '/teacher/sessions',
        description: t('sidebar.sessions_desc', 'Schedule and manage sessions')
      },
      {
        id: 'students',
        label: t('sidebar.students', 'Students'),
        icon: Users,
        path: '/teacher/students',
        description: t('sidebar.students_desc', 'Manage your students')
      },
      {
        id: 'my-courses',
        label: t('sidebar.my_courses', 'My Courses'),
        icon: BookOpen,
        path: '/teacher/my-courses',
        description: t('sidebar.my_courses_desc', 'Your teaching courses')
      },
      {
        id: 'analytics',
        label: t('sidebar.analytics', 'Analytics'),
        icon: BarChart3,
        path: '/teacher/analytics',
        description: t('sidebar.analytics_desc', 'Teaching performance insights')
      },
      {
        id: 'messages',
        label: t('sidebar.messages', 'Messages'),
        icon: MessageSquare,
        path: '/teacher/messages',
        description: t('sidebar.messages_desc', 'Communicate with students')
      },
    ],
    student: [
      {
        id: 'dashboard',
        label: t('sidebar.dashboard', 'Dashboard'),
        icon: Home,
        path: '/student/dashboard',
        description: t('sidebar.dashboard_desc', 'Learning overview and progress')
      },
      {
        id: 'sessions',
        label: t('sidebar.sessions', 'Learning Sessions'),
        icon: Calendar,
        path: '/student/sessions',
        description: t('sidebar.sessions_desc', 'Join live sessions and classes')
      },
      {
        id: 'lessons',
        label: t('sidebar.lessons', 'Lessons'),
        icon: Video,
        path: '/student/lessons',
        description: t('sidebar.lessons_desc', 'Watch recorded lessons')
      },
      {
        id: 'courses',
        label: t('sidebar.courses', 'Browse Courses'),
        icon: BookOpen,
        path: '/student/courses',
        description: t('sidebar.courses_desc', 'Discover and enroll in courses')
      },
      {
        id: 'my-courses',
        label: t('sidebar.my_courses', 'My Courses'),
        icon: BookOpen,
        path: '/student/my-courses',
        description: t('sidebar.my_courses_desc', 'Your enrolled courses')
      },
      {
        id: 'progress',
        label: t('sidebar.progress', 'Progress'),
        icon: TrendingUp,
        path: '/student/progress',
        description: t('sidebar.progress_desc', 'Track your learning progress')
      },
      {
        id: 'teachers',
        label: t('sidebar.teachers', 'Teachers'),
        icon: Users,
        path: '/student/teachers',
        description: t('sidebar.teachers_desc', 'View available teachers')
      },
    ]
  }

  // Common routes for all roles
  const commonRoutes = [
    {
      id: 'notifications',
      label: t('sidebar.notifications', 'Notifications'),
      icon: Bell,
      path: '/notifications',
      description: t('sidebar.notifications_desc', 'View your notifications')
    },
    {
      id: 'messages',
      label: t('sidebar.messages', 'Messages'),
      icon: MessageCircle,
      path: '/messages',
      description: t('sidebar.messages_desc', 'Check your messages')
    },
    {
      id: 'profile',
      label: t('sidebar.profile', 'Profile'),
      icon: User,
      path: '/profile',
      description: t('sidebar.profile_desc', 'Manage your profile settings')
    },
    {
      id: 'subscription',
      label: t('sidebar.subscription', 'Subscription'),
      icon: CreditCard,
      path: '/subscription',
      description: t('sidebar.subscription_desc', 'Manage your subscription')
    },
    {
      id: 'help',
      label: t('sidebar.help', 'Help & Support'),
      icon: HelpCircle,
      path: '/help',
      description: t('sidebar.help_desc', 'Get help and support')
    },
  ]

  const getMenuItems = () => menuConfig[userRole] || []
  const menuItems = getMenuItems()

  const handleNavigation = (path) => {
    navigate(path)
    onClose?.()
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  const getRoleIcon = () => {
    switch (userRole) {
      case 'admin': return Shield
      case 'teacher': return UserCheck
      case 'student': return GraduationCap
      default: return User
    }
  }

  // Role colors (same as original)
  const getRoleColors = () => {
    switch (userRole) {
      case 'admin':
        return {
          gradient: 'from-purple-500 to-violet-600',
          bgGradient: 'from-purple-500/15 to-violet-600/15',
          text: 'text-purple-700 dark:text-purple-300',
          bg: 'bg-purple-100/80 dark:bg-purple-900/40',
          border: 'border-purple-200/50 dark:border-purple-700/50'
        }
      case 'teacher':
        return {
          gradient: 'from-blue-500 to-cyan-600',
          bgGradient: 'from-blue-500/15 to-cyan-600/15',
          text: 'text-blue-700 dark:text-blue-300',
          bg: 'bg-blue-100/80 dark:bg-blue-900/40',
          border: 'border-blue-200/50 dark:border-blue-700/50'
        }
      case 'student':
        return {
          gradient: 'from-green-500 to-emerald-600',
          bgGradient: 'from-green-500/15 to-emerald-600/15',
          text: 'text-green-700 dark:text-green-300',
          bg: 'bg-green-100/80 dark:bg-green-900/40',
          border: 'border-green-200/50 dark:border-green-700/50'
        }
      default:
        return {
          gradient: 'from-gray-500 to-gray-600',
          bgGradient: 'from-gray-500/15 to-gray-600/15',
          text: 'text-gray-700 dark:text-gray-300',
          bg: 'bg-gray-100/80 dark:bg-gray-900/40',
          border: 'border-gray-200/50 dark:border-gray-700/50'
        }
    }
  }

  const RoleIcon = getRoleIcon()
  const roleColors = getRoleColors()

  // Get user initials for avatar
  const getUserInitials = () => {
    if (user?.displayName) {
      return user.displayName.charAt(0).toUpperCase()
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase()
    }
    return 'U'
  }

  // Get user display name
  const getUserDisplayName = () => {
    return user?.displayName || user?.email || 'User'
  }

  return (
    <div className={`
      fixed inset-y-0 left-0 z-50 w-80 
      bg-white/85 dark:bg-gray-900/85 backdrop-blur-2xl
      border-r border-white/40 dark:border-gray-700/40
      shadow-2xl shadow-black/10 dark:shadow-black/30
      transform transition-transform duration-300 ease-in-out
      lg:translate-x-0 lg:static lg:inset-0
      ${isRTL ? 'right-0 left-auto' : ''}
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      flex flex-col h-screen
    `}>

      {/* Static Header with Logo */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between h-20 px-6 border-b border-white/30 dark:border-gray-700/30">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            {/* Logo image – small vertical rectangle */}
            <img
              src="/logo.jpeg"
              alt="Zolain"
              className="h-10 w-auto object-contain rounded-sm"
            />
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Zolain
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">{userRole} Portal</p>
            </div>
          </div>

          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-xl bg-white/50 dark:bg-gray-800/50 hover:bg-white/70 dark:hover:bg-gray-700/70 transition-colors duration-200 backdrop-blur-sm"
            aria-label="Close sidebar"
          >
            <X size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* User Profile Section */}
        <div className="p-6 border-b border-white/30 dark:border-gray-700/30">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="relative">
              <div className={`w-14 h-14 bg-gradient-to-br ${roleColors.gradient} rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-xl backdrop-blur-sm`}>
                {getUserInitials()}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br ${roleColors.gradient} rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900 shadow-sm backdrop-blur-sm`}>
                <RoleIcon size={12} className="text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate text-base">
                {getUserDisplayName()}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {user?.email || 'user@example.com'}
              </p>
              <div className="flex items-center space-x-1 mt-1">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize backdrop-blur-sm ${roleColors.bg} ${roleColors.text} border ${roleColors.border}`}>
                  {userRole}
                </span>
                {userProfile?.subscription?.plan === 'premium' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-sm backdrop-blur-sm">
                    <Crown className="h-3 w-3 mr-1" />
                    Premium
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Navigation Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <nav className="px-4 py-6 space-y-2">
            <p className="px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2 backdrop-blur-sm">
              Main Menu
            </p>
            {menuItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  className={`group relative flex items-center w-full px-4 py-4 text-left rtl:text-right rounded-2xl transition-all duration-300 backdrop-blur-sm ${
                    active
                      ? `${roleColors.bg} ${roleColors.text} border ${roleColors.border} shadow-lg`
                      : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-800/50 hover:shadow-md border border-transparent'
                  }`}
                >
                  {/* Active indicator */}
                  {active && (
                    <div className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b ${roleColors.gradient} rounded-r-full shadow-sm`}></div>
                  )}

                  <div className={`p-2 rounded-xl transition-all duration-300 backdrop-blur-sm ${
                    active
                      ? `bg-gradient-to-br ${roleColors.gradient} shadow-lg`
                      : 'bg-white/50 dark:bg-gray-800/50 group-hover:bg-white/70 dark:group-hover:bg-gray-700/50'
                  }`}>
                    <Icon
                      size={20}
                      className={
                        active
                          ? 'text-white'
                          : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200'
                      }
                    />
                  </div>

                  <div className={`${isRTL ? 'mr-3' : 'ml-3'} flex-1 min-w-0`}>
                    <span className="font-medium block text-sm truncate">{item.label}</span>
                    <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-gray-600 dark:text-gray-400 truncate">
                      {item.description}
                    </span>
                  </div>
                </button>
              )
            })}
          </nav>

          {/* Common Routes Section */}
          <div className="px-4 py-6 border-t border-white/30 dark:border-gray-700/30">
            <p className="px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2 backdrop-blur-sm">
              General
            </p>
            <div className="space-y-2">
              {commonRoutes.map((item) => {
                const Icon = item.icon
                const active = isActive(item.path)

                // Determine badge count from real data
                let badgeCount = null
                if (item.id === 'notifications') badgeCount = unreadNotifications
                if (item.id === 'messages') badgeCount = unreadMessages

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.path)}
                    className={`group relative flex items-center w-full px-4 py-3 text-left rtl:text-right rounded-xl transition-all duration-300 backdrop-blur-sm ${
                      active
                        ? `${roleColors.bg} ${roleColors.text} border ${roleColors.border} shadow-md`
                        : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-800/50 border border-transparent'
                    }`}
                  >
                    <Icon
                      size={18}
                      className={
                        active
                          ? roleColors.text
                          : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200'
                      }
                    />

                    <span className={`${isRTL ? 'mr-3' : 'ml-3'} font-medium text-sm flex-1 text-left`}>
                      {item.label}
                    </span>

                    {/* Real‑time notification badges */}
                    {badgeCount > 0 && (
                      <span className="px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full min-w-[20px] text-center backdrop-blur-sm shadow-sm">
                        {badgeCount > 9 ? '9+' : badgeCount}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Static Footer */}
      <div className="flex-shrink-0">
        <div className="p-4 space-y-2 border-t border-white/30 dark:border-gray-700/30 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="flex items-center w-full px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-xl transition-all duration-300 hover:bg-white/50 dark:hover:bg-gray-700/50 group backdrop-blur-sm"
          >
            {darkMode ? (
              <Sun size={18} className={`${isRTL ? 'ml-3' : 'mr-3'} group-hover:text-yellow-500 transition-colors`} />
            ) : (
              <Moon size={18} className={`${isRTL ? 'ml-3' : 'mr-3'} group-hover:text-blue-500 transition-colors`} />
            )}
            <span className="font-medium text-sm flex-1 text-left">
              {darkMode ? t('sidebar.lightMode', 'Light Mode') : t('sidebar.darkMode', 'Dark Mode')}
            </span>
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 rounded-xl transition-all duration-300 hover:bg-red-50/50 dark:hover:bg-red-900/20 group backdrop-blur-sm"
          >
            <LogOut size={18} className={`${isRTL ? 'ml-3' : 'mr-3'} group-hover:scale-105 transition-transform`} />
            <span className="font-medium text-sm flex-1 text-left">{t('sidebar.logout', 'Logout')}</span>
          </button>

          {/* Version Info */}
          <div className="pt-2 border-t border-white/30 dark:border-gray-700/30">
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-xs text-gray-600 dark:text-gray-400">v2.0.0</span>
              <div className="flex items-center space-x-1 text-xs text-green-600 dark:text-green-400">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar