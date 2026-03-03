// pages/admin/CourseManagement.js
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
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
  TrendingUp,
  MoreVertical,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'

const CourseManagement = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [actionLoading, setActionLoading] = useState({})

  useEffect(() => {
    loadCourses()
  }, [])

  const loadCourses = async () => {
    try {
      setLoading(true)
      const coursesData = await courseService.getAllCourses()
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
      course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructorName?.toLowerCase().includes(searchTerm.toLowerCase())
    
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Course Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage all courses and learning content
          </p>
        </div>
        <Button
          onClick={() => navigate('/admin/courses/new')}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Course
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Total Courses" value={stats.total} icon={BookOpen} color="blue" />
        <StatCard label="Published" value={stats.published} icon={CheckCircle} color="green" />
        <StatCard label="Draft" value={stats.draft} icon={Clock} color="yellow" />
        <StatCard label="Total Students" value={stats.totalStudents} icon={Users} color="purple" />
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
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
              <option value="draft">Draft</option>
            </select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            actionLoading={actionLoading}
            onPublish={handlePublishCourse}
            onUnpublish={handleUnpublishCourse}
            onEdit={() => navigate(`/admin/courses/${course.id}/edit`)}
            onView={() => navigate(`/courses/${course.id}`)}
          />
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
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
            onClick={() => navigate('/admin/courses/new')}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Course
          </Button>
        </div>
      )}
    </div>
  )
}

// Stat Card Component
const StatCard = ({ label, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
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

// Course Card Component
const CourseCard = ({ course, actionLoading, onPublish, onUnpublish, onEdit, onView }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300">
      {/* Course Image */}
      <div className="h-48 bg-gradient-to-br from-purple-500 to-pink-500 relative">
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="h-12 w-12 text-white opacity-80" />
          </div>
        )}
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            course.isPublished
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
          }`}>
            {course.isPublished ? 'Published' : 'Draft'}
          </span>
        </div>
      </div>

      {/* Course Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-white text-lg line-clamp-2">
            {course.title}
          </h3>
        </div>

        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
          {course.description || 'No description provided'}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              {course.studentsEnrolled || 0} students
            </span>
            <span className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {course.instructorName?.charAt(0) || 'I'}
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[120px]">
              {course.instructorName}
            </span>
          </div>

          <div className="flex space-x-2">
            <Button size="sm" variant="outline" onClick={onView}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            {course.isPublished ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onUnpublish(course.id)}
                disabled={actionLoading[course.id]}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => onPublish(course.id)}
                disabled={actionLoading[course.id]}
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CourseManagement