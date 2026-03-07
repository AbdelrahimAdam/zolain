// pages/admin/Analytics.js
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../hooks/useAuth'
import { userService, courseService, sessionService, recordingService } from '../../services'
import Button from '../../components/UI/Button.jsx'
import LoadingSpinner from '../../components/UI/LoadingSpinner.jsx'
import {
  Users,
  BookOpen,
  Video,
  TrendingUp,
  Download,
  Calendar,
  BarChart3,
  Eye,
  Clock,
  DollarSign,
  UserPlus,
  Bookmark
} from 'lucide-react'

const Analytics = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalSessions: 0,
    totalRecordings: 0,
    newUsers: 0,
    activeSessions: 0,
    completedSessions: 0,
    totalWatchTime: 0,
    storageUsed: 0,
    userGrowth: 0,
    sessionGrowth: 0,
    userDistribution: { students: 0, teachers: 0, admins: 0 }
  })
  const [timeRange, setTimeRange] = useState('30days')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user) {
      loadAnalytics()
    }
  }, [timeRange, user])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)

      const role = user?.role // 'admin', 'teacher', or 'student'
      const userId = user?.uid

      let users = []
      let courses = []
      let sessions = []
      let recordings = []

      if (role === 'admin') {
        users = await userService.getAllUsers({ limit: 1000 }) || []
        courses = await courseService.getAllCourses() || []
        sessions = await sessionService.getAllSessions() || []
        recordings = await recordingService.getAllVideos() || []
      } else if (role === 'teacher') {
        users = await userService.getAllUsers({ role: 'student', status: 'active' }) || []
        courses = await courseService.getCoursesByInstructor?.(userId) || []
        sessions = await sessionService.getInstructorSessions?.(userId) || []
        recordings = await recordingService.getTeacherVideos?.(userId) || []
      } else if (role === 'student') {
        users = user ? [user] : []
        courses = await courseService.getEnrolledCourses?.(userId) || []
        sessions = await sessionService.getSessionsForStudent?.(userId) || []
        recordings = await recordingService.getStudentVideos?.(userId) || []
      }

      const now = new Date()
      const timeRangeMs = {
        '7days': 7 * 24 * 60 * 60 * 1000,
        '30days': 30 * 24 * 60 * 60 * 1000,
        '90days': 90 * 24 * 60 * 60 * 1000
      }[timeRange]

      const recentUsers = users.filter(u => u.createdAt && (now - new Date(u.createdAt)) < timeRangeMs)
      const recentSessions = sessions.filter(s => s.createdAt && (now - new Date(s.createdAt)) < timeRangeMs)

      const totalWatchTime = recordings.reduce((sum, r) => sum + (r.duration || 0), 0)
      const storageUsed = recordings.reduce((sum, r) => sum + (r.fileSize || 0), 0)

      let userDistribution = { students: 0, teachers: 0, admins: 0 }
      if (role === 'admin') {
        userDistribution = {
          students: users.filter(u => u.role === 'student').length,
          teachers: users.filter(u => u.role === 'teacher').length,
          admins: users.filter(u => u.role === 'admin').length
        }
      } else if (role === 'teacher') {
        userDistribution = { students: users.length, teachers: 1, admins: 0 }
      } else if (role === 'student') {
        userDistribution = { students: 1, teachers: 0, admins: 0 }
      }

      setAnalytics({
        totalUsers: users.length,
        totalCourses: courses.length,
        totalSessions: sessions.length,
        totalRecordings: recordings.length,
        newUsers: recentUsers.length,
        activeSessions: sessions.filter(s => s.status === 'live').length,
        completedSessions: sessions.filter(s => s.status === 'completed').length,
        totalWatchTime,
        storageUsed,
        userGrowth: recentUsers.length,
        sessionGrowth: recentSessions.length,
        userDistribution
      })
    } catch (error) {
      console.error('Error loading analytics:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num) => {
    if (num === undefined || num === null) return '0'
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B'
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00'
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${mins}m`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50/80 dark:bg-red-900/30 border border-red-200/50 dark:border-red-800/50 rounded-2xl p-4 text-red-700 dark:text-red-300">
        Failed to load analytics: {error}
      </div>
    )
  }

  const isAdmin = user?.role === 'admin'
  const isTeacher = user?.role === 'teacher'
  const isStudent = user?.role === 'student'

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            {isAdmin && 'Platform Analytics'}
            {isTeacher && 'My Teaching Analytics'}
            {isStudent && 'My Learning Analytics'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isAdmin && 'Detailed insights and platform metrics'}
            {isTeacher && 'Track your teaching performance and student engagement'}
            {isStudent && 'Monitor your learning progress and activity'}
          </p>
        </div>
        <div className="flex space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-3 rounded-xl border border-blue-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-500"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
          </select>
          {isAdmin && (
            <Button variant="outline" className="border-blue-200 dark:border-gray-600">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          )}
        </div>
      </div>

      {/* Key Metrics - two columns on mobile */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-4">
        <MetricCard
          label={isAdmin ? 'Total Users' : isTeacher ? 'My Students' : 'My Courses'}
          value={
            isAdmin ? formatNumber(analytics.totalUsers) :
            isTeacher ? formatNumber(analytics.totalUsers) :
            formatNumber(analytics.totalCourses)
          }
          subtext={(isAdmin || isTeacher) && `+${analytics.userGrowth} new`}
          icon={Users}
          color="from-blue-500 to-cyan-500"
        />
        <MetricCard
          label={isAdmin ? 'Total Courses' : isTeacher ? 'My Courses' : 'Sessions Attended'}
          value={
            isAdmin ? formatNumber(analytics.totalCourses) :
            isTeacher ? formatNumber(analytics.totalCourses) :
            formatNumber(analytics.totalSessions)
          }
          subtext={isAdmin ? 'Active learning' : null}
          icon={BookOpen}
          color="from-purple-500 to-pink-500"
        />
        <MetricCard
          label={isAdmin ? 'Total Sessions' : isTeacher ? 'My Sessions' : 'My Recordings'}
          value={
            isAdmin ? formatNumber(analytics.totalSessions) :
            isTeacher ? formatNumber(analytics.totalSessions) :
            formatNumber(analytics.totalRecordings)
          }
          subtext={(isAdmin || isTeacher) && `${analytics.activeSessions} live`}
          icon={Video}
          color="from-green-500 to-emerald-500"
        />
        <MetricCard
          label={isAdmin ? 'Storage Used' : isTeacher ? 'Storage Used' : 'Watch Time'}
          value={
            isAdmin ? formatFileSize(analytics.storageUsed * 1024 * 1024) :
            isTeacher ? formatFileSize(analytics.storageUsed * 1024 * 1024) :
            formatDuration(analytics.totalWatchTime)
          }
          subtext={isAdmin ? 'Recordings & files' : isTeacher ? 'Your recordings' : 'Total time'}
          icon={BarChart3}
          color="from-orange-500 to-red-500"
        />
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User / Role Distribution */}
        {(isAdmin || isTeacher) && (
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl border border-blue-100/50 dark:border-gray-700/50 p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {isAdmin ? 'User Distribution' : 'Student Distribution'}
            </h3>
            <div className="space-y-4">
              {isAdmin && (
                <>
                  <DistroRow label="Students" value={analytics.userDistribution?.students || 0} color="green" />
                  <DistroRow label="Teachers" value={analytics.userDistribution?.teachers || 0} color="blue" />
                  <DistroRow label="Admins" value={analytics.userDistribution?.admins || 0} color="purple" />
                </>
              )}
              {isTeacher && (
                <DistroRow label="Active Students" value={analytics.totalUsers} color="green" />
              )}
            </div>
          </div>
        )}

        {/* Session / Activity Analytics */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl border border-blue-100/50 dark:border-gray-700/50 p-6 shadow-2xl">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {isAdmin ? 'Session Analytics' : isTeacher ? 'Session Performance' : 'My Activity'}
          </h3>
          <div className="space-y-4">
            <MetricRow icon={Clock} label="Total Watch Time" value={formatDuration(analytics.totalWatchTime)} />
            <MetricRow icon={Video} label={isAdmin ? 'Completed Sessions' : isTeacher ? 'Completed Sessions' : 'Sessions Attended'} value={analytics.completedSessions} />
            <MetricRow icon={Eye} label={isAdmin ? 'Total Recordings' : isTeacher ? 'My Recordings' : 'My Recordings'} value={analytics.totalRecordings} />
          </div>
        </div>
      </div>

      {/* Growth Metrics */}
      {(isAdmin || isTeacher) && (
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl border border-blue-100/50 dark:border-gray-700/50 p-6 shadow-2xl">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Growth Metrics ({timeRange.replace('days', ' days')})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <GrowthCard
              icon={UserPlus}
              value={`+${analytics.userGrowth}`}
              label={isAdmin ? 'New Users' : 'New Students'}
              color="green"
            />
            <GrowthCard
              icon={TrendingUp}
              value={`+${analytics.sessionGrowth}`}
              label="New Sessions"
              color="blue"
            />
            <GrowthCard
              icon={Bookmark}
              value={`${Math.round((analytics.completedSessions / Math.max(analytics.totalSessions, 1)) * 100)}%`}
              label="Completion Rate"
              color="purple"
            />
          </div>
        </div>
      )}
    </div>
  )
}

// Helper components for consistent styling
const MetricCard = ({ label, value, subtext, icon: Icon, color }) => (
  <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl border border-blue-100/50 dark:border-gray-700/50 p-4 sm:p-6 shadow-lg hover:shadow-xl transition group">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
        <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
        {subtext && <p className="text-xs text-green-600 dark:text-green-400 mt-1">{subtext}</p>}
      </div>
      <div className={`p-2 sm:p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg`}>
        <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
      </div>
    </div>
  </div>
)

const DistroRow = ({ label, value, color }) => {
  const colorMap = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500'
  }
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className={`w-3 h-3 ${colorMap[color]} rounded-full`} />
        <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      </div>
      <span className="text-sm font-semibold text-gray-900 dark:text-white">{value}</span>
    </div>
  )
}

const MetricRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center space-x-3">
      <Icon className="h-4 w-4 text-blue-500" />
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
    </div>
    <span className="text-sm font-semibold text-gray-900 dark:text-white">{value}</span>
  </div>
)

const GrowthCard = ({ icon: Icon, value, label, color }) => {
  const colorMap = {
    green: 'from-green-500 to-emerald-500',
    blue: 'from-blue-500 to-cyan-500',
    purple: 'from-purple-500 to-pink-500'
  }
  return (
    <div className="text-center">
      <div className={`w-16 h-16 bg-gradient-to-br ${colorMap[color]} rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg`}>
        <Icon className="h-8 w-8 text-white" />
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
    </div>
  )
}

export default Analytics