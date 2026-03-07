// pages/teacher/TeacherRecordings.js
import React, { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../hooks/useAuth'
import { recordingService, sessionService } from '../../services'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/UI/Button.jsx'
import LoadingSpinner from '../../components/UI/LoadingSpinner.jsx'
import {
  Video, Search, Eye, Clock, Users,
  Star, Calendar, Zap, Radio,
  AlertCircle, RefreshCw, XCircle,
  Check, PlayCircle, Youtube,
  Edit, Trash2, MoreVertical
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Helper functions
const formatDuration = (seconds) => {
  if (!seconds) return '0:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  return h > 0 ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}` : `${m}:${s.toString().padStart(2, '0')}`
}

const formatDateTime = (date) => {
  if (!date) return 'TBD'
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

const TeacherRecordings = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [videos, setVideos] = useState([])
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortBy, setSortBy] = useState('createdAt')
  const [activeTab, setActiveTab] = useState('videos')
  const [error, setError] = useState(null)

  const teacherId = user?.uid

  // Stats
  const stats = useMemo(() => {
    const totalVideos = videos.length
    const totalDuration = videos.reduce((sum, v) => sum + (v.duration || 0), 0)
    const totalViews = videos.reduce((sum, v) => sum + (v.views || 0), 0)
    const publishedVideos = videos.filter(v => v.isPublished).length
    const upcomingSessions = sessions.filter(s => s.status === 'scheduled').length
    const liveSessions = sessions.filter(s => s.status === 'live').length
    return {
      totalVideos,
      totalDuration: formatDuration(totalDuration),
      totalViews,
      publishedVideos,
      upcomingSessions,
      liveSessions,
      completionRate: totalVideos > 0 ? Math.round((publishedVideos / totalVideos) * 100) : 0
    }
  }, [videos, sessions])

  // Load data
  const loadAllData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch videos using teacher-specific method
      const videosData = await recordingService.getTeacherVideos(teacherId)

      // Fetch sessions using getAllSessions with instructorId filter
      const sessionsData = await sessionService.getAllSessions({ instructorId: teacherId })

      setVideos(videosData)
      setSessions(sessionsData)
    } catch (err) {
      console.error('Error loading content:', err)
      setError('Failed to load your content. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (teacherId) {
      loadAllData()
    }
  }, [teacherId])

  // Filter & sort videos
  const filteredVideos = useMemo(() => {
    let filtered = videos.filter(v => {
      const matchesSearch = searchTerm === '' ||
        v.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.tags || []).some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesCategory = categoryFilter === 'all' || v.category === categoryFilter
      return matchesSearch && matchesCategory
    })

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title': return a.title?.localeCompare(b.title)
        case 'duration': return (b.duration || 0) - (a.duration || 0)
        case 'views': return (b.views || 0) - (a.views || 0)
        default: return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      }
    })
    return filtered
  }, [videos, searchTerm, categoryFilter, sortBy])

  // Filter sessions for active tab
  const filteredSessions = useMemo(() => {
    let filtered = sessions.filter(s => {
      if (activeTab === 'upcoming') return s.status === 'scheduled'
      if (activeTab === 'live') return s.status === 'live'
      return false
    })
    filtered.sort((a, b) => new Date(a.scheduledTime || 0) - new Date(b.scheduledTime || 0))
    return filtered
  }, [sessions, activeTab])

  const watchVideo = (video) => {
    navigate(`/recording/${video.id}`)
  }

  const editVideo = (videoId) => {
    navigate(`/teacher/recordings/${videoId}/edit`)
  }

  const joinLiveSession = (session) => {
    if (session.meetLink) {
      window.open(session.meetLink, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading your content...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            My Recordings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your video lessons and live sessions
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadAllData} variant="outline" className="border-blue-300 dark:border-blue-700">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => navigate('/teacher/recordings/create')} className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
            <Youtube className="h-4 w-4 mr-2" />
            New Video
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50/80 dark:bg-red-900/30 border border-red-200/50 dark:border-red-800/50 rounded-2xl p-4 flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
          <p className="text-red-700 dark:text-red-300 text-sm flex-1">{error}</p>
          <button onClick={() => setError(null)} className="ml-4 text-red-500 hover:text-red-700">
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Stats - two columns on mobile */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-4">
        <StatCard
          label="Total Videos"
          value={stats.totalVideos}
          icon={Video}
          color="from-blue-500 to-cyan-500"
        />
        <StatCard
          label="Published"
          value={stats.publishedVideos}
          icon={Check}
          color="from-green-500 to-emerald-500"
        />
        <StatCard
          label="Total Views"
          value={stats.totalViews}
          icon={Eye}
          color="from-purple-500 to-pink-500"
        />
        <StatCard
          label="Total Watch Time"
          value={stats.totalDuration}
          icon={Clock}
          color="from-yellow-500 to-orange-500"
        />
      </div>

      {/* Tabs & Filters */}
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl border border-blue-100/50 dark:border-gray-700/50 p-4 sm:p-6 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('videos')}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'videos'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Video className="h-4 w-4 mr-2" />
              Videos
              <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
                activeTab === 'videos'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
              }`}>
                {videos.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'upcoming'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Upcoming
              <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
                activeTab === 'upcoming'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
              }`}>
                {stats.upcomingSessions}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('live')}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'live'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Radio className="h-4 w-4 mr-2" />
              Live
              <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
                activeTab === 'live'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
              }`}>
                {stats.liveSessions}
              </span>
            </button>
          </div>

          <div className="flex-1 flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={activeTab === 'videos' ? "Search videos..." : "Search sessions..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-blue-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              {activeTab === 'videos' && (
                <>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-4 py-3 rounded-xl border border-blue-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Categories</option>
                    <option value="lecture">Lectures</option>
                    <option value="tutorial">Tutorials</option>
                    <option value="workshop">Workshops</option>
                    <option value="qna">Q&A</option>
                  </select>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-3 rounded-xl border border-blue-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="createdAt">Newest First</option>
                    <option value="views">Most Popular</option>
                    <option value="duration">Longest</option>
                    <option value="title">Title A-Z</option>
                  </select>
                </>
              )}
              {activeTab !== 'videos' && (
                <Button onClick={loadAllData} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          <AnimatePresence>
            {activeTab === 'videos' &&
              filteredVideos.map((video, i) => (
                <motion.div
                  key={video.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: i * 0.05 }}
                  className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-blue-100/50 dark:border-gray-700/50 overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 flex flex-col h-full"
                >
                  {/* Thumbnail */}
                  <div className="h-32 sm:h-36 bg-gradient-to-br from-red-500 to-red-600 relative">
                    <img
                      src={video.thumbnailUrl || `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                      alt={video.title}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/640x360?text=No+Thumbnail' }}
                    />
                    <div className="absolute bottom-2 left-2">
                      <span className="px-2 py-0.5 bg-black/70 text-white rounded-full text-xs backdrop-blur-sm">
                        {formatDuration(video.duration)}
                      </span>
                    </div>
                    {!video.isPublished && (
                      <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-0.5 rounded-full text-xs">
                        Draft
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-3 flex-1 flex flex-col">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base line-clamp-2 mb-1">
                      {video.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm line-clamp-2 mb-2 flex-1">
                      {video.description || 'No description'}
                    </p>

                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                      <span className="flex items-center"><Eye className="h-3 w-3 mr-1" />{video.views || 0}</span>
                      <span className="flex items-center"><Clock className="h-3 w-3 mr-1" />{formatDuration(video.duration)}</span>
                      {video.category && (
                        <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-xs rounded-full">
                          {video.category}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {video.instructorName?.charAt(0) || 'I'}
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[60px]">
                          {video.instructorName}
                        </span>
                      </div>
                      <div className="flex space-x-1">
                        <Button size="xs" onClick={() => watchVideo(video)} className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700">
                          <PlayCircle className="h-3 w-3" />
                        </Button>
                        <Button size="xs" variant="outline" onClick={() => editVideo(video.id)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="xs" variant="outline">
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

            {(activeTab === 'upcoming' || activeTab === 'live') &&
              filteredSessions.map((session, i) => (
                <motion.div
                  key={session.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: i * 0.05 }}
                  className={`group bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-blue-100/50 dark:border-gray-700/50 overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 flex flex-col h-full ${
                    activeTab === 'live' ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-orange-500'
                  }`}
                >
                  <div className={`h-32 sm:h-36 bg-gradient-to-br ${
                    activeTab === 'live' ? 'from-red-500 to-pink-600' : 'from-orange-400 to-yellow-500'
                  } relative`}>
                    <div className="w-full h-full flex items-center justify-center">
                      {activeTab === 'live' ? (
                        <Radio className="h-12 w-12 text-white opacity-80 animate-pulse" />
                      ) : (
                        <Calendar className="h-12 w-12 text-white opacity-80" />
                      )}
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        activeTab === 'live'
                          ? 'bg-red-500 text-white'
                          : 'bg-orange-500 text-white'
                      }`}>
                        {activeTab === 'live' ? 'LIVE' : 'Upcoming'}
                      </span>
                    </div>
                    <div className="absolute bottom-2 left-2">
                      <span className="px-2 py-0.5 bg-black/70 text-white rounded-full text-xs">
                        {session.duration || 60} min
                      </span>
                    </div>
                  </div>
                  <div className="p-3 flex-1 flex flex-col">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base line-clamp-2 mb-1">
                      {session.title || session.topic}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xs line-clamp-2 mb-2 flex-1">
                      {session.description || 'No description'}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                      <span className="flex items-center"><Users className="h-3 w-3 mr-1" />{session.instructorName}</span>
                      <span className="flex items-center"><Clock className="h-3 w-3 mr-1" />{formatDateTime(session.scheduledTime)}</span>
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {session.courseName || 'General'}
                      </span>
                      <div className="flex space-x-1">
                        <Button
                          size="xs"
                          onClick={() => joinLiveSession(session)}
                          className={`bg-gradient-to-r ${
                            activeTab === 'live'
                              ? 'from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600'
                              : 'from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600'
                          } text-white`}
                        >
                          <PlayCircle className="h-3 w-3 mr-1" />
                          Join
                        </Button>
                        <Button size="xs" variant="outline">
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
          </AnimatePresence>
        </div>

        {activeTab === 'videos' && filteredVideos.length === 0 && (
          <div className="text-center py-12 bg-white/50 dark:bg-gray-800/50 rounded-3xl border border-blue-100/50 dark:border-gray-700/50">
            <Video className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No videos found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm || categoryFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Get started by creating your first video lesson'}
            </p>
            <Button onClick={() => navigate('/teacher/recordings/create')} className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
              <Youtube className="h-4 w-4 mr-2" />
              Create Video
            </Button>
          </div>
        )}

        {(activeTab === 'upcoming' || activeTab === 'live') && filteredSessions.length === 0 && (
          <div className="text-center py-12 bg-white/50 dark:bg-gray-800/50 rounded-3xl border border-blue-100/50 dark:border-gray-700/50">
            {activeTab === 'upcoming' ? (
              <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            ) : (
              <Radio className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            )}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No {activeTab} sessions
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {activeTab === 'upcoming'
                ? 'Schedule a session to see it here'
                : 'Start a live session to see it here'}
            </p>
            <Button onClick={() => navigate('/teacher/sessions/create')} className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Session
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// Stat Card Component
const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl border border-blue-100/50 dark:border-gray-700/50 p-4 sm:p-6 shadow-lg hover:shadow-xl transition group">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
        <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
      </div>
      <div className={`p-2 sm:p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg`}>
        <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
      </div>
    </div>
  </div>
)

export default TeacherRecordings