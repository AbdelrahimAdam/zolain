// pages/student/StudentCourses.js
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../hooks/useAuth'
import { courseService } from '../../services'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/UI/Button.jsx'
import LoadingSpinner from '../../components/UI/LoadingSpinner.jsx'
import {
  BookOpen,
  Search,
  Filter,
  Users,
  Clock,
  Star,
  PlayCircle,
  Bookmark,
  TrendingUp,
  Award
} from 'lucide-react'

const StudentCourses = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [enrolledCourses, setEnrolledCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [error, setError] = useState(null)
  const [enrolling, setEnrolling] = useState({})

  const studentId = user?.uid

  useEffect(() => {
    if (studentId) {
      loadCourses()
    }
  }, [studentId])

  const loadCourses = async () => {
    try {
      setLoading(true)
      setError(null)
      const [allCourses, enrolled] = await Promise.all([
        courseService.getPublishedCourses(50),
        courseService.getEnrolledCourses(studentId)
      ])
      setCourses(allCourses)
      setEnrolledCourses(enrolled)
    } catch (error) {
      console.error('Error loading courses:', error)
      setError('Failed to load courses. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleEnrollCourse = async (courseId) => {
    try {
      setEnrolling(prev => ({ ...prev, [courseId]: true }))
      setError(null)
      await courseService.enrollStudent(courseId, studentId)
      navigate(`/student/courses/${courseId}`)
    } catch (error) {
      console.error('Error enrolling in course:', error)
      setError('Failed to enroll. Please try again.')
    } finally {
      setEnrolling(prev => ({ ...prev, [courseId]: false }))
    }
  }

  const handleContinueCourse = (courseId) => {
    navigate(`/student/courses/${courseId}`)
  }

  const isEnrolled = (courseId) => {
    return enrolledCourses.some(course => course.id === courseId)
  }

  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructorName?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = 
      categoryFilter === 'all' ||
      course.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  const stats = {
    enrolled: enrolledCourses.length,
    completed: enrolledCourses.filter(c => c.progress === 100).length,
    inProgress: enrolledCourses.filter(c => c.progress > 0 && c.progress < 100).length
  }

  const formatDuration = (minutes) => {
    if (!minutes) return '0h 0m'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
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
            Browse Courses
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Discover and enroll in new learning opportunities
          </p>
        </div>
        <Button onClick={loadCourses} variant="outline" className="border-blue-300 dark:border-blue-700">
          <TrendingUp className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats - two columns on mobile */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard
          label="Enrolled"
          value={stats.enrolled}
          icon={BookOpen}
          color="from-blue-500 to-cyan-500"
        />
        <StatCard
          label="In Progress"
          value={stats.inProgress}
          icon={Clock}
          color="from-yellow-500 to-orange-500"
        />
        <StatCard
          label="Completed"
          value={stats.completed}
          icon={Award}
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
                placeholder="Search courses by title, description, or instructor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-blue-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-3 rounded-xl border border-blue-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="programming">Programming</option>
              <option value="design">Design</option>
              <option value="business">Business</option>
              <option value="marketing">Marketing</option>
              <option value="language">Language</option>
            </select>
            <Button variant="outline" className="border-blue-200 dark:border-gray-600">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50/80 dark:bg-red-900/30 backdrop-blur-lg border border-red-200/50 dark:border-red-800/50 rounded-2xl p-4 flex items-center">
          <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-500">✕</button>
        </div>
      )}

      {/* Courses Grid - two columns on mobile */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {filteredCourses.map((course) => {
          const enrolled = isEnrolled(course.id)
          const isEnrolling = enrolling[course.id]
          
          return (
            <div
              key={course.id}
              className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-blue-100/50 dark:border-gray-700/50 overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 flex flex-col h-full"
            >
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
                  {enrolled ? (
                    <span className="px-2 py-0.5 bg-green-500 text-white rounded-full text-xs font-medium shadow-lg">
                      Enrolled
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-blue-500 text-white rounded-full text-xs font-medium shadow-lg">
                      Available
                    </span>
                  )}
                </div>
                <div className="absolute bottom-2 left-2">
                  <span className="px-2 py-0.5 bg-black/50 backdrop-blur-sm text-white rounded-full text-xs">
                    {formatDuration(course.duration)}
                  </span>
                </div>
              </div>

              {/* Course Content */}
              <div className="p-3 sm:p-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base line-clamp-2 flex-1">
                    {course.title}
                  </h3>
                  {course.isFeatured && (
                    <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 fill-current ml-1 flex-shrink-0" />
                  )}
                </div>

                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-2 line-clamp-2 flex-1">
                  {course.description || 'No description provided'}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {course.studentsCount || 0}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {course.lessonsCount || 0}
                    </span>
                  </div>
                  {course.level && (
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      course.level === 'beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                      course.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                      {course.level}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {course.instructorName?.charAt(0) || 'I'}
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[60px] sm:max-w-[80px]">
                      {course.instructorName}
                    </span>
                  </div>

                  <div className="flex space-x-1">
                    {enrolled ? (
                      <Button 
                        size="xs"
                        onClick={() => handleContinueCourse(course.id)}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-2 py-1"
                      >
                        <PlayCircle className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">Continue</span>
                        <span className="sm:hidden">Go</span>
                      </Button>
                    ) : (
                      <Button 
                        size="xs"
                        onClick={() => handleEnrollCourse(course.id)}
                        disabled={isEnrolling}
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs px-2 py-1"
                      >
                        {isEnrolling ? (
                          <LoadingSpinner size="xs" className="mr-1" />
                        ) : (
                          'Enroll'
                        )}
                      </Button>
                    )}
                    <Button variant="outline" size="xs" className="border-blue-200 dark:border-gray-600 px-2 py-1">
                      <Bookmark className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12 bg-white/50 dark:bg-gray-800/50 rounded-3xl border border-blue-100/50 dark:border-gray-700/50">
          <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No courses found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm || categoryFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'No courses are currently available'
            }
          </p>
        </div>
      )}
    </div>
  )
}

const StatCard = ({ label, value, icon: Icon, color }) => (
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

export default StudentCourses