import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Users,
  Video,
  BookOpen,
  BarChart3,
  Check,
  X,
  Plus,
  Eye,
  Clock,
  Zap,
  Settings,
  RefreshCw,
  AlertCircle,
  Database,
  Mail,
  Calendar,
  FileText,
  Download,
  Upload,
  Shield,
  Activity,
  Link,
  Globe,
  User
} from 'lucide-react'
import Button from '../../components/UI/Button.jsx'
import userService from "../../services/userService.jsx"
import sessionService from "../../services/sessionService.jsx"
import { recordingService } from '../../services/recordingService.jsx'
import CreateSessionModal from '../../components/Session/CreateSessionModal.jsx'
import {
  collection,
  query,
  where,
  getDocs,
  getCountFromServer,
  onSnapshot,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore'
import { db } from '../../config/firebase.jsx'

// ---------- Helper Components ----------
const StatCard = ({ stat, index, loading }) => {
  const Icon = stat.icon
  return (
    <div
      className="group relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-blue-100/50 dark:border-gray-700/50 p-6 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${stat.bgColor}/10 rounded-3xl`} />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg shadow-blue-500/25`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className={`text-sm font-semibold ${
            stat.changeType === 'positive'
              ? 'text-green-600 dark:text-green-400'
              : stat.changeType === 'warning'
              ? 'text-yellow-600 dark:text-yellow-400'
              : 'text-gray-600 dark:text-gray-400'
          }`}>
            {stat.change}
          </div>
        </div>
        {loading ? (
          <div className="animate-pulse">
            <div className="h-8 bg-blue-200 dark:bg-gray-600 rounded mb-2"></div>
            <div className="h-4 bg-blue-100 dark:bg-gray-700 rounded"></div>
          </div>
        ) : (
          <>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {stat.value}
            </h3>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {stat.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {stat.description}
            </p>
          </>
        )}
      </div>
    </div>
  )
}

const QuickAction = ({ action, index }) => {
  const Icon = action.icon
  return (
    <button
      onClick={action.action}
      className="w-full flex items-center p-4 rounded-2xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-blue-100/50 dark:border-gray-600/50 hover:bg-white dark:hover:bg-gray-600 hover:scale-105 transition-all duration-300 group"
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
}

const ActivityItem = ({ activity }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'course_created':
      case 'course_updated':
        return BookOpen
      case 'user_joined':
      case 'user_approved':
        return Users
      case 'recording_created':
      case 'recording_processed':
        return Video
      case 'session_scheduled':
      case 'meet_session_scheduled':
        return Clock
      case 'meet_session_started':
        return Globe
      default:
        return Zap
    }
  }

  const getActivityColor = (type) => {
    switch (type) {
      case 'course_created':
      case 'course_updated':
        return 'text-purple-600 dark:text-purple-400'
      case 'user_joined':
      case 'user_approved':
        return 'text-blue-600 dark:text-blue-400'
      case 'recording_created':
      case 'recording_processed':
        return 'text-green-600 dark:text-green-400'
      case 'session_scheduled':
      case 'meet_session_scheduled':
        return 'text-orange-600 dark:text-orange-400'
      case 'meet_session_started':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  const formatActivityText = (act) => {
    return act.message || `${act.userName} ${act.type.replace('_', ' ')}`
  }

  const formatTimeAgo = (date) => {
    if (!date) return 'Never'
    const now = new Date()
    const diff = Math.floor((now - new Date(date)) / 1000)
    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`
    return new Date(date).toLocaleDateString()
  }

  const Icon = getActivityIcon(activity.type)
  return (
    <div className="flex items-center p-4 rounded-2xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border border-blue-100/50 dark:border-gray-600/50 hover:bg-white/80 dark:hover:bg-gray-600/80 transition-all duration-300 group">
      <div className="p-3 rounded-xl bg-gray-200/50 dark:bg-gray-600/50 mr-4 group-hover:scale-110 transition-transform duration-300">
        <Icon className={`h-5 w-5 ${getActivityColor(activity.type)}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 dark:text-white truncate">
          {formatActivityText(activity)}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {formatTimeAgo(activity.timestamp)}
        </p>
      </div>
    </div>
  )
}

const UserRow = ({ user, actionLoading, onApprove, onDeactivate, onReactivate, onChangeRole }) => {
  const formatTimeAgo = (date) => {
    if (!date) return 'Never'
    const now = new Date()
    const diff = Math.floor((now - new Date(date)) / 1000)
    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`
    return new Date(date).toLocaleDateString()
  }

  return (
    <tr className="hover:bg-white/80 dark:hover:bg-gray-700/80 transition-colors duration-200">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold shadow-lg">
              {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
            </div>
          </div>
          <div className="ml-3">
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {user.displayName || 'No Name'}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {user.email}
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-500">
              Joined {formatTimeAgo(user.createdAt)}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
          user.isActive
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
            : user.approvalStatus === 'pending'
            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
        }`}>
          {user.isActive ? 'Active' : user.approvalStatus || 'Inactive'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <select
          value={user.role}
          onChange={(e) => onChangeRole(user.id, e.target.value)}
          disabled={actionLoading[user.id]}
          className={`text-xs font-medium capitalize rounded-xl px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm ${
            user.role === 'admin'
              ? 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
              : user.role === 'teacher'
              ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
              : 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
          }`}
        >
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
        </select>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex space-x-2">
          {!user.isActive && user.approvalStatus === 'pending' ? (
            <Button
              size="sm"
              onClick={() => onApprove(user.id)}
              disabled={actionLoading[user.id]}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-xs"
            >
              {actionLoading[user.id] ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
                <Check className="h-3 w-3" />
              )}
              <span className="ml-1">Approve</span>
            </Button>
          ) : user.isActive ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDeactivate(user.id)}
              disabled={actionLoading[user.id]}
              className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 text-xs"
            >
              {actionLoading[user.id] ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
                <X className="h-3 w-3" />
              )}
              <span className="ml-1">Deactivate</span>
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => onReactivate(user.id)}
              disabled={actionLoading[user.id]}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-xs"
            >
              {actionLoading[user.id] ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
              <span className="ml-1">Reactivate</span>
            </Button>
          )}
        </div>
      </td>
    </tr>
  )
}

const SessionCard = ({ session, actionLoading, onAddRecording }) => {
  const isLive = session.status === 'live'
  const isUpcoming = session.status === 'scheduled'
  const isRecorded = session.recordingStatus === 'available'
  const isMeetSession = session.meetLink

  const formatTimeAgo = (date) => {
    if (!date) return 'Never'
    const now = new Date()
    const diff = Math.floor((now - new Date(date)) / 1000)
    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`
    return new Date(date).toLocaleDateString()
  }

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-blue-100/50 dark:border-gray-700/50 p-6 hover:shadow-xl transition-all duration-300 group hover:scale-105">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-xl ${
            isLive
              ? 'bg-red-100 dark:bg-red-900/30'
              : isRecorded
              ? 'bg-green-100 dark:bg-green-900/30'
              : isMeetSession
              ? 'bg-blue-100 dark:bg-blue-900/30'
              : 'bg-gray-100 dark:bg-gray-900/30'
          }`}>
            {isMeetSession ? (
              <Globe className={`h-5 w-5 ${
                isLive
                  ? 'text-red-600 dark:text-red-400'
                  : isRecorded
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-blue-600 dark:text-blue-400'
              }`} />
            ) : (
              <Video className={`h-5 w-5 ${
                isLive
                  ? 'text-red-600 dark:text-red-400'
                  : isRecorded
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-blue-600 dark:text-blue-400'
              }`} />
            )}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
              {session.title || session.topic}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {session.description}
              {session.instructorName && ` • ${session.instructorName}`}
            </p>
          </div>
        </div>
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          isLive
            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
            : isUpcoming
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
            : isRecorded
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
        }`}>
          {isLive ? 'Live Now' : isUpcoming ? 'Upcoming' : isRecorded ? 'Recorded' : 'Completed'}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-gray-600 dark:text-gray-400">
            {session.scheduledTime ? session.scheduledTime.toLocaleDateString() : 'No date'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-gray-400" />
          <span className="text-gray-600 dark:text-gray-400">
            {session.scheduledTime ? session.scheduledTime.toLocaleTimeString() : 'No time'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-gray-400" />
          <span className="text-gray-600 dark:text-gray-400">
            {session.instructorName || 'Unknown'}
          </span>
        </div>
      </div>
      {session.meetLink && (
        <div className="mt-3 flex items-center space-x-2 text-sm">
          <Link className="h-4 w-4 text-blue-500" />
          <a
            href={session.meetLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline truncate"
          >
            {session.meetLink}
          </a>
        </div>
      )}
      <div className="mt-4 flex space-x-2">
        {isLive && session.meetLink && (
          <a
            href={session.meetLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white w-full">
              <Video className="h-3 w-3 mr-1" />
              Join Live
            </Button>
          </a>
        )}
        {!isRecorded && !isLive && !isUpcoming && session.meetLink && (
          <Button
            size="sm"
            onClick={() => onAddRecording(session.id)}
            disabled={actionLoading[session.id]}
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
          >
            {actionLoading[session.id] ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : (
              <Upload className="h-3 w-3" />
            )}
            <span className="ml-1">Add Recording</span>
          </Button>
        )}
        {isRecorded && session.recordingUrl && (
          <a
            href={session.recordingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Button size="sm" variant="outline" className="w-full">
              <Eye className="h-3 w-3 mr-1" />
              View Recording
            </Button>
          </a>
        )}
        <Button size="sm" variant="outline">
          <Settings className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}

// ---------- Main Component ----------
const AdminDashboard = () => {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [users, setUsers] = useState([])
  const [courses, setCourses] = useState([])
  const [recordings, setRecordings] = useState([])
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSessions: 0,
    totalCourses: 0,
    totalRecordings: 0,
    pendingUsers: 0,
    storageUsed: 0,
    totalDuration: 0,
    meetSessions: 0,
    recordedSessions: 0,
    upcomingSessions: 0
  })
  const [recentActivities, setRecentActivities] = useState([])
  const [error, setError] = useState(null)
  const [indexError, setIndexError] = useState(null)
  const [actionLoading, setActionLoading] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showCreateSessionModal, setShowCreateSessionModal] = useState(false)

  // Original data loading functions remain exactly the same
  useEffect(() => {
    loadAllData()
    const unsubscribe = setupRealtimeListeners()
    return () => unsubscribe()
  }, [])

  const loadAllData = async () => {
    try {
      setLoading(true)
      setStatsLoading(true)
      setError(null)
      setIndexError(null)
     
      await Promise.all([
        loadUsers(),
        loadCourses(),
        loadRecordings(),
        loadSessions(),
        loadStats(),
        loadRecentActivities()
      ])
    } catch (error) {
      console.error('Error loading data:', error)
      if (error.message?.includes('index') || error.code === 'failed-precondition') {
        setIndexError('Some advanced features require Firestore indexes. Basic data is loaded.')
        await loadBasicData()
      } else {
        setError('Failed to load dashboard data. Please try refreshing the page.')
        await loadBasicData()
      }
    } finally {
      setLoading(false)
      setStatsLoading(false)
    }
  }

  const loadBasicData = async () => {
    try {
      const [usersData, coursesData, recordingsData, sessionsData] = await Promise.all([
        userService.getAllUsers().catch(() => []),
        loadCoursesBasic(),
        loadRecordingsBasic(),
        loadSessionsBasic()
      ])
     
      setUsers(usersData)
      setCourses(coursesData)
      setRecordings(recordingsData)
      setSessions(sessionsData)
     
      const totalUsers = usersData.length
      const pendingUsers = usersData.filter(user => !user.isActive).length
      const totalCourses = coursesData.length
      const totalRecordings = recordingsData.length
      const activeSessions = sessionsData.filter(s => s.status === 'live').length
      const storageUsed = recordingsData.reduce((acc, r) => acc + (r.fileSize || 0), 0)
      const totalDuration = recordingsData.reduce((acc, r) => acc + (r.duration || 0), 0)
      const meetSessions = sessionsData.filter(s => s.meetLink).length
      const recordedSessions = sessionsData.filter(s => s.isRecorded).length
      const upcomingSessions = sessionsData.filter(s => s.status === 'scheduled').length
     
      setStats({
        totalUsers,
        activeSessions,
        totalCourses,
        totalRecordings,
        pendingUsers,
        storageUsed,
        totalDuration,
        meetSessions,
        recordedSessions,
        upcomingSessions
      })
      const activities = await generateActivitiesFromData(usersData, coursesData, recordingsData, sessionsData)
      setRecentActivities(activities)
    } catch (error) {
      console.error('Error loading basic data:', error)
    }
  }

  const setupRealtimeListeners = () => {
    const unsubscribers = []
    try {
      const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(50))
      const unsubscribeUsers = onSnapshot(usersQuery,
        (snapshot) => {
          const usersData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.(),
            lastLogin: doc.data().lastLogin?.toDate?.(),
            approvedAt: doc.data().approvedAt?.toDate?.()
          }))
          setUsers(usersData)
          setStats(prev => ({
            ...prev,
            totalUsers: usersData.length,
            pendingUsers: usersData.filter(user => !user.isActive && user.approvalStatus === 'pending').length
          }))
        },
        (error) => {
          console.error('Error in users listener:', error)
        }
      )
      unsubscribers.push(unsubscribeUsers)
    } catch (error) {
      console.error('Error setting up users listener:', error)
    }
    try {
      const meetSessionsQuery = query(
        collection(db, 'recordings'),
        where('status', 'in', ['scheduled', 'live']),
        orderBy('scheduledTime', 'desc'),
        limit(20)
      )
     
      const unsubscribeMeetSessions = onSnapshot(meetSessionsQuery,
        (snapshot) => {
          const meetSessionsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            scheduledTime: doc.data().scheduledTime?.toDate?.(),
            sessionEndTime: doc.data().sessionEndTime?.toDate?.(),
            createdAt: doc.data().createdAt?.toDate?.(),
            updatedAt: doc.data().updatedAt?.toDate?.()
          }))
         
          const now = new Date()
          const activeMeetSessions = meetSessionsData.filter(session => {
            const scheduledTime = session.scheduledTime
            const sessionEndTime = session.sessionEndTime
            return scheduledTime && sessionEndTime &&
                   now >= scheduledTime && now <= sessionEndTime &&
                   session.status === 'live'
          }).length
         
          setStats(prev => ({
            ...prev,
            activeSessions: activeMeetSessions,
            meetSessions: meetSessionsData.length,
            upcomingSessions: meetSessionsData.filter(s => s.status === 'scheduled').length
          }))
        },
        (error) => {
          console.error('Error in Meet sessions listener:', error)
        }
      )
      unsubscribers.push(unsubscribeMeetSessions)
    } catch (error) {
      console.error('Error setting up Meet sessions listener:', error)
    }
    try {
      const recordingsQuery = query(
        collection(db, 'recordings'),
        where('recordingStatus', '==', 'available'),
        orderBy('createdAt', 'desc'),
        limit(20)
      )
     
      const unsubscribeRecordings = onSnapshot(recordingsQuery,
        (snapshot) => {
          const recordingsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.(),
            duration: doc.data().duration || 0,
            fileSize: doc.data().fileSize || 0
          }))
          setRecordings(recordingsData)
         
          const storageUsed = recordingsData.reduce((acc, r) => acc + (r.fileSize || 0), 0)
          const totalDuration = recordingsData.reduce((acc, r) => acc + (r.duration || 0), 0)
         
          setStats(prev => ({
            ...prev,
            totalRecordings: recordingsData.length,
            recordedSessions: recordingsData.filter(r => r.recordingStatus === 'available').length,
            storageUsed,
            totalDuration
          }))
        },
        (error) => {
          console.error('Error in recordings listener:', error)
        }
      )
      unsubscribers.push(unsubscribeRecordings)
    } catch (error) {
      console.error('Error setting up recordings listener:', error)
    }
    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe())
    }
  }

  const loadUsers = async () => {
    try {
      const usersData = await userService.getAllUsers()
      setUsers(usersData)
    } catch (error) {
      console.error('Error loading users:', error)
      throw error
    }
  }

  const loadCourses = async () => {
    try {
      const coursesQuery = query(collection(db, 'courses'), orderBy('createdAt', 'desc'), limit(50))
      const snapshot = await getDocs(coursesQuery)
      const coursesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.(),
        updatedAt: doc.data().updatedAt?.toDate?.()
      }))
      setCourses(coursesData)
    } catch (error) {
      console.error('Error loading courses:', error)
      throw error
    }
  }

  const loadCoursesBasic = async () => {
    try {
      const coursesQuery = query(collection(db, 'courses'), limit(50))
      const snapshot = await getDocs(coursesQuery)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.(),
        updatedAt: doc.data().updatedAt?.toDate?.()
      }))
    } catch (error) {
      console.error('Error loading basic courses:', error)
      return []
    }
  }

  const loadRecordings = async () => {
    try {
      const [recordingsSnapshot, meetSessionsSnapshot] = await Promise.all([
        getDocs(query(collection(db, 'recordings'),
          where('recordingStatus', '==', 'available'),
          orderBy('createdAt', 'desc'),
          limit(50)
        )),
        getDocs(query(collection(db, 'recordings'),
          where('status', 'in', ['scheduled', 'live', 'completed']),
          orderBy('scheduledTime', 'desc'),
          limit(50)
        ))
      ])
      const recordingsData = recordingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.(),
        duration: doc.data().duration || 0,
        fileSize: doc.data().fileSize || 0
      }))
      const meetSessionsData = meetSessionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        scheduledTime: doc.data().scheduledTime?.toDate?.(),
        sessionEndTime: doc.data().sessionEndTime?.toDate?.(),
        createdAt: doc.data().createdAt?.toDate?.(),
        updatedAt: doc.data().updatedAt?.toDate?.()
      }))
      setRecordings([...recordingsData, ...meetSessionsData])
    } catch (error) {
      console.error('Error loading recordings:', error)
      throw error
    }
  }

  const loadRecordingsBasic = async () => {
    try {
      const recordingsQuery = query(collection(db, 'recordings'), limit(50))
      const snapshot = await getDocs(recordingsQuery)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.(),
        duration: doc.data().duration || 0,
        fileSize: doc.data().fileSize || 0
      }))
    } catch (error) {
      console.error('Error loading basic recordings:', error)
      return []
    }
  }

  const loadSessions = async () => {
    try {
      const meetSessionsQuery = query(
        collection(db, 'recordings'),
        where('status', 'in', ['scheduled', 'live', 'completed']),
        orderBy('scheduledTime', 'desc'),
        limit(50)
      )
     
      const snapshot = await getDocs(meetSessionsQuery)
      const sessionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        scheduledTime: doc.data().scheduledTime?.toDate?.(),
        sessionEndTime: doc.data().sessionEndTime?.toDate?.(),
        createdAt: doc.data().createdAt?.toDate?.(),
        updatedAt: doc.data().updatedAt?.toDate?.()
      }))
     
      setSessions(sessionsData)
    } catch (error) {
      console.error('Error loading sessions:', error)
      throw error
    }
  }

  const loadSessionsBasic = async () => {
    try {
      const sessionsQuery = query(
        collection(db, 'recordings'),
        where('status', 'in', ['scheduled', 'live', 'completed']),
        limit(50)
      )
      const snapshot = await getDocs(sessionsQuery)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        scheduledTime: doc.data().scheduledTime?.toDate?.(),
        sessionEndTime: doc.data().sessionEndTime?.toDate?.(),
        createdAt: doc.data().createdAt?.toDate?.(),
        updatedAt: doc.data().updatedAt?.toDate?.()
      }))
    } catch (error) {
      console.error('Error loading basic sessions:', error)
      return []
    }
  }

  const loadStats = async () => {
    try {
      const [
        usersCount,
        coursesCount,
        recordingsCount,
        pendingUsersCount,
        meetSessionsCount,
        availableRecordingsCount
      ] = await Promise.all([
        getCountFromServer(collection(db, 'users')),
        getCountFromServer(collection(db, 'courses')),
        getCountFromServer(collection(db, 'recordings')),
        getCountFromServer(query(collection(db, 'users'), where('isActive', '==', false))),
        getCountFromServer(query(collection(db, 'recordings'), where('meetLink', '!=', ''))),
        getCountFromServer(query(collection(db, 'recordings'), where('recordingStatus', '==', 'available')))
      ])
      const storageUsed = recordings.reduce((acc, r) => acc + (r.fileSize || 0), 0)
      const totalDuration = recordings.reduce((acc, r) => acc + (r.duration || 0), 0)
      const now = new Date()
      const activeMeetSessions = sessions.filter(session => {
        const scheduledTime = session.scheduledTime
        const sessionEndTime = session.sessionEndTime
        return scheduledTime && sessionEndTime &&
               now >= scheduledTime && now <= sessionEndTime &&
               session.status === 'live'
      }).length
      setStats({
        totalUsers: usersCount.data().count,
        activeSessions: activeMeetSessions,
        totalCourses: coursesCount.data().count,
        totalRecordings: recordingsCount.data().count,
        pendingUsers: pendingUsersCount.data().count,
        storageUsed,
        totalDuration,
        meetSessions: meetSessionsCount.data().count,
        recordedSessions: availableRecordingsCount.data().count,
        upcomingSessions: sessions.filter(s => s.status === 'scheduled').length
      })
    } catch (error) {
      console.error('Error loading stats:', error)
      const storageUsed = recordings.reduce((acc, r) => acc + (r.fileSize || 0), 0)
      const totalDuration = recordings.reduce((acc, r) => acc + (r.duration || 0), 0)
      const now = new Date()
      const activeMeetSessions = sessions.filter(session => {
        const scheduledTime = session.scheduledTime
        const sessionEndTime = session.sessionEndTime
        return scheduledTime && sessionEndTime &&
               now >= scheduledTime && now <= sessionEndTime &&
               session.status === 'live'
      }).length
     
      setStats({
        totalUsers: users.length,
        activeSessions: activeMeetSessions,
        totalCourses: courses.length,
        totalRecordings: recordings.length,
        pendingUsers: users.filter(user => !user.isActive).length,
        storageUsed,
        totalDuration,
        meetSessions: sessions.filter(s => s.meetLink).length,
        recordedSessions: recordings.filter(r => r.recordingStatus === 'available').length,
        upcomingSessions: sessions.filter(s => s.status === 'scheduled').length
      })
      throw error
    }
  }

  const loadRecentActivities = async () => {
    try {
      const activitiesQuery = query(
        collection(db, 'activities'),
        orderBy('timestamp', 'desc'),
        limit(10)
      )
      const snapshot = await getDocs(activitiesQuery)
     
      if (!snapshot.empty) {
        const activitiesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate()
        }))
        setRecentActivities(activitiesData)
      } else {
        const activities = await generateActivitiesFromData(users, courses, recordings, sessions)
        setRecentActivities(activities)
      }
    } catch (error) {
      console.error('Error loading recent activities:', error)
      const activities = await generateActivitiesFromData(users, courses, recordings, sessions)
      setRecentActivities(activities)
    }
  }

  const generateActivitiesFromData = async (usersData, coursesData, recordingsData, sessionsData = []) => {
    const activities = []
    const now = new Date()
    
    usersData.slice(0, 5).forEach((user, index) => {
      const timeAgo = new Date(now.getTime() - (index + 1) * 2 * 60 * 60 * 1000)
      activities.push({
        id: `user-${user.id}`,
        type: 'user_joined',
        userName: user.displayName || user.email,
        userEmail: user.email,
        timestamp: user.createdAt || timeAgo,
        message: `${user.displayName || user.email} joined the platform`
      })
    })
    
    coursesData.slice(0, 3).forEach((course, index) => {
      const timeAgo = new Date(now.getTime() - (index + 1) * 4 * 60 * 60 * 1000)
      activities.push({
        id: `course-${course.id}`,
        type: 'course_created',
        userName: course.instructorName || 'Instructor',
        courseName: course.title,
        timestamp: course.createdAt || timeAgo,
        message: `Course "${course.title}" was created`
      })
    })
    
    sessionsData.slice(0, 3).forEach((session, index) => {
      const timeAgo = new Date(now.getTime() - (index + 1) * 3 * 60 * 60 * 1000)
      const sessionType = session.meetLink ? 'meet_session_scheduled' : 'session_scheduled'
      activities.push({
        id: `session-${session.id}`,
        type: sessionType,
        userName: session.instructorName || session.createdBy || 'System',
        sessionName: session.title || session.topic,
        timestamp: session.createdAt || timeAgo,
        message: session.meetLink
          ? `Google Meet session "${session.title}" was scheduled`
          : `Session "${session.title || session.topic}" was scheduled`
      })
    })
    
    recordingsData.slice(0, 2).forEach((recording, index) => {
      const timeAgo = new Date(now.getTime() - (index + 1) * 6 * 60 * 60 * 1000)
      activities.push({
        id: `recording-${recording.id}`,
        type: 'recording_created',
        userName: recording.instructorName || recording.createdBy || 'User',
        timestamp: recording.createdAt || timeAgo,
        message: `New recording uploaded by ${recording.instructorName || recording.createdBy || 'User'}`
      })
    })
    
    return activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5)
  }

  // Handlers wrapped in useCallback
  const handleApproveUser = useCallback(async (userId) => {
    try {
      setError(null)
      setActionLoading(prev => ({ ...prev, [userId]: true }))
      await userService.approveUser(userId)
    } catch (error) {
      console.error('Error approving user:', error)
      setError('Failed to approve user. Please try again.')
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }))
    }
  }, [])

  const handleDeactivateUser = useCallback(async (userId) => {
    try {
      setError(null)
      setActionLoading(prev => ({ ...prev, [userId]: true }))
      await userService.deactivateUser(userId, 'Deactivated by admin')
    } catch (error) {
      console.error('Error deactivating user:', error)
      setError('Failed to deactivate user. Please try again.')
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }))
    }
  }, [])

  const handleReactivateUser = useCallback(async (userId) => {
    try {
      setError(null)
      setActionLoading(prev => ({ ...prev, [userId]: true }))
      await userService.reactivateUser(userId)
    } catch (error) {
      console.error('Error reactivating user:', error)
      setError('Failed to reactivate user. Please try again.')
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }))
    }
  }, [])

  const handleChangeUserRole = useCallback(async (userId, newRole) => {
    try {
      setError(null)
      setActionLoading(prev => ({ ...prev, [userId]: true }))
      await userService.changeUserRole(userId, newRole)
    } catch (error) {
      console.error('Error changing user role:', error)
      setError('Failed to change user role. Please try again.')
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }))
    }
  }, [])

  const handleAddRecording = useCallback(async (sessionId) => {
    const recordingUrl = prompt('Enter the Google Drive recording URL:')
    if (recordingUrl) {
      try {
        setError(null)
        setActionLoading(prev => ({ ...prev, [sessionId]: true }))
       
        await recordingService.updateWithDriveRecording(sessionId, {
          recordingUrl: recordingUrl,
          duration: 60,
          fileSize: 250
        })
       
        await loadAllData()
      } catch (error) {
        console.error('Error adding recording:', error)
        setError('Failed to add recording. Please try again.')
      } finally {
        setActionLoading(prev => ({ ...prev, [sessionId]: false }))
      }
    }
  }, [])

  const handleCreateMeetSession = async () => {
    try {
      setError(null)
     
      const title = prompt('Enter session title:')
      const description = prompt('Enter session description (optional):') || ''
      const meetLink = prompt('Enter Google Meet link:')
      const scheduledTime = prompt('Enter scheduled date and time (YYYY-MM-DD HH:MM):')
     
      if (!title || !meetLink || !scheduledTime) {
        setError('All fields are required to create a session.')
        return
      }
      const scheduledDate = new Date(scheduledTime)
      if (isNaN(scheduledDate.getTime())) {
        setError('Invalid date format. Please use YYYY-MM-DD HH:MM format.')
        return
      }
      
      await recordingService.createRecordingFromMeetSession({
        title,
        description,
        meetLink,
        scheduledTime: scheduledDate,
        sessionEndTime: new Date(scheduledDate.getTime() + 60 * 60 * 1000),
        instructorId: 'admin',
        instructorEmail: 'admin@system.com',
        instructorName: 'System Admin',
        status: 'scheduled',
        recordingStatus: 'not_started'
      })
      
      await loadAllData()
      setError(null)
    } catch (error) {
      console.error('Error creating Meet session:', error)
      setError('Failed to create Google Meet session. Please try again.')
    }
  }

  const handleRefresh = useCallback(() => {
    loadAllData()
  }, [])

  const handleCreateIndex = () => {
    window.open('https://console.firebase.google.com/project/_/firestore/indexes', '_blank')
  }

  const handleExportData = () => {
    const data = {
      users: users.map(user => ({
        Name: user.displayName,
        Email: user.email,
        Role: user.role,
        Status: user.isActive ? 'Active' : 'Inactive',
        'Joined Date': user.createdAt?.toLocaleDateString()
      })),
      sessions: sessions.map(session => ({
        Title: session.title || session.topic,
        'Meet Link': session.meetLink || 'N/A',
        'Scheduled Time': session.scheduledTime?.toLocaleString(),
        Status: session.status,
        'Recording Status': session.recordingStatus || 'N/A',
        Instructor: session.instructorName || 'Unknown'
      })),
      recordings: recordings.map(recording => ({
        Title: recording.title,
        'Drive Link': recording.recordingUrl || 'N/A',
        Duration: `${recording.duration || 0} minutes`,
        'File Size': `${recording.fileSize || 0} MB`,
        Status: recording.recordingStatus || 'unknown'
      }))
    }
    const csvContent = Object.entries(data).map(([type, items]) => {
      const headers = Object.keys(items[0] || {}).join(',')
      const rows = items.map(item => Object.values(item).join(','))
      return [`${type.toUpperCase()}\n${headers}\n${rows.join('\n')}`].join('\n')
    }).join('\n\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `meet-recorder-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleSessionCreated = useCallback(() => {
    loadAllData()
    console.log('New session created')
  }, [])

  // Memoized values
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch =
        user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role?.toLowerCase().includes(searchTerm.toLowerCase())
     
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && user.isActive) ||
        (filterStatus === 'pending' && !user.isActive && user.approvalStatus === 'pending') ||
        (filterStatus === 'inactive' && user.approvalStatus === 'deactivated')
     
      return matchesSearch && matchesStatus
    })
  }, [users, searchTerm, filterStatus])

  const statCards = useMemo(() => [
    {
      name: t('admin.stats.totalUsers', 'Total Users'),
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      change: `${stats.pendingUsers} pending`,
      changeType: stats.pendingUsers > 0 ? 'warning' : 'positive',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-500 to-cyan-500',
      description: 'Total registered users',
      loading: statsLoading
    },
    {
      name: t('admin.stats.activeSessions', 'Active Sessions'),
      value: stats.activeSessions.toString(),
      icon: Video,
      change: `${stats.meetSessions} total Meet sessions`,
      changeType: stats.activeSessions > 0 ? 'positive' : 'neutral',
      color: 'from-green-500 to-emerald-600',
      bgColor: 'from-green-500 to-emerald-600',
      description: 'Live Google Meet sessions',
      loading: statsLoading
    },
    {
      name: t('admin.stats.totalCourses', 'Total Courses'),
      value: stats.totalCourses.toString(),
      icon: BookOpen,
      change: `${courses.filter(c => c.isPublished).length} published`,
      changeType: 'neutral',
      color: 'from-purple-500 to-indigo-600',
      bgColor: 'from-purple-500 to-indigo-600',
      description: 'Available courses',
      loading: statsLoading
    },
    {
      name: t('admin.stats.totalRecordings', 'Available Recordings'),
      value: stats.recordedSessions.toString(),
      icon: BarChart3,
      change: `${stats.upcomingSessions} upcoming sessions`,
      changeType: 'neutral',
      color: 'from-orange-500 to-red-600',
      bgColor: 'from-orange-500 to-red-600',
      description: 'Google Drive recordings',
      loading: statsLoading
    }
  ], [stats, statsLoading, courses, t])

  const quickActions = useMemo(() => [
    {
      title: t('admin.actions.manageUsers', 'Manage Users'),
      description: 'View and manage all user accounts',
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-500/10 dark:bg-blue-500/20',
      action: () => setActiveTab('users')
    },
    {
      title: t('admin.actions.createMeetSession', 'Create Meet Session'),
      description: 'Schedule new Google Meet session',
      icon: Video,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-500/10 dark:bg-green-500/20',
      action: () => setShowCreateSessionModal(true)
    },
    {
      title: t('admin.actions.scheduleSession', 'View Sessions'),
      description: 'Manage Google Meet sessions',
      icon: Clock,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-500/10 dark:bg-purple-500/20',
      action: () => setActiveTab('sessions')
    }
  ], [t])

  // Tab content renderer with memoization where possible
  const renderTabContent = useCallback(() => {
    if (loading && activeTab === 'dashboard') {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin-slow rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600"></div>
        </div>
      )
    }
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            {/* Index Error Alert */}
            {indexError && (
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-yellow-200/50 dark:border-yellow-800/50 p-6 shadow-lg">
                <div className="flex items-start">
                  <Database className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-yellow-800 dark:text-yellow-200 text-sm font-medium mb-2">
                      Firestore Index Required
                    </p>
                    <p className="text-yellow-700 dark:text-yellow-300 text-sm mb-3">
                      {indexError}
                    </p>
                    <div className="flex space-x-3">
                      <Button
                        size="sm"
                        onClick={handleCreateIndex}
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
                      >
                        Create Index
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIndexError(null)}
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Error Alert */}
            {error && (
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-red-200/50 dark:border-red-800/50 p-6 shadow-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                  <p className="text-red-700 dark:text-red-300 text-sm flex-1">{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="ml-auto text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {statCards.map((stat, index) => (
                <StatCard key={stat.name} stat={stat} index={index} loading={statsLoading} />
              ))}
            </div>
            {/* Quick Actions & Recent Activity Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Quick Actions */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-blue-100/50 dark:border-gray-700/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t('admin.actions.quickActions', 'Quick Actions')}
                  </h3>
                  <Zap className="h-5 w-5 text-yellow-500" />
                </div>
                <div className="space-y-4">
                  {quickActions.map((action, index) => (
                    <QuickAction key={action.title} action={action} index={index} />
                  ))}
                </div>
              </div>
              {/* Recent Activity */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-blue-100/50 dark:border-gray-700/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t('admin.activity.recent', 'Recent Activity')}
                  </h3>
                  <Activity className="h-5 w-5 text-blue-500" />
                </div>
                <div className="space-y-4">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity) => (
                      <ActivityItem key={activity.id} activity={activity} />
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Zap className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        No recent activities
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
     
      case 'users':
        return (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-blue-100/50 dark:border-gray-700/50 shadow-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-blue-100/50 dark:border-gray-700/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t('admin.users.title', 'User Management')}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {t('admin.users.subtitle', 'Manage all user accounts and permissions')}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleRefresh}
                    variant="outline"
                    className="flex items-center"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <Button className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700">
                    <Plus className="h-4 w-4 mr-2" />
                    {t('admin.users.inviteUser', 'Invite User')}
                  </Button>
                </div>
              </div>
              {/* Search and Filter */}
              <div className="mt-4 flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search users by name, email, or role..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 border border-blue-200 dark:border-gray-600 rounded-2xl bg-white/50 dark:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-3 border border-blue-200 dark:border-gray-600 rounded-2xl bg-white/50 dark:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
           
            <div className="p-6">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin-slow rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600"></div>
                </div>
              ) : filteredUsers.length > 0 ? (
                <div className="overflow-x-auto">
                  <div className="min-w-full inline-block align-middle">
                    <div className="overflow-hidden rounded-2xl border border-blue-100/50 dark:border-gray-700/50">
                      <table className="min-w-full divide-y divide-blue-100/50 dark:divide-gray-700/50">
                        <thead className="bg-blue-50/50 dark:bg-gray-700/50">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                              {t('admin.users.user', 'User')}
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                              {t('admin.users.status', 'Status')}
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                              {t('admin.users.role', 'Role')}
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                              {t('admin.users.actions', 'Actions')}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white/50 dark:bg-gray-800/50 divide-y divide-blue-100/50 dark:divide-gray-700/50">
                          {filteredUsers.map((user) => (
                            <UserRow
                              key={user.id}
                              user={user}
                              actionLoading={actionLoading}
                              onApprove={handleApproveUser}
                              onDeactivate={handleDeactivateUser}
                              onReactivate={handleReactivateUser}
                              onChangeRole={handleChangeUserRole}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {t('admin.users.noUsers', 'No Users Found')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {t('admin.users.noUsersDescription', 'There are no users matching your criteria.')}
                  </p>
                  <Button
                    onClick={() => { setSearchTerm(''); setFilterStatus('all'); }}
                    className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        )
     
      case 'courses':
        return (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-blue-100/50 dark:border-gray-700/50 shadow-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-blue-100/50 dark:border-gray-700/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t('admin.courses.title', 'Course Management')}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {t('admin.courses.subtitle', 'Manage all courses and content')}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleRefresh}
                    variant="outline"
                    className="flex items-center"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <Button className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700">
                    <Plus className="h-4 w-4 mr-2" />
                    {t('admin.courses.createCourse', 'Create Course')}
                  </Button>
                </div>
              </div>
            </div>
           
            <div className="p-6">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin-slow rounded-full h-8 w-8 border-4 border-purple-200 border-t-purple-600"></div>
                </div>
              ) : courses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course) => {
                    const formatTimeAgo = (date) => {
                      if (!date) return 'Never'
                      const now = new Date()
                      const diff = Math.floor((now - new Date(date)) / 1000)
                      if (diff < 60) return 'Just now'
                      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
                      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
                      if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`
                      return new Date(date).toLocaleDateString()
                    }
                    return (
                      <div
                        key={course.id}
                        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-blue-100/50 dark:border-gray-700/50 p-6 hover:shadow-xl transition-all duration-300 group hover:scale-105"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                              <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-1">
                                {course.title}
                              </h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {course.instructorName || 'Unknown Instructor'}
                              </p>
                            </div>
                          </div>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            course.isPublished
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                          }`}>
                            {course.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </div>
                       
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                          {course.description || 'No description available'}
                        </p>
                       
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>{course.studentsCount || 0} students</span>
                          <span>{formatTimeAgo(course.createdAt)}</span>
                        </div>
                       
                        <div className="mt-4 flex space-x-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline">
                            <Settings className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {t('admin.courses.noCourses', 'No Courses Found')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {t('admin.courses.noCoursesDescription', 'There are no courses in the system yet.')}
                  </p>
                  <Button className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700">
                    <Plus className="h-4 w-4 mr-2" />
                    {t('admin.courses.createCourse', 'Create Course')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )
     
      case 'sessions':
        return (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-blue-100/50 dark:border-gray-700/50 shadow-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-blue-100/50 dark:border-gray-700/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t('admin.sessions.title', 'Google Meet Sessions')}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {t('admin.sessions.subtitle', 'Manage Google Meet sessions and recordings')}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleRefresh}
                    variant="outline"
                    className="flex items-center"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <Button
                    onClick={() => setShowCreateSessionModal(true)}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t('admin.sessions.scheduleSession', 'Schedule Meet Session')}
                  </Button>
                </div>
              </div>
            </div>
           
            <div className="p-6">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin-slow rounded-full h-8 w-8 border-4 border-green-200 border-t-green-600"></div>
                </div>
              ) : sessions.length > 0 ? (
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      actionLoading={actionLoading}
                      onAddRecording={handleAddRecording}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Globe className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {t('admin.sessions.noSessions', 'No Sessions Found')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {t('admin.sessions.noSessionsDescription', 'There are no Google Meet sessions scheduled or live.')}
                  </p>
                  <Button
                    onClick={() => setShowCreateSessionModal(true)}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t('admin.sessions.scheduleSession', 'Schedule Meet Session')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )
     
      case 'analytics':
        return (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-blue-100/50 dark:border-gray-700/50 shadow-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-blue-100/50 dark:border-gray-700/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t('admin.analytics.title', 'Platform Analytics')}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {t('admin.analytics.subtitle', 'Detailed insights and platform metrics')}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleRefresh}
                    variant="outline"
                    className="flex items-center"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <Button
                    onClick={handleExportData}
                    className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {t('admin.analytics.exportData', 'Export Data')}
                  </Button>
                </div>
              </div>
            </div>
           
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Platform Overview */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-blue-100/50 dark:border-gray-700/50 p-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Platform Overview</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total Storage Used</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatFileSize(stats.storageUsed * 1024 * 1024)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Active Users (Last 30 days)</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {users.filter(u => u.lastLogin && (new Date() - new Date(u.lastLogin)) < 30 * 24 * 60 * 60 * 1000).length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total Recording Duration</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatDuration(stats.totalDuration * 60)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Google Meet Sessions</span>
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {stats.meetSessions}
                      </span>
                    </div>
                  </div>
                </div>
                {/* User Distribution */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-blue-100/50 dark:border-gray-700/50 p-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">User Distribution</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Students</span>
                      <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                        {users.filter(u => u.role === 'student').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Teachers</span>
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {users.filter(u => u.role === 'teacher').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Admins</span>
                      <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                        {users.filter(u => u.role === 'admin').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Pending Approval</span>
                      <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                        {users.filter(u => !u.isActive && u.approvalStatus === 'pending').length}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Session Statistics */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-blue-100/50 dark:border-gray-700/50 p-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Session Statistics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total Sessions</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {sessions.length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Recorded Sessions</span>
                      <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                        {stats.recordedSessions}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Upcoming Sessions</span>
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {stats.upcomingSessions}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Google Meet Integration</span>
                      <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                        {stats.meetSessions > 0 ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Recent Recordings */}
                <div className="lg:col-span-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-blue-100/50 dark:border-gray-700/50 p-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Recordings</h4>
                  <div className="space-y-3">
                    {recordings.slice(0, 5).map((recording) => {
                      const formatTimeAgo = (date) => {
                        if (!date) return 'Never'
                        const now = new Date()
                        const diff = Math.floor((now - new Date(date)) / 1000)
                        if (diff < 60) return 'Just now'
                        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
                        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
                        if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`
                        return new Date(date).toLocaleDateString()
                      }
                      const formatFileSize = (bytes) => {
                        if (!bytes) return '0 B'
                        const sizes = ['B', 'KB', 'MB', 'GB']
                        const i = Math.floor(Math.log(bytes) / Math.log(1024))
                        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
                      }
                      return (
                        <div key={recording.id} className="flex items-center justify-between p-4 rounded-xl bg-white/50 dark:bg-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-600/80 transition-colors duration-200">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {recording.title || 'Untitled Recording'}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {recording.instructorName || recording.createdBy} • {formatTimeAgo(recording.createdAt)}
                                {recording.meetLink && ' • Google Meet'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                            <span>{recording.duration || 0} min</span>
                            <span>{formatFileSize((recording.fileSize || 0) * 1024 * 1024)}</span>
                          </div>
                        </div>
                      )
                    })}
                    {recordings.length === 0 && (
                      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                        No recordings available
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-blue-100/50 dark:border-gray-700/50 p-8 shadow-lg">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Coming Soon
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                This section is under development.
              </p>
            </div>
          </div>
        )
    }
  }, [activeTab, loading, indexError, error, statCards, statsLoading, quickActions, recentActivities, filteredUsers, courses, sessions, recordings, actionLoading, handleApproveUser, handleDeactivateUser, handleReactivateUser, handleChangeUserRole, handleAddRecording, handleRefresh, handleCreateIndex, handleExportData, t, users, stats, formatFileSize, formatDuration])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center lg:text-left">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 bg-clip-text text-transparent mb-3">
              {t('admin.dashboard.title', 'Admin Dashboard')}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
              {t('admin.dashboard.subtitle', 'Manage your platform and monitor Google Meet sessions')}
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="hidden lg:flex items-center border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>
      {/* Tabs */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-blue-100/50 dark:border-gray-700/50 p-2 shadow-lg">
        <nav className="flex space-x-2 rtl:space-x-reverse overflow-x-auto">
          {['dashboard', 'users', 'courses', 'sessions', 'analytics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 lg:flex-none px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50'
              }`}
            >
              {t(`admin.tabs.${tab}`, tab.charAt(0).toUpperCase() + tab.slice(1))}
            </button>
          ))}
        </nav>
      </div>
      {/* Content */}
      <div className="animate-fade-in">
        {renderTabContent()}
      </div>

      {/* Create Session Modal */}
      {showCreateSessionModal && (
        <CreateSessionModal
          onClose={() => setShowCreateSessionModal(false)}
          onSuccess={handleSessionCreated}
        />
      )}
    </div>
  )
}

// Helper functions (unchanged)
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
  const secs = Math.floor(seconds % 60)
  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default AdminDashboard