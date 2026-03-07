// pages/teacher/TeacherStudents.js
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../hooks/useAuth'
import { userService } from '../../services'
import Button from '../../components/UI/Button.jsx'
import LoadingSpinner from '../../components/UI/LoadingSpinner.jsx'
import {
  Users,
  Search,
  Filter,
  Mail,
  MessageCircle,
  Eye,
  MoreVertical,
  TrendingUp,
  BookOpen,
  Clock,
  Award
} from 'lucide-react'

const TeacherStudents = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const teacherId = user?.uid

  useEffect(() => {
    if (teacherId) {
      loadStudents()
    }
  }, [teacherId])

  const loadStudents = async () => {
    try {
      setLoading(true)
      // Fetch only active students – this query is now allowed by security rules
      const allUsers = await userService.getAllUsers({ 
        role: 'student', 
        status: 'active' 
      })
      setStudents(allUsers)
    } catch (error) {
      console.error('Error loading students:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredStudents = students.filter(student =>
    student.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    total: students.length,
    active: students.filter(s => s.lastLogin && (Date.now() - new Date(s.lastLogin).getTime()) < 7 * 24 * 60 * 60 * 1000).length,
    newThisWeek: students.filter(s => s.createdAt && (Date.now() - new Date(s.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000).length
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
            My Students
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and communicate with your students
          </p>
        </div>
        <Button variant="outline" className="border-blue-300 dark:border-blue-700">
          <Mail className="h-4 w-4 mr-2" />
          Message All
        </Button>
      </div>

      {/* Stats - two columns on mobile */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3">
        <StatCard
          label="Total Students"
          value={stats.total}
          icon={Users}
          color="from-blue-500 to-cyan-500"
        />
        <StatCard
          label="Active This Week"
          value={stats.active}
          icon={TrendingUp}
          color="from-green-500 to-emerald-500"
        />
        <StatCard
          label="New This Week"
          value={stats.newThisWeek}
          icon={Award}
          color="from-purple-500 to-pink-500"
        />
      </div>

      {/* Search */}
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl border border-blue-100/50 dark:border-gray-700/50 p-4 sm:p-6 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search students by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-blue-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <Button variant="outline" className="border-blue-200 dark:border-gray-600">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Students Grid - two columns on mobile */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {filteredStudents.map((student) => (
          <StudentCard key={student.id} student={student} />
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-12 bg-white/50 dark:bg-gray-800/50 rounded-3xl border border-blue-100/50 dark:border-gray-700/50">
          <Users className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No students found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm
              ? 'Try adjusting your search terms'
              : 'You currently have no students assigned'
            }
          </p>
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

// Student Card Component (responsive)
const StudentCard = ({ student }) => {
  return (
    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-blue-100/50 dark:border-gray-700/50 p-3 sm:p-4 hover:shadow-xl transition-all duration-300 hover:scale-105 flex flex-col h-full">
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-sm sm:text-lg font-bold flex-shrink-0">
          {student.displayName?.charAt(0) || student.email?.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
            {student.displayName || 'No Name'}
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
            {student.email}
          </p>
          <p className="text-green-600 dark:text-green-400 text-xs font-medium mt-1">
            Active Student
          </p>
        </div>
      </div>

      <div className="space-y-2 mb-3 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400">Last Active</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {student.lastLogin 
              ? new Date(student.lastLogin).toLocaleDateString()
              : 'Never'
            }
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400">Joined</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {student.createdAt 
              ? new Date(student.createdAt).toLocaleDateString()
              : 'Unknown'
            }
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400">Courses</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {student.enrolledCourses || 0}
          </span>
        </div>
      </div>

      <div className="flex space-x-1 mt-auto">
        <Button variant="outline" size="xs" className="flex-1">
          <MessageCircle className="h-3 w-3 mr-1" />
          <span className="text-xs">Msg</span>
        </Button>
        <Button variant="outline" size="xs">
          <Eye className="h-3 w-3" />
        </Button>
        <Button variant="outline" size="xs">
          <MoreVertical className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}

export default TeacherStudents