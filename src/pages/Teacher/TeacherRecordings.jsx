// pages/teacher/TeacherRecordings.js
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../hooks/useAuth'
import { recordingService } from '../../services'
import { useNavigate } from 'react-router-dom' // 👈 added
import Button from '../../components/UI/Button.jsx'
import LoadingSpinner from '../../components/UI/LoadingSpinner.jsx'
import CreateLessonModal from '../../components/UI/CreateLessonModal.jsx'
import {
  Video,
  Plus,
  Search,
  Filter,
  PlayCircle,
  Eye,
  Edit,
  MoreVertical,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  Users,
  Youtube
} from 'lucide-react'

const TeacherRecordings = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate() // 👈 added
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [actionLoading, setActionLoading] = useState({})

  const teacherId = user?.uid

  useEffect(() => {
    if (teacherId) {
      loadLessons()
    }
  }, [teacherId])

  const loadLessons = async () => {
    try {
      setLoading(true)
      const teacherLessons = await recordingService.getTeacherVideos(teacherId, { limit: 100 })
      setLessons(teacherLessons)
    } catch (error) {
      console.error('Error loading lessons:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePublishLesson = async (lessonId) => {
    try {
      setActionLoading(prev => ({ ...prev, [lessonId]: true }))
      await recordingService.publishVideo(lessonId)
      await loadLessons()
    } catch (error) {
      console.error('Error publishing lesson:', error)
    } finally {
      setActionLoading(prev => ({ ...prev, [lessonId]: false }))
    }
  }

  const handleUnpublishLesson = async (lessonId) => {
    try {
      setActionLoading(prev => ({ ...prev, [lessonId]: true }))
      await recordingService.unpublishVideo(lessonId)
      await loadLessons()
    } catch (error) {
      console.error('Error unpublishing lesson:', error)
    } finally {
      setActionLoading(prev => ({ ...prev, [lessonId]: false }))
    }
  }

  const handleLessonCreated = () => {
    setShowCreateModal(false)
    loadLessons()
  }

  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = 
      lesson.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lesson.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lesson.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = 
      statusFilter === 'all' ||
      lesson.status === statusFilter ||
      (statusFilter === 'published' && lesson.isPublished) ||
      (statusFilter === 'unpublished' && !lesson.isPublished)

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'from-green-500 to-emerald-500'
      case 'recording': return 'from-blue-500 to-cyan-500'
      case 'processing': return 'from-yellow-500 to-orange-500'
      case 'failed': return 'from-red-500 to-pink-500'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return CheckCircle
      case 'recording': return PlayCircle
      case 'processing': return Clock
      case 'failed': return XCircle
      default: return Video
    }
  }

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00'
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Lessons</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and publish your video lessons
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Lesson
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Total" value={lessons.length} icon={Video} color="blue" />
        <StatCard label="Published" value={lessons.filter(l => l.isPublished).length} icon={CheckCircle} color="green" />
        <StatCard label="Total Views" value={lessons.reduce((sum, l) => sum + (l.views || 0), 0)} icon={Eye} color="purple" />
        <StatCard label="In Progress" value={lessons.filter(l => l.status === 'processing').length} icon={Clock} color="yellow" />
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search lessons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="unpublished">Unpublished</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
            </select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Lessons Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredLessons.map((lesson) => {
          const StatusIcon = getStatusIcon(lesson.status)
          const thumbnail = lesson.thumbnailUrl || `https://img.youtube.com/vi/${lesson.youtubeId}/hqdefault.jpg`
          
          return (
            <div
              key={lesson.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              {/* Thumbnail */}
              <div className="h-48 bg-gradient-to-br from-red-500 to-red-600 relative">
                <img
                  src={thumbnail}
                  alt={lesson.title}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/640x360?text=No+Thumbnail' }}
                />
                <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                  {formatDuration(lesson.duration)}
                </div>
                {!lesson.isPublished && (
                  <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs">
                    Draft
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg line-clamp-2 mb-2">
                  {lesson.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-3">
                  {lesson.description || 'No description'}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {lesson.views || 0}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatDuration(lesson.duration)}
                    </span>
                  </div>
                  {lesson.category && (
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-xs rounded-full">
                      {lesson.category}
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  {/* ✅ Changed from <a> to Button with navigate */}
                  <Button
                    onClick={() => navigate(`/recording/${lesson.id}`)}
                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                  >
                    <Youtube className="h-4 w-4 mr-2" />
                    Watch
                  </Button>
                  
                  {lesson.isPublished ? (
                    <Button
                      variant="outline"
                      onClick={() => handleUnpublishLesson(lesson.id)}
                      disabled={actionLoading[lesson.id]}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handlePublishLesson(lesson.id)}
                      disabled={actionLoading[lesson.id]}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredLessons.length === 0 && (
        <div className="text-center py-12">
          <Video className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No lessons found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first lesson'
            }
          </p>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Lesson
          </Button>
        </div>
      )}

      {/* Create Lesson Modal */}
      {showCreateModal && (
        <CreateLessonModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleLessonCreated}
        />
      )}
    </div>
  )
}

// Stat Card Component
const StatCard = ({ label, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  )
}

export default TeacherRecordings