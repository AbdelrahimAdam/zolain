// pages/teacher/TeacherCourses.js
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { courseService } from '../../services'
import Button from '../../components/UI/Button.jsx'
import LoadingSpinner from '../../components/UI/LoadingSpinner.jsx'
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Edit,
  Eye,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'

const TeacherCourses = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [actionLoading, setActionLoading] = useState({})

  useEffect(() => {
    if (user?.uid) {
      loadCourses()
    }
  }, [user])

  const loadCourses = async () => {
    try {
      setLoading(true)
      // Fetch only courses taught by this teacher
      const coursesData = await courseService.getCoursesByInstructor(user.uid, {
        includeUnpublished: true
      })
      setCourses(coursesData)
    } catch (error) {
      console.error('Error loading courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePublishCourse = async (courseId) => {
    try {
      setActionLoading(prev => ({ ...prev, [courseId]: true }))
      await courseService.publishCourse(courseId)
      await loadCourses()
    } catch (error) {
      console.error('Error publishing course:', error)
    } finally {
      setActionLoading(prev => ({ ...prev, [courseId]: false }))
    }
  }

  const handleUnpublishCourse = async (courseId) => {
    try {
      setActionLoading(prev => ({ ...prev, [courseId]: true }))
      await courseService.unpublishCourse(courseId)
      await loadCourses()
    } catch (error) {
      console.error('Error unpublishing course:', error)
    } finally {
      setActionLoading(prev => ({ ...prev, [courseId]: false }))
    }
  }

  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'published' && course.isPublished) ||
      (statusFilter === 'draft' && !course.isPublished)

    return matchesSearch && matchesStatus
  })

  const stats = {
    total: courses.length,
    published: courses.filter(c => c.isPublished).length,
    draft: courses.filter(c => !c.isPublished).length,
    totalStudents: courses.reduce((sum, c) => sum + (c.studentsEnrolled || 0), 0)
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
            My Courses
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your courses and content
          </p>
        </div>
        <Button
          onClick={() => navigate('/teacher/courses/new')}
          className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Course
        </Button>
      </div>

      {/* Stats - two columns on mobile */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-4">
        <StatCard label="Total Courses" value={stats.total} icon={BookOpen} color="blue" />
        <StatCard label="Published" value={stats.published} icon={CheckCircle} color="green" />
        <StatCard label="Draft" value={stats.draft} icon={Clock} color="yellow" />
        <StatCard label="Total Students" value={stats.totalStudents} icon={Users} color="purple" />
      </div>

      {/* Filters */}
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl border border-blue-100/50 dark:border-gray-700/50 p-4 sm:p-6 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search your courses..."
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
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
            <Button variant="outline" className="border-blue-200 dark:border-gray-600">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Courses Grid - two columns on mobile */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {filteredCourses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            actionLoading={actionLoading}
            onPublish={handlePublishCourse}
            onUnpublish={handleUnpublishCourse}
            onEdit={() => navigate(`/teacher/courses/${course.id}/edit`)}
            onView={() => navigate(`/courses/${course.id}`)}
          />
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12 bg-white/50 dark:bg-gray-800/50 rounded-3xl border border-blue-100/50 dark:border-gray-700/50">
          <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No courses found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first course'
            }
          </p>
          <Button
            onClick={() => navigate('/teacher/courses/new')}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Course
          </Button>
        </div>
      )}
    </div>
  )
}

// Stat Card Component (responsive)
const StatCard = ({ label, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  }

  return (
    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl border border-blue-100/50 dark:border-gray-700/50 p-4 sm:p-6 shadow-lg hover:shadow-xl transition group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
        </div>
        <div className={`p-2 sm:p-3 rounded-xl ${colorClasses[color]}`}>
          <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
      </div>
    </div>
  )
}

// Course Card Component (responsive)
const CourseCard = ({ course, actionLoading, onPublish, onUnpublish, onEdit, onView }) => {
  return (
    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-blue-100/50 dark:border-gray-700/50 overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 flex flex-col h-full">
      {/* Course Image */}
      <div className="h-28 sm:h-36 bg-gradient-to-br from-blue-500 to-cyan-500 relative">
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-white opacity-80" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            course.isPublished
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
          }`}>
            {course.isPublished ? 'Published' : 'Draft'}
          </span>
        </div>
      </div>

      {/* Course Content */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base line-clamp-2 mb-1">
          {course.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-2 line-clamp-2 flex-1">
          {course.description || 'No description provided'}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
          <span className="flex items-center">
            <Users className="h-3 w-3 mr-1" />
            {course.studentsEnrolled || 0}
          </span>
          <span className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : 'N/A'}
          </span>
        </div>

        <div className="flex justify-end space-x-1 mt-auto">
          <Button size="xs" variant="outline" onClick={onView}>
            <Eye className="h-3 w-3" />
          </Button>
          <Button size="xs" variant="outline" onClick={onEdit}>
            <Edit className="h-3 w-3" />
          </Button>
          {course.isPublished ? (
            <Button
              size="xs"
              variant="outline"
              onClick={() => onUnpublish(course.id)}
              disabled={actionLoading[course.id]}
            >
              <XCircle className="h-3 w-3" />
            </Button>
          ) : (
            <Button
              size="xs"
              onClick={() => onPublish(course.id)}
              disabled={actionLoading[course.id]}
            >
              <CheckCircle className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default TeacherCourses