// pages/teacher/TeacherDashboard.js
import React, { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { recordingService } from '../../services/recordingService.jsx'
import { sessionService } from '../../services/sessionService.jsx'
import {
  Plus,
  Video,
  Users,
  BarChart3,
  Clock,
  TrendingUp,
  RefreshCw,
  Calendar,
  BookOpen,
  AlertCircle
} from 'lucide-react'
import Button from '../../components/UI/Button.jsx'
import LoadingSpinner from '../../components/UI/LoadingSpinner.jsx'

const TeacherDashboard = () => {
  const { t } = useTranslation()
  const { user, userProfile } = useAuth()
  const navigate = useNavigate()
  
  const [stats, setStats] = useState({
    totalRecordings: 0,
    published: 0,
    inProgress: 0,
    totalViews: 0,
    upcomingSessions: 0,
    liveSessions: 0
  })
  const [recentSessions, setRecentSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const teacherId = user?.uid

  useEffect(() => {
    if (teacherId) {
      loadDashboardData()
    }
  }, [teacherId])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Use teacher-specific service methods
      const [recordings, sessions] = await Promise.all([
        recordingService.getTeacherVideos(teacherId),
        sessionService.getAllSessions({ instructorId: teacherId, limit: 5 })
      ])

      // Calculate stats
      setStats({
        totalRecordings: recordings.length,
        published: recordings.filter(r => r.isPublished).length,
        inProgress: recordings.filter(r => 
          r.status === 'recording' || r.status === 'processing'
        ).length,
        totalViews: recordings.reduce((sum, r) => sum + (r.views || 0), 0),
        upcomingSessions: sessions.filter(s => s.status === 'scheduled').length,
        liveSessions: sessions.filter(s => s.status === 'live').length
      })

      setRecentSessions(sessions)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setError('Failed to load dashboard data. Please try refreshing.')
    } finally {
      setLoading(false)
    }
  }

  const statCards = useMemo(() => [
    {
      name: t('teacher.stats.totalRecordings', 'Total Recordings'),
      value: stats.totalRecordings.toString(),
      icon: Video,
      change: `${stats.published} published`,
      changeType: 'positive',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-500 to-cyan-500',
      description: 'Your uploaded lessons'
    },
    {
      name: t('teacher.stats.published', 'Published'),
      value: stats.published.toString(),
      icon: Users,
      change: `${Math.round((stats.published / Math.max(stats.totalRecordings, 1)) * 100)}% of total`,
      changeType: 'positive',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-500 to-emerald-500',
      description: 'Published videos'
    },
    {
      name: t('teacher.stats.totalViews', 'Total Views'),
      value: stats.totalViews.toString(),
      icon: BarChart3,
      change: 'All time',
      changeType: 'neutral',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-500 to-pink-500',
      description: 'Video views'
    },
    {
      name: t('teacher.stats.inProgress', 'In Progress'), // fallback if missing
      value: stats.inProgress.toString(),
      icon: Clock,
      change: `${stats.upcomingSessions} upcoming sessions`,
      changeType: stats.inProgress > 0 ? 'warning' : 'neutral',
      color: 'from-orange-500 to-red-500',
      bgColor: 'from-orange-500 to-red-500',
      description: 'Recordings in progress'
    }
  ], [stats, t])

  const quickActions = useMemo(() => [
    {
      title: t('recording.createNew', 'Create Recording'),
      description: 'Start a new recording session',
      icon: Plus,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-500/10 dark:bg-blue-500/20',
      action: () => navigate('/teacher/recordings/create')
    },
    {
      title: t('teacher.actions.manageStudents', 'Manage Students'),
      description: 'View and manage your students',
      icon: Users,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-500/10 dark:bg-green-500/20',
      action: () => navigate('/teacher/students')
    },
    {
      title: t('teacher.actions.viewAnalytics', 'View Analytics'),
      description: 'Detailed performance insights',
      icon: BarChart3,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-500/10 dark:bg-purple-500/20',
      action: () => navigate('/teacher/analytics')
    }
  ], [t, navigate])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading dashboard...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">Error</h3>
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <Button onClick={loadDashboardData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            {t('teacher.dashboard.title', 'Teacher Dashboard')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
            Welcome back, {userProfile?.displayName || 'Teacher'}
          </p>
        </div>
        <Button
          onClick={loadDashboardData}
          variant="outline"
          className="border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Grid - Two columns on mobile */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.name}
              className="group relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-blue-100/50 dark:border-gray-700/50 p-6 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${stat.bgColor}/10 rounded-3xl`} />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg shadow-blue-500/25`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  {stat.changeType === 'positive' && (
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  )}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {stat.value}
                </h3>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {stat.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {stat.change}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions - takes 2 columns on large screens */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-blue-100/50 dark:border-gray-700/50 p-6 shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon
                return (
                  <button
                    key={action.title}
                    onClick={action.action}
                    className="w-full flex items-start p-4 rounded-2xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-blue-100/50 dark:border-gray-600/50 hover:bg-white dark:hover:bg-gray-600 hover:scale-105 transition-all duration-300 group"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <div className={`p-3 rounded-xl ${action.bgColor} mr-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`h-5 w-5 ${action.color}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-base">
                        {action.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {action.description}
                      </p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Plus className="h-4 w-4 text-blue-400" />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-blue-100/50 dark:border-gray-700/50 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Recent Sessions
            </h3>
            <Calendar className="h-5 w-5 text-blue-500" />
          </div>
          <div className="space-y-3">
            {recentSessions.length > 0 ? (
              recentSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/50 dark:bg-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-600/80 transition-colors duration-200"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {session.topic || session.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {session.scheduledTime ? new Date(session.scheduledTime).toLocaleDateString() : 'No date'}
                    </p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    session.status === 'completed' ? 'bg-green-500' :
                    session.status === 'live' ? 'bg-red-500 animate-pulse' :
                    'bg-blue-500'
                  }`} />
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <BookOpen className="mx-auto h-12 w-12 mb-3 opacity-50" />
                <p>No recent sessions</p>
                <Button
                  onClick={() => navigate('/teacher/sessions/create')}
                  variant="outline"
                  className="mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Session
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeacherDashboard