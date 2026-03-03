import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../hooks/useAuth'
import { recordingService } from '../../services'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import Button from '../../components/UI/Button'
import {
  Video,
  User,
  Calendar,
  Eye,
  Clock,
  CheckCircle,
  PlayCircle,
  ChevronLeft,
  Youtube,
  AlertCircle
} from 'lucide-react'

const RecordingDetail = () => {
  const { t } = useTranslation()
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [lesson, setLesson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(0)
  const [watched, setWatched] = useState(false)

  useEffect(() => {
    if (id) loadLesson()
  }, [id])

  const loadLesson = async () => {
    try {
      setLoading(true)
      const data = await recordingService.getVideoById(id)
      if (!data) {
        setError('Lesson not found')
        return
      }
      // Check if published (or user is instructor/admin)
      if (!data.isPublished && data.instructorId !== user?.uid && user?.role !== 'admin') {
        setError('This lesson is not available')
        return
      }
      setLesson(data)

      // Check if student has already watched
      if (user && data.studentProgress?.[user.uid]) {
        const prog = data.studentProgress[user.uid]
        setWatched(prog.watched || false)
        setProgress(prog.progress || 0)
      }

      // Increment view count (once per session)
      await recordingService.incrementViews(id)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkCompleted = async () => {
    if (!user || !lesson) return
    try {
      await recordingService.updateStudentProgress(lesson.id, user.uid, {
        progress: 100,
        watched: true
      })
      setWatched(true)
      setProgress(100)
    } catch (err) {
      console.error('Failed to update progress', err)
    }
  }

  const embedUrl = lesson?.embedUrl || recordingService.youtubeWorkflow.getYouTubeEmbedUrl(lesson?.videoUrl)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !lesson) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="mx-auto h-16 w-16 text-red-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {error || 'Lesson not found'}
          </h3>
          <Button onClick={() => navigate(-1)} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 min-h-screen">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back
      </button>

      <div className="space-y-6">
        {/* Video Player */}
        <div className="bg-black rounded-2xl overflow-hidden shadow-2xl aspect-video">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={lesson.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-500 to-red-600">
              <Youtube className="h-20 w-20 text-white opacity-50" />
            </div>
          )}
        </div>

        {/* Title and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {lesson.title}
            </h1>
            {lesson.description && (
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {lesson.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {watched ? (
              <span className="inline-flex items-center px-3 py-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-lg text-sm font-medium">
                <CheckCircle className="h-4 w-4 mr-2" />
                Completed
              </span>
            ) : (
              <Button
                onClick={handleMarkCompleted}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Completed
              </Button>
            )}
          </div>
        </div>

        {/* Metadata Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <MetadataCard
            icon={User}
            label="Instructor"
            value={lesson.instructorName || 'Unknown'}
          />
          <MetadataCard
            icon={Eye}
            label="Views"
            value={lesson.views || 0}
          />
          <MetadataCard
            icon={Clock}
            label="Duration"
            value={formatDuration(lesson.duration)}
          />
          <MetadataCard
            icon={Calendar}
            label="Published"
            value={lesson.publishedAt ? new Date(lesson.publishedAt).toLocaleDateString() : 'Draft'}
          />
          <MetadataCard
            icon={Video}
            label="Category"
            value={lesson.category || 'General'}
          />
        </div>

        {/* Instructor Info (optional) */}
        {lesson.instructorName && (
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl border border-blue-100/50 dark:border-gray-700/50 p-6 shadow-xl">
            <h2 className="text-lg font-semibold mb-4">About the Instructor</h2>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {lesson.instructorName.charAt(0)}
              </div>
              <div>
                <p className="font-medium">{lesson.instructorName}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Instructor
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper components
const MetadataCard = ({ icon: Icon, label, value }) => (
  <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-blue-100/50 dark:border-gray-700/50 p-4 text-center">
    <Icon className="h-5 w-5 mx-auto text-blue-500 mb-2" />
    <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
      {value}
    </p>
  </div>
)

const formatDuration = (seconds) => {
  if (!seconds) return '0:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  return h > 0
    ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    : `${m}:${s.toString().padStart(2, '0')}`
}

export default RecordingDetail