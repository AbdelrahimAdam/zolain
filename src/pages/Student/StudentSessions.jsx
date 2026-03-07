// pages/student/StudentSessions.js
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../hooks/useAuth'
import { sessionService, courseService } from '../../services'
import Button from '../../components/UI/Button.jsx'
import LoadingSpinner from '../../components/UI/LoadingSpinner.jsx'
import {
  Calendar,
  PlayCircle,
  Clock,
  Users,
  Video,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  BookOpen
} from 'lucide-react'

const StudentSessions = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const studentId = user?.uid

  useEffect(() => {
    if (studentId) {
      loadSessions()
    }
  }, [studentId])

  const loadSessions = async () => {
    try {
      setLoading(true)
      // Get enrolled courses first
      const enrolledCourses = await courseService.getEnrolledCourses(studentId)
      const courseIds = enrolledCourses.map(c => c.id)

      if (courseIds.length === 0) {
        setSessions([])
        return
      }

      // Fetch sessions from enrolled courses (all statuses)
      const allSessions = await sessionService.getSessionsForStudent(studentId, { courseIds, limit: 50 })
      setSessions(allSessions)
    } catch (error) {
      console.error('Error loading sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinSession = (session) => {
    if (session.meetLink || session.googleMeetLink) {
      window.open(session.meetLink || session.googleMeetLink, '_blank')
    }
  }

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = 
      session.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.instructorName?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = 
      statusFilter === 'all' || 
      session.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      case 'live': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled': return Calendar
      case 'live': return PlayCircle
      case 'completed': return CheckCircle
      default: return Clock
    }
  }

  const stats = {
    upcoming: sessions.filter(s => s.status === 'scheduled').length,
    live: sessions.filter(s => s.status === 'live').length,
    completed: sessions.filter(s => s.status === 'completed').length
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Learning Sessions</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Join live sessions and access recordings
          </p>
        </div>
        <Button onClick={loadSessions} variant="outline">
          <Clock className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.upcoming}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Live Now</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.live}</p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <PlayCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completed}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search sessions..."
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
              <option value="all">All Sessions</option>
              <option value="scheduled">Upcoming</option>
              <option value="live">Live Now</option>
              <option value="completed">Completed</option>
            </select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {filteredSessions.map((session) => {
          const StatusIcon = getStatusIcon(session.status)
          const isLive = session.status === 'live'
          const isUpcoming = session.status === 'scheduled'
          const hasRecording = session.recordingUrl

          return (
            <div
              key={session.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className={`p-3 rounded-lg ${
                    isLive ? 'bg-red-100 dark:bg-red-900/30' :
                    isUpcoming ? 'bg-blue-100 dark:bg-blue-900/30' :
                    'bg-green-100 dark:bg-green-900/30'
                  }`}>
                    <StatusIcon className={`h-6 w-6 ${
                      isLive ? 'text-red-600 dark:text-red-400' :
                      isUpcoming ? 'text-blue-600 dark:text-blue-400' :
                      'text-green-600 dark:text-green-400'
                    }`} />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                        {session.title || session.topic}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                        {session.status}
                      </span>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {session.description}
                    </p>

                    <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400 mb-3">
                      <span className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        {session.instructorName}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {session.scheduledTime ? new Date(session.scheduledTime).toLocaleDateString() : 'TBD'}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        {session.scheduledTime ? new Date(session.scheduledTime).toLocaleTimeString() : 'TBD'}
                      </span>
                    </div>

                    {hasRecording && (
                      <div className="flex items-center space-x-2">
                        <Video className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-600 dark:text-green-400">
                          Recording available
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2">
                  {(isLive || isUpcoming) && (
                    <Button
                      onClick={() => handleJoinSession(session)}
                      className={isLive 
                        ? "bg-red-600 hover:bg-red-700 text-white" 
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                      }
                    >
                      <PlayCircle className="h-4 w-4 mr-2" />
                      {isLive ? 'Join Live' : 'Join'}
                    </Button>
                  )}
                  
                  {hasRecording && session.status === 'completed' && (
                    <a
                      href={session.recordingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline">
                        <Video className="h-4 w-4 mr-2" />
                        Watch Recording
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredSessions.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No sessions found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'No sessions are currently available'
            }
          </p>
        </div>
      )}
    </div>
  )
}

export default StudentSessions