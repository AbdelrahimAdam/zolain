import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useInfiniteQuery, useQuery } from 'react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import {
  recordingService,
  courseService,
  sessionService,
  userService
} from '../../services'
import LoadingSpinner from '../../components/UI/LoadingSpinner.jsx'
import Button from '../../components/UI/Button.jsx'
import Input from '../../components/UI/Input.jsx'
import {
  BookOpen,
  Video,
  Users,
  Search,
  PlayCircle,
  Clock,
  Eye,
  RefreshCw,
  CheckCircle,
  XCircle,
  Zap,
  Calendar,
  TrendingUp,
  Star,
  AlertCircle,
  ArrowRight,
  Crown,
  User,
  BarChart3,
  Filter
} from 'lucide-react'

const StudentDashboard = () => {
  const { t } = useTranslation()
  const { user, userProfile, loading: authLoading } = useAuth()
  const navigate = useNavigate()
 
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [teacherFilter, setTeacherFilter] = useState('all')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [recentSessions, setRecentSessions] = useState([])
  const [teacherSessions, setTeacherSessions] = useState([])
  const [loadingSessions, setLoadingSessions] = useState(false)
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState({})
  const [showFilters, setShowFilters] = useState(false)

  const studentId = user?.uid
  const isApproved = userProfile?.isActive
  const studentName = userProfile?.displayName || user?.email?.split('@')[0]

  // Enhanced session loading with error handling
  const loadRecentSessions = async () => {
    try {
      setLoadingSessions(true)
      setError(null)
      const sessions = await sessionService.getPublicSessions({
        status: 'scheduled',
        dateRange: 'upcoming',
        limit: 10
      })
      setRecentSessions(sessions)
    } catch (error) {
      console.error('Error loading recent sessions:', error)
      setError(t('student.error.failedToLoadSessions', 'Failed to load upcoming sessions'))
    } finally {
      setLoadingSessions(false)
    }
  }

  const loadTeacherSessions = async () => {
    try {
      setError(null)
      const sessions = await sessionService.getTeacherSessionsForStudents({
        limit: 20,
        daysAhead: 30
      })
      setTeacherSessions(sessions)
    } catch (error) {
      console.error('Error loading teacher sessions:', error)
      setError(t('student.error.failedToLoadTeacherSessions', 'Failed to load teacher sessions'))
    }
  }

  const {
    data: recordingsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: recordingsLoading,
    error: recordingsError,
    refetch: refetchRecordings,
    isRefetching: isRefetchingRecordings
  } = useInfiniteQuery(
    ['studentRecordings', studentId, sortBy, sortOrder],
    ({ pageParam = null }) => recordingService.getAvailableRecordings({
      studentId,
      cursor: pageParam,
      limit: 12,
      sortBy,
      sortOrder
    }),
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
      enabled: !!studentId && isApproved,
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      onError: (error) => {
        console.error('Error fetching recordings:', error)
        setError(t('student.error.failedToLoadContent', 'Failed to load learning content'))
      }
    }
  )

  const {
    data: courses = [],
    isLoading: coursesLoading,
    error: coursesError
  } = useQuery(
    ['studentCourses', studentId],
    () => courseService.getPublishedCourses(20),
    {
      enabled: !!studentId && isApproved,
      staleTime: 10 * 60 * 1000,
      onError: (error) => {
        console.error('Error fetching courses:', error)
        setError(t('student.error.failedToLoadCourses', 'Failed to load courses'))
      }
    }
  )

  const {
    data: teachers = [],
    isLoading: teachersLoading,
    error: teachersError
  } = useQuery(
    ['teachers', studentId],
    () => userService.getTeachersForStudent(studentId),
    {
      enabled: !!studentId && isApproved,
      onError: (error) => {
        console.error('Error fetching teachers:', error)
        setError(t('student.error.failedToLoadTeachers', 'Failed to load teacher information'))
      }
    }
  )

  useEffect(() => {
    if (studentId && isApproved) {
      loadRecentSessions()
      loadTeacherSessions()
    }
  }, [studentId, isApproved])

  const allRecordings = recordingsData?.pages.flatMap(page => page.recordings || []) || []

  const filteredRecordings = useMemo(() => {
    return allRecordings
      .filter(recording => {
        const matchesSearch =
          recording.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          recording.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          recording.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
          recording.instructorName?.toLowerCase().includes(searchTerm.toLowerCase())
       
        const matchesStatus =
          statusFilter === 'all' ||
          recording.status === statusFilter ||
          (statusFilter === 'watched' && recording.watched) ||
          (statusFilter === 'new' && !recording.watched)
        
        const matchesCategory =
          categoryFilter === 'all' ||
          recording.category === categoryFilter
        
        const matchesTeacher =
          teacherFilter === 'all' ||
          recording.instructorId === teacherFilter

        return matchesSearch && matchesStatus && matchesCategory && matchesTeacher
      })
      .sort((a, b) => {
        let aValue = a[sortBy] || 0
        let bValue = b[sortBy] || 0
        if (sortBy === 'createdAt' || sortBy === 'updatedAt' || sortBy === 'scheduledTime') {
          aValue = new Date(aValue).getTime()
          bValue = new Date(bValue).getTime()
        }
        if (sortOrder === 'desc') {
          return bValue - aValue
        }
        return aValue - bValue
      })
  }, [allRecordings, searchTerm, statusFilter, categoryFilter, teacherFilter, sortBy, sortOrder])

  const filteredTeacherSessions = useMemo(() => {
    return teacherSessions
      .filter(session => {
        const matchesTeacher = teacherFilter === 'all' || session.createdBy === teacherFilter
        return matchesTeacher
      })
      .sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime))
  }, [teacherSessions, teacherFilter])

  const stats = useMemo(() => ({
    enrolledClasses: courses.length,
    availableRecordings: allRecordings.filter(r => r.isPublished && r.status === 'completed').length,
    teachers: teachers.length,
    totalWatchTime: allRecordings.reduce((sum, r) => sum + (r.duration || 0), 0),
    completedRecordings: allRecordings.filter(r => r.watched).length,
    upcomingSessions: recentSessions.length,
    teacherUpcomingSessions: filteredTeacherSessions.length,
    googleMeetSessions: allRecordings.filter(r => r.meetLink).length,
    totalProgress: allRecordings.length > 0 
      ? Math.round((allRecordings.filter(r => r.watched).length / allRecordings.length) * 100)
      : 0
  }), [courses, allRecordings, teachers, recentSessions, filteredTeacherSessions])

  const handleRefresh = useCallback(() => {
    refetchRecordings()
    loadRecentSessions()
    loadTeacherSessions()
  }, [refetchRecordings])

  const handleWatchRecording = useCallback((recording) => {
    if (recording.recordingUrl) {
      setActionLoading(prev => ({ ...prev, [recording.id]: true }))
      
      if (recording.recordingUrl.includes('drive.google.com')) {
        window.open(recording.recordingUrl, '_blank')
      } else {
        // For embedded videos, navigate to player page
        navigate(`/recording/${recording.id}`)
      }
      
      setTimeout(() => {
        setActionLoading(prev => ({ ...prev, [recording.id]: false }))
      }, 1000)
    }
  }, [navigate])

  const handleJoinSession = useCallback((session) => {
    if (session.meetLink || session.googleMeetLink) {
      window.open(session.meetLink || session.googleMeetLink, '_blank')
    }
  }, [])

  const formatDuration = useCallback((seconds) => {
    if (!seconds) return '0:00'
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
   
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }, [])

  const formatDateTime = useCallback((date) => {
    if (!date) return 'TBD'
    const dateObj = new Date(date)
    return {
      date: dateObj.toLocaleDateString(),
      time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      full: dateObj.toLocaleString()
    }
  }, [])

  const getStatusColor = useCallback((status) => {
    switch (status) {
      case 'completed': return 'from-green-500 to-emerald-500'
      case 'processing': return 'from-yellow-500 to-orange-500'
      case 'recording': return 'from-blue-500 to-cyan-500'
      case 'failed': return 'from-red-500 to-pink-500'
      default: return 'from-gray-500 to-gray-600'
    }
  }, [])

  const getStatusIcon = useCallback((status) => {
    switch (status) {
      case 'completed': return CheckCircle
      case 'processing': return Clock
      case 'recording': return PlayCircle
      case 'failed': return XCircle
      default: return Video
    }
  }, [])

  const getProgressColor = useCallback((progress) => {
    if (progress >= 90) return 'from-green-500 to-emerald-500'
    if (progress >= 50) return 'from-yellow-500 to-orange-500'
    return 'from-blue-500 to-cyan-500'
  }, [])

  const getTeacherName = useCallback((teacherId) => {
    const teacher = teachers.find(t => t.id === teacherId)
    return teacher?.displayName || teacher?.email?.split('@')[0] || 'Unknown Teacher'
  }, [teachers])

  const statCards = useMemo(() => [
    {
      id: 'enrolled-classes',
      name: t('student.stats.enrolledClasses', 'Enrolled Classes'),
      value: stats.enrolledClasses.toString(),
      icon: BookOpen,
      change: `${courses.filter(c => c.isPublished).length} active`,
      changeType: 'positive',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-500 to-cyan-500',
      description: t('student.stats.enrolledClassesDesc', 'Your learning journey'),
      loading: coursesLoading
    },
    {
      id: 'available-recordings',
      name: t('student.stats.availableRecordings', 'Available Recordings'),
      value: stats.availableRecordings.toString(),
      icon: Video,
      change: `${stats.completedRecordings} watched`,
      changeType: stats.completedRecordings > 0 ? 'positive' : 'neutral',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-500 to-emerald-500',
      description: t('student.stats.availableRecordingsDesc', 'Ready to watch'),
      loading: recordingsLoading
    },
    {
      id: 'teachers',
      name: t('student.stats.teachers', 'Teachers'),
      value: stats.teachers.toString(),
      icon: Users,
      change: `${stats.teacherUpcomingSessions} upcoming`,
      changeType: 'neutral',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-500 to-pink-500',
      description: t('student.stats.teachersDesc', 'Expert instructors'),
      loading: teachersLoading
    },
    {
      id: 'learning-progress',
      name: t('student.stats.learningProgress', 'Learning Progress'),
      value: `${stats.totalProgress}%`,
      icon: TrendingUp,
      change: `${Math.round(stats.totalWatchTime / 3600)} hours watched`,
      changeType: stats.totalProgress > 50 ? 'positive' : 'neutral',
      color: 'from-orange-500 to-red-500',
      bgColor: 'from-orange-500 to-red-500',
      description: t('student.stats.learningProgressDesc', 'Your overall progress'),
      loading: recordingsLoading
    }
  ], [stats, courses, t, coursesLoading, recordingsLoading, teachersLoading])

  const quickActions = useMemo(() => [
    {
      id: 'browse-classes',
      title: t('student.actions.browseClasses', 'Browse Classes'),
      description: t('student.actions.browseClassesDesc', 'Discover new courses to enroll'),
      icon: BookOpen,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-500/10 dark:bg-blue-500/20',
      action: () => navigate('/courses')
    },
    {
      id: 'upcoming-sessions',
      title: t('student.actions.upcomingSessions', 'Upcoming Sessions'),
      description: t('student.actions.upcomingSessionsDesc', 'Join live classes and meetings'),
      icon: Calendar,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-500/10 dark:bg-green-500/20',
      action: () => navigate('/sessions')
    },
    {
      id: 'teacher-sessions',
      title: t('student.actions.teacherSessions', 'Teacher Sessions'),
      description: t('student.actions.teacherSessionsDesc', 'View all instructor sessions'),
      icon: Users,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-500/10 dark:bg-purple-500/20',
      action: () => navigate('/sessions?view=teachers')
    },
    {
      id: 'my-progress',
      title: t('student.actions.myProgress', 'My Progress'),
      description: t('student.actions.myProgressDesc', 'Track your learning journey'),
      icon: BarChart3,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-500/10 dark:bg-orange-500/20',
      action: () => navigate('/progress')
    }
  ], [t, navigate])

  const sortOptions = [
    { value: 'createdAt', label: t('student.sort.dateAdded', 'Date Added') },
    { value: 'title', label: t('student.sort.title', 'Title') },
    { value: 'duration', label: t('student.sort.duration', 'Duration') },
    { value: 'views', label: t('student.sort.popularity', 'Popularity') },
    { value: 'rating', label: t('student.sort.rating', 'Rating') }
  ]

  const categoryOptions = [
    { value: 'all', label: t('student.category.all', 'All Categories') },
    { value: 'lecture', label: t('student.category.lecture', 'Lectures') },
    { value: 'tutorial', label: t('student.category.tutorial', 'Tutorials') },
    { value: 'workshop', label: t('student.category.workshop', 'Workshops') },
    { value: 'qna', label: t('student.category.qna', 'Q&A Sessions') }
  ]

  const teacherOptions = [
    { value: 'all', label: t('student.teacher.all', 'All Teachers') },
    ...teachers.map(teacher => ({
      value: teacher.id,
      label: teacher.displayName || teacher.email?.split('@')[0] || 'Unknown Teacher'
    }))
  ]

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            {t('common.loading', 'Loading your dashboard...')}
          </p>
        </div>
      </div>
    )
  }

  if (!studentId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
        <div className="text-center max-w-md p-8">
          <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('auth.required', 'Authentication Required')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t('auth.pleaseLogin', 'Please log in to access the student dashboard.')}
          </p>
          <Button
            onClick={() => navigate('/login')}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg"
          >
            {t('auth.login', 'Sign in')}
          </Button>
        </div>
      </div>
    )
  }

  if (!isApproved) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
        <div className="text-center max-w-md p-8">
          <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('student.pendingApproval', 'Pending Approval')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t('student.pendingApprovalDescription', 'Your account is awaiting admin approval. You will be notified via email once approved.')}
          </p>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              {t('student.contactAdmin', 'Please contact the administrator if you have been waiting for more than 24 hours.')}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (recordingsError || coursesError || teachersError) {
    const errorMsg = recordingsError || coursesError || teachersError
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
        <div className="text-center max-w-md p-8">
          <AlertCircle className="mx-auto h-16 w-16 text-red-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('error.loadingFailed', 'Failed to load content')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t('error.failedToLoadContent', 'We encountered an error while loading your dashboard content.')}
          </p>
          <div className="space-y-3">
            <Button
              onClick={handleRefresh}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 w-full shadow-lg"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('common.tryAgain', 'Try Again')}
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="w-full"
            >
              {t('common.reloadPage', 'Reload Page')}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 min-h-screen">
      {/* Header */}
      <div className="text-center lg:text-left">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent mb-2 sm:mb-3">
              {t('student.dashboard.title', 'Student Dashboard')}
            </h1>
            <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 max-w-2xl">
              {t('student.dashboard.subtitle', 'Access your classes, recordings, and learning materials')}
            </p>
            {studentName && (
              <div className="flex items-center mt-2 space-x-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('student.welcome', 'Welcome back')}, <span className="font-semibold text-gray-800 dark:text-gray-200">{studentName}</span>
                </p>
                {userProfile?.subscription?.plan === 'premium' && (
                  <span className="px-2 py-1 text-xs bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full flex items-center">
                    <Crown className="h-3 w-3 mr-1" />
                    {t('student.premium', 'Premium Student')}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleRefresh}
              variant="outline"
              disabled={isRefetchingRecordings}
              className="hidden lg:flex items-center"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefetchingRecordings ? 'animate-spin' : ''}`} />
              {t('common.refresh', 'Refresh')}
            </Button>
            <Button
              onClick={() => navigate('/courses')}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              {t('student.actions.browseClasses', 'Browse Classes')}
            </Button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50/80 dark:bg-red-900/30 backdrop-blur-lg border border-red-200/50 dark:border-red-800/50 rounded-2xl p-4 flex items-center animate-fade-in">
          <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
          <p className="text-red-700 dark:text-red-300 text-sm flex-1">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-4 text-red-500 hover:text-red-700 flex-shrink-0"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Stats Grid - Two columns on mobile */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          const animationDelay = { animationDelay: `${index * 100}ms` }
          
          return (
            <div
              key={stat.id}
              className="group relative overflow-hidden rounded-3xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/30 dark:border-gray-700/40 p-4 sm:p-6 shadow-2xl hover:shadow-2xl transition-all duration-500 hover:scale-105"
              style={animationDelay}
            >
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${stat.bgColor}/10 rounded-3xl`} />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className={`p-2 sm:p-3 rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="flex items-center space-x-1">
                    {stat.changeType === 'positive' && (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    )}
                    <div className={`text-xs sm:text-sm font-semibold ${
                      stat.changeType === 'positive' ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {stat.change}
                    </div>
                  </div>
                </div>
                {stat.loading ? (
                  <div className="animate-pulse">
                    <div className="h-7 sm:h-8 bg-gray-300 dark:bg-gray-600 rounded mb-2" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                ) : (
                  <>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
                      {stat.value}
                    </h3>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
                      {stat.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {stat.description}
                    </p>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 sm:gap-8">
        {/* Quick Actions & Sessions */}
        <div className="xl:col-span-1 space-y-6">
          {/* Quick Actions */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl border border-white/30 dark:border-gray-700/40 p-4 sm:p-6 shadow-2xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {t('student.actions.quickActions', 'Quick Actions')}
              </h3>
              <Zap className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="space-y-3 sm:space-y-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon
                const animationDelay = { animationDelay: `${index * 150}ms` }
                
                return (
                  <button
                    key={action.id}
                    onClick={action.action}
                    className="w-full flex items-center p-3 sm:p-4 rounded-2xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-lg border border-white/40 dark:border-gray-600/40 hover:bg-white/80 dark:hover:bg-gray-600/80 hover:scale-105 transition-all duration-300 group"
                    style={animationDelay}
                  >
                    <div className={`p-2 rounded-xl ${action.bgColor} mr-3 sm:mr-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${action.color}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                        {action.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                        {action.description}
                      </p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Teacher Sessions */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl border border-white/30 dark:border-gray-700/40 p-4 sm:p-6 shadow-2xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {t('student.teacherSessions.title', 'Teacher Sessions')}
              </h3>
              <Users className="h-5 w-5 text-purple-500" />
            </div>
            <div className="space-y-3">
              {filteredTeacherSessions.length > 0 ? (
                filteredTeacherSessions.slice(0, 5).map((session, index) => {
                  const dateTime = formatDateTime(session.scheduledTime)
                  const teacherName = getTeacherName(session.createdBy)
                  const animationDelay = { animationDelay: `${index * 100}ms` }
                  
                  return (
                    <div
                      key={`teacher-session-${session.id}`}
                      className="flex items-center p-3 rounded-2xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-lg border border-white/40 dark:border-gray-600/40 hover:bg-white/80 dark:hover:bg-gray-600/80 transition-all duration-200 group cursor-pointer"
                      onClick={() => handleJoinSession(session)}
                      style={animationDelay}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {session.topic || session.title || 'Untitled Session'}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <User className="h-3 w-3 text-gray-500" />
                          <p className="text-xs text-gray-700 dark:text-gray-300 truncate">
                            {teacherName}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <Clock className="h-3 w-3 text-gray-500" />
                          <p className="text-xs text-gray-700 dark:text-gray-300">
                            {dateTime.date} at {dateTime.time}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <PlayCircle className="h-4 w-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-4 text-gray-600 dark:text-gray-400">
                  <Users className="mx-auto h-8 w-8 mb-2" />
                  <p className="text-sm">{t('student.teacherSessions.noSessions', 'No teacher sessions')}</p>
                  <p className="text-xs mt-1">{t('student.teacherSessions.checkLater', 'Check back later for updates')}</p>
                </div>
              )}
              {filteredTeacherSessions.length > 5 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => navigate('/sessions?view=teachers')}
                >
                  {t('student.teacherSessions.viewAll', 'View All Teacher Sessions')}
                </Button>
              )}
            </div>
          </div>

          {/* Recent Sessions */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl border border-white/30 dark:border-gray-700/40 p-4 sm:p-6 shadow-2xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {t('student.recentSessions.title', 'Your Upcoming Sessions')}
              </h3>
              <Calendar className="h-5 w-5 text-blue-500" />
            </div>
            <div className="space-y-3">
              {loadingSessions ? (
                <div className="flex justify-center py-4">
                  <LoadingSpinner size="sm" />
                </div>
              ) : recentSessions.length > 0 ? (
                recentSessions.map((session, index) => {
                  const dateTime = formatDateTime(session.scheduledTime)
                  const animationDelay = { animationDelay: `${index * 100}ms` }
                  
                  return (
                    <div
                      key={`recent-session-${session.id}`}
                      className="flex items-center p-3 rounded-2xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-lg border border-white/40 dark:border-gray-600/40 hover:bg-white/80 dark:hover:bg-gray-600/80 transition-all duration-200 group cursor-pointer"
                      onClick={() => handleJoinSession(session)}
                      style={animationDelay}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {session.topic || session.title || 'Untitled Session'}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Clock className="h-3 w-3 text-gray-500" />
                          <p className="text-xs text-gray-700 dark:text-gray-300">
                            {dateTime.date} at {dateTime.time}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <PlayCircle className="h-4 w-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-4 text-gray-600 dark:text-gray-400">
                  <Calendar className="mx-auto h-8 w-8 mb-2" />
                  <p className="text-sm">{t('student.recentSessions.noSessions', 'No upcoming sessions')}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => navigate('/sessions')}
                  >
                    {t('student.recentSessions.viewAll', 'View All Sessions')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recordings Section */}
        <div className="xl:col-span-3 space-y-6">
          {/* Search and Filters */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl border border-white/30 dark:border-gray-700/40 p-4 sm:p-6 shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-500" />
                  </div>
                  <Input
                    type="text"
                    className="block w-full pl-10 pr-3 py-3 rounded-2xl bg-white/50 dark:bg-gray-700/50 border-white/40 dark:border-gray-600/40 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                    placeholder={t('common.searchPlaceholder', 'Search recordings by title, description, or instructor...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Filter Toggle for Mobile */}
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className="lg:hidden"
              >
                <Filter className="h-4 w-4 mr-2" />
                {t('common.filters', 'Filters')}
              </Button>

              {/* Filters */}
              <div className={`flex flex-col sm:flex-row gap-3 ${showFilters ? 'flex' : 'hidden lg:flex'}`}>
                <select
                  className="block w-full sm:w-auto px-3 py-3 text-sm rounded-2xl bg-white/50 dark:bg-gray-700/50 border-white/40 dark:border-gray-600/40 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={teacherFilter}
                  onChange={(e) => setTeacherFilter(e.target.value)}
                >
                  {teacherOptions.map(option => (
                    <option key={`teacher-${option.value}`} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <select
                  className="block w-full sm:w-auto px-3 py-3 text-sm rounded-2xl bg-white/50 dark:bg-gray-700/50 border-white/40 dark:border-gray-600/40 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  {categoryOptions.map(option => (
                    <option key={`category-${option.value}`} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <select
                  className="block w-full sm:w-auto px-3 py-3 text-sm rounded-2xl bg-white/50 dark:bg-gray-700/50 border-white/40 dark:border-gray-600/40 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">{t('student.status.all', 'All Status')}</option>
                  <option value="new">{t('student.status.new', 'New')}</option>
                  <option value="watched">{t('student.status.watched', 'Watched')}</option>
                  <option value="completed">{t('student.status.completed', 'Completed')}</option>
                  <option value="processing">{t('student.status.processing', 'Processing')}</option>
                </select>
                <select
                  className="block w-full sm:w-auto px-3 py-3 text-sm rounded-2xl bg-white/50 dark:bg-gray-700/50 border-white/40 dark:border-gray-600/40 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  {sortOptions.map(option => (
                    <option key={`sort-${option.value}`} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <Button
                  onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                  variant="outline"
                  className="px-3"
                >
                  {sortOrder === 'desc' ? '↓' : '↑'}
                </Button>
                <Button onClick={handleRefresh} variant="outline" disabled={isRefetchingRecordings}>
                  <RefreshCw className={`h-4 w-4 ${isRefetchingRecordings ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          </div>

          {/* Recordings List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {t('student.dashboard.availableRecordings', 'Available Recordings')}
              </h3>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {filteredRecordings.length} {t('common.items', 'items')}
                {searchTerm && ` • ${t('common.matching', 'matching')} "${searchTerm}"`}
                {teacherFilter !== 'all' && ` • ${t('common.by', 'by')} ${teacherOptions.find(t => t.value === teacherFilter)?.label}`}
              </span>
            </div>

            {recordingsLoading ? (
              <div className="flex justify-center items-center min-h-64 bg-white/50 dark:bg-gray-800/50 rounded-3xl border border-white/30 dark:border-gray-700/40">
                <div className="text-center">
                  <LoadingSpinner size="lg" />
                  <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                    {t('common.loading', 'Loading recordings...')}
                  </p>
                </div>
              </div>
            ) : filteredRecordings.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-4 sm:gap-6">
                  {filteredRecordings.map((recording, index) => {
                    const StatusIcon = getStatusIcon(recording.status)
                    const progress = recording.progress || (recording.watched ? 100 : 0)
                    const animationDelay = { animationDelay: `${index * 50}ms` }
                   
                    return (
                      <div
                        key={`recording-${recording.id}`}
                        className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl border border-white/30 dark:border-gray-700/40 p-6 shadow-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                        style={animationDelay}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1 min-w-0">
                            <div className={`p-3 rounded-2xl bg-gradient-to-br ${getStatusColor(recording.status)}`}>
                              <StatusIcon className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-semibold text-gray-900 dark:text-white text-lg line-clamp-1 flex-1">
                                  {recording.title}
                                  {recording.meetLink && (
                                    <span className="ml-2 px-2 py-1 text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 rounded-full">
                                      {t('student.recording.googleMeet', 'Google Meet')}
                                    </span>
                                  )}
                                </h4>
                                <div className="flex items-center space-x-2 ml-3">
                                  {recording.watched && (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  )}
                                  {recording.isFeatured && (
                                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                  )}
                                </div>
                              </div>
                             
                              <p className="text-gray-700 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                                {recording.description || t('recording.noDescription', 'No description provided')}
                              </p>

                              {/* Instructor and Category */}
                              <div className="flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-400 mb-3">
                                {recording.instructorName && (
                                  <span className="flex items-center">
                                    <User className="h-3 w-3 mr-1" />
                                    {recording.instructorName}
                                  </span>
                                )}
                                {recording.category && (
                                  <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                    {recording.category}
                                  </span>
                                )}
                              </div>

                              {/* Recording Details */}
                              <div className="flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-400">
                                <span className="flex items-center">
                                  <Eye className="h-3 w-3 mr-1" />
                                  {recording.views || 0} {t('student.recording.views', 'views')}
                                </span>
                                <span className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {formatDuration(recording.duration)}
                                </span>
                                {recording.averageRating > 0 && (
                                  <span className="flex items-center">
                                    <Star className="h-3 w-3 mr-1 text-yellow-500 fill-current" />
                                    {recording.averageRating.toFixed(1)}
                                  </span>
                                )}
                                <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                                  recording.status === 'completed'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                    : recording.status === 'processing'
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                }`}>
                                  {recording.status}
                                </span>
                              </div>

                              {/* Progress Bar */}
                              {progress > 0 && progress < 100 && (
                                <div className="mt-3">
                                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                                    <span>{t('student.recording.progress', 'Progress')}</span>
                                    <span>{progress}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                      className={`h-2 rounded-full bg-gradient-to-r ${getProgressColor(progress)} transition-all duration-500`}
                                      style={{ width: `${progress}%` }}
                                    />
                                  </div>
                                </div>
                              )}

                              {/* Tags */}
                              {recording.tags && recording.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {recording.tags.slice(0, 3).map((tag, tagIndex) => (
                                    <span
                                      key={`tag-${recording.id}-${tagIndex}`}
                                      className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                  {recording.tags.length > 3 && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                                      +{recording.tags.length - 3} {t('common.more', 'more')}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ml-4">
                            <Button
                              size="sm"
                              onClick={() => handleWatchRecording(recording)}
                              disabled={actionLoading[recording.id]}
                              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                            >
                              {actionLoading[recording.id] ? (
                                <LoadingSpinner size="sm" className="mr-1" />
                              ) : (
                                <PlayCircle className="h-3 w-3 mr-1" />
                              )}
                              {recording.recordingUrl?.includes('drive.google.com') 
                                ? t('student.recording.watchOnDrive', 'Watch on Drive')
                                : t('student.recording.watch', 'Watch')}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Load More Button */}
                {hasNextPage && (
                  <div className="flex justify-center mt-8">
                    <Button
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                      variant="outline"
                      className="flex items-center"
                    >
                      {isFetchingNextPage ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          {t('student.recordings.loadingMore', 'Loading more recordings...')}
                        </>
                      ) : (
                        t('student.recordings.loadMore', 'Load More Recordings')
                      )}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 bg-white/50 dark:bg-gray-800/50 rounded-3xl border border-white/30 dark:border-gray-700/40">
                <Video className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' || teacherFilter !== 'all'
                    ? t('student.dashboard.noMatchingRecordings', 'No matching recordings')
                    : t('student.dashboard.noRecordings', 'No recordings available')
                  }
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' || teacherFilter !== 'all'
                    ? t('student.dashboard.tryAdjustingFilters', 'Try adjusting your search or filters.')
                    : t('student.dashboard.enrollInClass', 'Enroll in a class to access recordings.')
                  }
                </p>
                <Button
                  onClick={() => navigate('/courses')}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  {t('student.actions.browseClasses', 'Browse Classes')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard