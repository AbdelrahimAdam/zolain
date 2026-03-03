// pages/teacher/CourseManagement.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
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
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'

const TeacherCourseManagement = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [actionLoading, setActionLoading] = useState({})

  const teacherId = user?.uid

  useEffect(() => {
    if (teacherId) {
      loadCourses()
    }
  }, [teacherId])

  const loadCourses = async () => {
    try {
      setLoading(true)
      const coursesData = await courseService.getCoursesByInstructor(teacherId)
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

  const handleEdit = (courseId) => {
    navigate(`/teacher/courses/${courseId}/edit`)
  }

  const handleView = (courseId) => {
    // For teacher, maybe preview the course page
    window.open(`/courses/${courseId}`, '_blank')
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
    totalStudents: courses.reduce((sum, c) => sum + (c.studentsCount || 0), 0)
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
            Manage the courses you teach
          </p>
        </div>
        <Button
          onClick={() => navigate('/teacher/courses/new')}
          className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Course
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          label="Total Courses"
          value={stats.total}
          icon={BookOpen}
          color="from-blue-500 to-cyan-500"
        />
        <StatCard
          label="Published"
          value={stats.published}
          icon={CheckCircle}
          color="from-green-500 to-emerald-500"
        />
        <StatCard
          label="Draft"
          value={stats.draft}
          icon={Clock}
          color="from-yellow-500 to-orange-500"
        />
        <StatCard
          label="Total Students"
          value={stats.totalStudents}
          icon={Users}
          color="from-purple-500 to-pink-500"
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

      {/* Courses Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-3xl border border-blue-100/50 dark:border-gray-700/50 overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              {/* Course Image */}
              <div className="h-48 bg-gradient-to-br from-blue-500 to-cyan-500 relative">
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
                  <span className={`px-3 py-1 rounded-full text-xs font-medium shadow-lg ${
                    course.isPublished
                      ? 'bg-green-500 text-white'
                      : 'bg-yellow-500 text-white'
                  }`}>
                    {course.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4">
                  <span className="px-3 py-1 bg-black/50 backdrop-blur-sm text-white rounded-full text-xs">
                    {course.level || 'All levels'}
                  </span>
                </div>
              </div>

              {/* Course Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg line-clamp-2 flex-1">
                    {course.title}
                  </h3>
                </div>

                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                  {course.shortDescription || course.description || 'No description provided'}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {course.studentsCount || 0}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(course.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {course.instructorName?.charAt(0) || 'I'}
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[100px]">
                      {course.instructorName}
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleView(course.id)} title="View">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleEdit(course.id)} title="Edit">
                      <Edit className="h-4 w-4" />
                    </Button>
                    {course.isPublished ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUnpublishCourse(course.id)}
                        disabled={actionLoading[course.id]}
                        title="Unpublish"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handlePublishCourse(course.id)}
                        disabled={actionLoading[course.id]}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                        title="Publish"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white/50 dark:bg-gray-800/50 rounded-3xl border border-blue-100/50 dark:border-gray-700/50">
          <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No courses found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Create your first course to start teaching'
            }
          </p>
          <Button
            onClick={() => navigate('/teacher/courses/new')}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Course
          </Button>
        </div>
      )}
    </div>
  )
}

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl border border-blue-100/50 dark:border-gray-700/50 p-6 shadow-lg hover:shadow-xl transition group">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </div>
)

export default TeacherCourseManagement