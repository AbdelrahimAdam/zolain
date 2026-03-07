// pages/teacher/TeacherSessions.js
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../hooks/useAuth'
import { sessionService } from '../../services'
import { useNavigate } from 'react-router-dom'  // 👈 ADD THIS IMPORT
import Button from '../../components/UI/Button.jsx'
import LoadingSpinner from '../../components/UI/LoadingSpinner.jsx'
import {
  Calendar,
  Plus,
  Search,
  Filter,
  PlayCircle,
  Clock,
  Users,
  Video,
  CheckCircle,
  XCircle,
  MoreVertical,
  Link,
  Eye
} from 'lucide-react'

const TeacherSessions = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()  // 👈 ADD THIS LINE
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const teacherId = user?.uid

  useEffect(() => {
    if (teacherId) {
      loadSessions()
    }
  }, [teacherId])

  const loadSessions = async () => {
    try {
      setLoading(true)
      const allSessions = await sessionService.getAllSessions()
      // Filter sessions for this teacher
      const teacherSessions = allSessions.filter(session => 
        session.createdBy === teacherId || session.teacherId === teacherId
      )
      setSessions(teacherSessions)
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
      session.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
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
    total: sessions.length,
    scheduled: sessions.filter(s => s.status === 'scheduled').length,
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
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            My Sessions
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your teaching sessions and Google Meet links
          </p>
        </div>
        <Button
          onClick={() => navigate('/teacher/sessions/create')}   // 👈 CHANGED TO NAVIGATE
          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          Schedule Session
        </Button>
      </div>

      {/* Stats - two columns on mobile */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-4">
        <StatCard
          label="Total"
          value={stats.total}
          icon={Calendar}
          color="from-blue-500 to-cyan-500"
        />
        <StatCard
          label="Scheduled"
          value={stats.scheduled}
          icon={Clock}
          color="from-yellow-500 to-orange-500"
        />
        <StatCard
          label="Live"
          value={stats.live}
          icon={PlayCircle}
          color="from-red-500 to-pink-500"
        />
        <StatCard
          label="Completed"
          value={stats.completed}
          icon={CheckCircle}
          color="from-green-500 to-emerald-500"
        />
      </div>

      {/* Filters */}
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl border border-blue-100/50 dark:border-gray-700/50 p-4 sm:p-6 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search sessions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-blue-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 rounded-xl border border-blue-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="live">Live</option>
              <option value="completed">Completed</option>
            </select>
            <Button variant="outline" className="border-blue-200 dark:border-gray-600">
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
              className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-blue-100/50 dark:border-gray-700/50 p-4 sm:p-6 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 sm:p-3 rounded-lg ${
                      isLive ? 'bg-red-100 dark:bg-red-900/30' :
                      isUpcoming ? 'bg-blue-100 dark:bg-blue-900/30' :
                      'bg-green-100 dark:bg-green-900/30'
                    }`}>
                      <StatusIcon className={`h-5 w-5 sm:h-6 sm:w-6 ${
                        isLive ? 'text-red-600 dark:text-red-400' :
                        isUpcoming ? 'text-blue-600 dark:text-blue-400' :
                        'text-green-600 dark:text-green-400'
                      }`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg break-words">
                          {session.title || session.topic}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(session.status)}`}>
                          {session.status}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 break-words">
                        {session.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          {session.scheduledTime ? new Date(session.scheduledTime).toLocaleDateString() : 'TBD'}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          {session.scheduledTime ? new Date(session.scheduledTime).toLocaleTimeString() : 'TBD'}
                        </span>
                        <span className="flex items-center">
                          <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          {session.participantsCount || 0} participants
                        </span>
                      </div>

                      {session.meetLink && (
                        <div className="flex items-center space-x-2 mt-3">
                          <Link className="h-4 w-4 text-blue-500" />
                          <a
                            href={session.meetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline text-xs sm:text-sm break-all"
                          >
                            Google Meet Link
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 lg:flex-nowrap lg:ml-4">
                  {(isLive || isUpcoming) && (
                    <Button
                      onClick={() => handleJoinSession(session)}
                      size="sm"
                      className={isLive 
                        ? "bg-red-600 hover:bg-red-700 text-white" 
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                      }
                    >
                      <PlayCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      {isLive ? 'Join Live' : 'Join'}
                    </Button>
                  )}
                  
                  {hasRecording && (
                    <a
                      href={session.recordingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="sm" variant="outline">
                        <Video className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        Recording
                      </Button>
                    </a>
                  )}
                  
                  <Button size="sm" variant="outline">
                    <MoreVertical className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredSessions.length === 0 && (
        <div className="text-center py-12 bg-white/50 dark:bg-gray-800/50 rounded-3xl border border-blue-100/50 dark:border-gray-700/50">
          <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No sessions found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Get started by scheduling your first session'
            }
          </p>
          <Button
            onClick={() => navigate('/teacher/sessions/create')}   // 👈 ALSO UPDATE THIS ONE
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Schedule Session
          </Button>
        </div>
      )}
    </div>
  )
}

// Stat Card Component (responsive)
const StatCard = ({ label, value, icon: Icon, color }) => {
  return (
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
}

export default TeacherSessions