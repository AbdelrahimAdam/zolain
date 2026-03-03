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
      // No need to filter further; the query already returns only active students
      setStudents(allUsers)
    } catch (error) {
      console.error('Error loading students:', error)
      // Optional: show a user-friendly toast/notification here
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Students</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and communicate with your students
          </p>
        </div>
        <Button variant="outline">
          <Mail className="h-4 w-4 mr-2" />
          Message All
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Students</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active This Week</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.active}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">New This Week</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.newThisWeek}</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search students by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredStudents.map((student) => (
          <div
            key={student.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {student.displayName?.charAt(0) || student.email?.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                  {student.displayName || 'No Name'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {student.email}
                </p>
                <p className="text-green-600 dark:text-green-400 text-xs font-medium mt-1">
                  Active Student
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Last Active</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {student.lastLogin 
                    ? new Date(student.lastLogin).toLocaleDateString()
                    : 'Never'
                  }
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Joined</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {student.createdAt 
                    ? new Date(student.createdAt).toLocaleDateString()
                    : 'Unknown'
                  }
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Courses</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {student.enrolledCourses || 0}
                </span>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" className="flex-1">
                <MessageCircle className="h-4 w-4 mr-2" />
                Message
              </Button>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-12">
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

export default TeacherStudents