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
    // Default values to avoid undefined
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
        // Admin: fetch all data
        users = await userService.getAllUsers({ limit: 1000 }) || []
        courses = await courseService.getAllCourses() || []
        sessions = await sessionService.getAllSessions() || []
        recordings = await recordingService.getAllRecordings() || []
      } else if (role === 'teacher') {
        // Teacher: fetch only teacher‑specific data
        // Students: only active students (as allowed by security rules)
        users = await userService.getAllUsers({ role: 'student', status: 'active' }) || []
        // Courses taught by this teacher (assuming course has teacherId field)
        courses = await courseService.getCoursesByTeacher?.(userId) || []
        // Sessions created by this teacher
        sessions = await sessionService.getSessionsByTeacher?.(userId) || []
        // Recordings owned by this teacher (or linked to their sessions)
        recordings = await recordingService.getRecordingsByUser?.(userId) || []
      } else if (role === 'student') {
        // Student: fetch personal data
        // For a student, we might need different services:
        // - Their own profile (already in user)
        // - Enrolled courses (if enrollment service exists)
        // - Attended sessions (maybe from session attendance)
        // - Their own recordings (if they create them)
        // For now, we'll use available services with filters where possible.
        // If you have enrollmentService, use it; otherwise we may need to add it.
        // Example:
        // users = [user] (just themselves)
        // courses = await enrollmentService.getStudentCourses?.(userId) || []
        // sessions = await sessionService.getSessionsByStudent?.(userId) || []
        // recordings = await recordingService.getRecordingsByUser?.(userId) || []
        // For simplicity, we'll just set users to an array containing the current user
        users = user ? [user] : []
        // The rest will be fetched if services exist; otherwise they remain []
        courses = await courseService.getCoursesByStudent?.(userId) || []
        sessions = await sessionService.getSessionsByStudent?.(userId) || []
        recordings = await recordingService.getRecordingsByUser?.(userId) || []
      }

      // Time range filter
      const now = new Date()
      const timeRangeMs = {
        '7days': 7 * 24 * 60 * 60 * 1000,
        '30days': 30 * 24 * 60 * 60 * 1000,
        '90days': 90 * 24 * 60 * 60 * 1000
      }[timeRange]

      // Filter recent items (if they have createdAt)
      const recentUsers = users.filter(u => u.createdAt && (now - new Date(u.createdAt)) < timeRangeMs)
      const recentSessions = sessions.filter(s => s.createdAt && (now - new Date(s.createdAt)) < timeRangeMs)

      // Calculate totals
      const totalWatchTime = recordings.reduce((sum, r) => sum + (r.duration || 0), 0)
      const storageUsed = recordings.reduce((sum, r) => sum + (r.fileSize || 0), 0)

      // Role‑specific distributions
      let userDistribution = { students: 0, teachers: 0, admins: 0 }
      if (role === 'admin') {
        userDistribution = {
          students: users.filter(u => u.role === 'student').length,
          teachers: users.filter(u => u.role === 'teacher').length,
          admins: users.filter(u => u.role === 'admin').length
        }
      } else if (role === 'teacher') {
        // For teacher, all users fetched are students, so distribution is just students
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
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-700 dark:text-red-300">
        Failed to load analytics: {error}
      </div>
    )
  }

  // Determine which metrics to show based on role
  const isAdmin = user?.role === 'admin'
  const isTeacher = user?.role === 'teacher'
  const isStudent = user?.role === 'student'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
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
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
          </select>
          {isAdmin && (
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          )}
        </div>
      </div>

      {/* Key Metrics - adapt cards per role */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users / Students */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {isAdmin ? 'Total Users' : isTeacher ? 'My Students' : 'My Courses'}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {isAdmin && formatNumber(analytics.totalUsers)}
                {isTeacher && formatNumber(analytics.totalUsers)}
                {isStudent && formatNumber(analytics.totalCourses)}
              </p>
              {(isAdmin || isTeacher) && (
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  +{analytics.userGrowth} new
                </p>
              )}
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* Total Courses / Sessions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {isAdmin ? 'Total Courses' : isTeacher ? 'My Courses' : 'Sessions Attended'}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {isAdmin && formatNumber(analytics.totalCourses)}
                {isTeacher && formatNumber(analytics.totalCourses)}
                {isStudent && formatNumber(analytics.totalSessions)}
              </p>
              {isAdmin && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Active learning</p>
              )}
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <BookOpen className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        {/* Total Sessions / Recordings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {isAdmin ? 'Total Sessions' : isTeacher ? 'My Sessions' : 'My Recordings'}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {isAdmin && formatNumber(analytics.totalSessions)}
                {isTeacher && formatNumber(analytics.totalSessions)}
                {isStudent && formatNumber(analytics.totalRecordings)}
              </p>
              {(isAdmin || isTeacher) && (
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  {analytics.activeSessions} live
                </p>
              )}
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Video className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Storage Used / Watch Time */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {isAdmin ? 'Storage Used' : isTeacher ? 'Storage Used' : 'Watch Time'}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {isAdmin && formatFileSize(analytics.storageUsed * 1024 * 1024)}
                {isTeacher && formatFileSize(analytics.storageUsed * 1024 * 1024)}
                {isStudent && formatDuration(analytics.totalWatchTime)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {isAdmin ? 'Recordings & files' : isTeacher ? 'Your recordings' : 'Total time'}
              </p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <BarChart3 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analytics - show relevant sections per role */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User / Role Distribution */}
        {(isAdmin || isTeacher) && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {isAdmin ? 'User Distribution' : 'Student Distribution'}
            </h3>
            <div className="space-y-4">
              {isAdmin && (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Students</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {analytics.userDistribution?.students || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Teachers</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {analytics.userDistribution?.teachers || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Admins</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {analytics.userDistribution?.admins || 0}
                    </span>
                  </div>
                </>
              )}
              {isTeacher && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Active Students</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {analytics.totalUsers}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Session / Activity Analytics */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {isAdmin ? 'Session Analytics' : isTeacher ? 'Session Performance' : 'My Activity'}
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {isStudent ? 'Total Watch Time' : 'Total Watch Time'}
                </span>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {formatDuration(analytics.totalWatchTime)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Video className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {isAdmin ? 'Completed Sessions' : isTeacher ? 'Completed Sessions' : 'Sessions Attended'}
                </span>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {analytics.completedSessions}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Eye className="h-4 w-4 text-purple-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {isAdmin ? 'Total Recordings' : isTeacher ? 'My Recordings' : 'My Recordings'}
                </span>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {analytics.totalRecordings}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Growth Metrics - show only for admin/teacher */}
      {(isAdmin || isTeacher) && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Growth Metrics ({timeRange.replace('days', ' days')})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <UserPlus className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                +{analytics.userGrowth}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isAdmin ? 'New Users' : 'New Students'}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                +{analytics.sessionGrowth}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isAdmin ? 'New Sessions' : 'New Sessions'}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <Bookmark className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round((analytics.completedSessions / Math.max(analytics.totalSessions, 1)) * 100)}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Analytics